-- ============================================================================
-- Arca Flix — schema inicial
-- ============================================================================

create extension if not exists pgcrypto;

-- Funções auxiliares SECURITY DEFINER vivem em "private": não é exposto pela
-- Data API, então não viram endpoints /rpc públicos.
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.content_type as enum ('series', 'movie', 'music', 'coloring', 'study');
create type public.profile_kind as enum ('kids', 'teen', 'adult');
create type public.account_role as enum ('user', 'admin');
create type public.billing_interval as enum ('month', 'year');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type public.study_kind as enum ('devocional', 'historia', 'estudo', 'atividade', 'versiculo');
create type public.music_collection_kind as enum ('album', 'playlist');

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Conta (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.account_role not null default 'user',
  stripe_customer_id text unique,
  -- Preferências da conta: idioma, notificações.
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

-- Cria a linha em profiles quando um utilizador se regista.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impede que um utilizador promova a si próprio a admin ou altere o cliente Stripe.
-- (select auth.uid()) é null no SQL editor e com service role — esses podem alterar.
create or replace function public.protect_profile_role()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select auth.uid()) is not null and not private.is_admin() then
    new.role = old.role;
    new.stripe_customer_id = old.stripe_customer_id;
  end if;
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Perfis familiares (quem vai assistir) + controle parental
-- ---------------------------------------------------------------------------
create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  avatar text not null default 'lion',
  kind public.profile_kind not null default 'adult',
  max_age_rating text not null default '18' check (max_age_rating in ('L','10','12','14','16','18')),
  pin_hash text,
  allowed_category_ids uuid[] not null default '{}',
  blocked_category_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index user_profiles_user_idx on public.user_profiles (user_id);
create trigger user_profiles_updated_at before update on public.user_profiles
  for each row execute function public.set_updated_at();

create or replace function private.owns_profile(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_profiles where id = p_profile_id and user_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------------
-- Conteúdo (tabela genérica) + extensões por tipo
-- ---------------------------------------------------------------------------
create table public.content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  short_description text not null default '',
  type public.content_type not null,
  thumbnail_url text not null default '',
  banner_url text not null default '',
  poster_url text,
  age_rating text not null default 'L' check (age_rating in ('L','10','12','14','16','18')),
  genres text[] not null default '{}',
  release_date date,
  -- Filmes: vídeo principal (Bunny Stream video id) e duração.
  video_id text,
  duration_seconds integer,
  trailer_video_id text,
  published boolean not null default false,
  featured boolean not null default false,
  view_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_type_idx on public.content (type) where published;
create index content_featured_idx on public.content (featured) where published;
create index content_search_idx on public.content using gin (to_tsvector('portuguese', title || ' ' || description));
create trigger content_updated_at before update on public.content
  for each row execute function public.set_updated_at();

create table public.content_categories (
  content_id uuid not null references public.content (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (content_id, category_id)
);

-- Séries → Temporadas → Episódios
create table public.series (
  content_id uuid primary key references public.content (id) on delete cascade,
  status text not null default 'ongoing' check (status in ('ongoing', 'completed')),
  created_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series (content_id) on delete cascade,
  number integer not null check (number > 0),
  title text not null default '',
  created_at timestamptz not null default now(),
  unique (series_id, number)
);

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  number integer not null check (number > 0),
  title text not null,
  description text not null default '',
  thumbnail_url text not null default '',
  video_id text,
  duration_seconds integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (season_id, number)
);

-- ---------------------------------------------------------------------------
-- Histórico / progresso
-- ---------------------------------------------------------------------------
create table public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  profile_id uuid not null references public.user_profiles (id) on delete cascade,
  content_id uuid not null references public.content (id) on delete cascade,
  episode_id uuid references public.episodes (id) on delete cascade,
  progress_seconds integer not null default 0,
  duration integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint watch_history_unique unique nulls not distinct (profile_id, content_id, episode_id)
);
create index watch_history_profile_idx on public.watch_history (profile_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- Minha lista
-- ---------------------------------------------------------------------------
create table public.favorites (
  profile_id uuid not null references public.user_profiles (id) on delete cascade,
  content_id uuid not null references public.content (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, content_id)
);

-- ---------------------------------------------------------------------------
-- Música
-- ---------------------------------------------------------------------------
create table public.music_artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.music_albums (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null unique references public.content (id) on delete cascade,
  artist_id uuid references public.music_artists (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.music_albums (id) on delete set null,
  artist_id uuid references public.music_artists (id) on delete set null,
  title text not null,
  audio_url text not null,
  cover_url text,
  duration integer not null default 0,
  track_number integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  -- Playlists editoriais têm content_id (aparecem no catálogo);
  -- playlists pessoais têm profile_id.
  content_id uuid unique references public.content (id) on delete cascade,
  profile_id uuid references public.user_profiles (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  check (content_id is not null or profile_id is not null)
);

create table public.playlist_tracks (
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  track_id uuid not null references public.music_tracks (id) on delete cascade,
  position integer not null default 0,
  primary key (playlist_id, track_id)
);

-- ---------------------------------------------------------------------------
-- Para colorir
-- ---------------------------------------------------------------------------
create table public.coloring_materials (
  content_id uuid primary key references public.content (id) on delete cascade,
  category text not null check (category in ('arca-de-noe','jesus','daniel','moises','animais','versiculos','atividades')),
  age_min integer not null default 3,
  age_max integer not null default 10,
  image_url text not null,
  pdf_url text
);

-- ---------------------------------------------------------------------------
-- Estudos bíblicos
-- ---------------------------------------------------------------------------
create table public.studies (
  content_id uuid primary key references public.content (id) on delete cascade,
  kind public.study_kind not null default 'estudo',
  body text not null default '',
  reading_minutes integer not null default 5,
  bible_reference text
);

create table public.study_progress (
  profile_id uuid not null references public.user_profiles (id) on delete cascade,
  content_id uuid not null references public.content (id) on delete cascade,
  percent integer not null default 0 check (percent between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (profile_id, content_id)
);

-- ---------------------------------------------------------------------------
-- Planos e assinaturas
-- ---------------------------------------------------------------------------
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null check (price >= 0), -- centavos
  currency text not null default 'BRL',
  billing_interval public.billing_interval not null,
  max_profiles integer not null default 3,
  max_devices integer not null default 2,
  features text[] not null default '{}',
  stripe_price_id text,
  highlighted boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger subscription_plans_updated_at before update on public.subscription_plans
  for each row execute function public.set_updated_at();

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid references public.subscription_plans (id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status public.subscription_status not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id, updated_at desc);
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Fonte única da regra "tem acesso premium".
create or replace function private.has_active_subscription(p_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user_id
      and status in ('active', 'trialing')
      and (current_period_end is null or current_period_end > now())
  );
$$;

-- ---------------------------------------------------------------------------
-- Notificações e dispositivos
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade, -- null = para todos
  title text not null,
  body text not null default '',
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index devices_user_idx on public.devices (user_id);

-- ---------------------------------------------------------------------------
-- Visualizações (para "mais assistidos" e dashboard admin)
-- ---------------------------------------------------------------------------
create or replace function public.increment_view(p_content_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.content set view_count = view_count + 1 where id = p_content_id and published;
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.user_profiles enable row level security;
alter table public.content enable row level security;
alter table public.content_categories enable row level security;
alter table public.series enable row level security;
alter table public.seasons enable row level security;
alter table public.episodes enable row level security;
alter table public.watch_history enable row level security;
alter table public.favorites enable row level security;
alter table public.music_artists enable row level security;
alter table public.music_albums enable row level security;
alter table public.music_tracks enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.coloring_materials enable row level security;
alter table public.studies enable row level security;
alter table public.study_progress enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.devices enable row level security;

-- Conta
create policy "profiles: ler a própria" on public.profiles for select using (id = (select auth.uid()) or private.is_admin());
create policy "profiles: editar a própria" on public.profiles for update using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles: admin edita" on public.profiles for update using (private.is_admin());

-- Perfis familiares
create policy "user_profiles: dono" on public.user_profiles for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "user_profiles: admin lê" on public.user_profiles for select using (private.is_admin());

-- Catálogo: leitura pública do que está publicado; escrita só admin.
create policy "content: leitura publicada" on public.content for select using (published or private.is_admin());
create policy "content: admin escreve" on public.content for all using (private.is_admin()) with check (private.is_admin());

create policy "categories: leitura" on public.categories for select using (true);
create policy "categories: admin" on public.categories for all using (private.is_admin()) with check (private.is_admin());

create policy "content_categories: leitura" on public.content_categories for select using (true);
create policy "content_categories: admin" on public.content_categories for all using (private.is_admin()) with check (private.is_admin());

create policy "series: leitura" on public.series for select using (true);
create policy "series: admin" on public.series for all using (private.is_admin()) with check (private.is_admin());
create policy "seasons: leitura" on public.seasons for select using (true);
create policy "seasons: admin" on public.seasons for all using (private.is_admin()) with check (private.is_admin());
create policy "episodes: leitura" on public.episodes for select using (published or private.is_admin());
create policy "episodes: admin" on public.episodes for all using (private.is_admin()) with check (private.is_admin());

create policy "music_artists: leitura" on public.music_artists for select using (true);
create policy "music_artists: admin" on public.music_artists for all using (private.is_admin()) with check (private.is_admin());
create policy "music_albums: leitura" on public.music_albums for select using (true);
create policy "music_albums: admin" on public.music_albums for all using (private.is_admin()) with check (private.is_admin());
create policy "music_tracks: leitura" on public.music_tracks for select using (true);
create policy "music_tracks: admin" on public.music_tracks for all using (private.is_admin()) with check (private.is_admin());

create policy "playlists: leitura" on public.playlists for select
  using (content_id is not null or private.owns_profile(profile_id) or private.is_admin());
create policy "playlists: dono" on public.playlists for all
  using (private.owns_profile(profile_id) or private.is_admin())
  with check (private.owns_profile(profile_id) or private.is_admin());
create policy "playlist_tracks: leitura" on public.playlist_tracks for select using (
  exists (select 1 from public.playlists p where p.id = playlist_id
          and (p.content_id is not null or private.owns_profile(p.profile_id) or private.is_admin())));
create policy "playlist_tracks: dono" on public.playlist_tracks for all using (
  exists (select 1 from public.playlists p where p.id = playlist_id
          and (private.owns_profile(p.profile_id) or private.is_admin())));

create policy "coloring: leitura" on public.coloring_materials for select using (true);
create policy "coloring: admin" on public.coloring_materials for all using (private.is_admin()) with check (private.is_admin());
create policy "studies: leitura" on public.studies for select using (true);
create policy "studies: admin" on public.studies for all using (private.is_admin()) with check (private.is_admin());

-- Dados por perfil
create policy "watch_history: dono" on public.watch_history for all
  using (user_id = (select auth.uid()) and private.owns_profile(profile_id))
  with check (user_id = (select auth.uid()) and private.owns_profile(profile_id));
create policy "watch_history: admin lê" on public.watch_history for select using (private.is_admin());

create policy "favorites: dono" on public.favorites for all
  using (private.owns_profile(profile_id)) with check (private.owns_profile(profile_id));

create policy "study_progress: dono" on public.study_progress for all
  using (private.owns_profile(profile_id)) with check (private.owns_profile(profile_id));

-- Planos: leitura pública dos ativos; escrita admin.
create policy "plans: leitura" on public.subscription_plans for select using (active or private.is_admin());
create policy "plans: admin" on public.subscription_plans for all using (private.is_admin()) with check (private.is_admin());

-- Assinaturas: utilizador só lê as suas. Escrita apenas via service role (webhook Stripe).
create policy "subscriptions: ler as próprias" on public.subscriptions for select
  using (user_id = (select auth.uid()) or private.is_admin());

-- Notificações
create policy "notifications: ler" on public.notifications for select
  using (user_id = (select auth.uid()) or user_id is null);
create policy "notifications: marcar lida" on public.notifications for update
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "notifications: admin" on public.notifications for all using (private.is_admin()) with check (private.is_admin());

-- Dispositivos
create policy "devices: dono" on public.devices for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ============================================================================
-- Storage: buckets para mídia (imagens públicas; PDFs e áudio privados)
-- ============================================================================
insert into storage.buckets (id, name, public) values
  ('images', 'images', true),
  ('coloring', 'coloring', false),
  ('audio', 'audio', false)
on conflict (id) do nothing;

-- O bucket "images" é público: as URLs públicas funcionam sem policy de leitura
-- (e sem ela ninguém consegue listar os arquivos pela API).
create policy "media: admin escreve" on storage.objects for all
  using (bucket_id in ('images', 'coloring', 'audio') and private.is_admin())
  with check (bucket_id in ('images', 'coloring', 'audio') and private.is_admin());

-- ============================================================================
-- Endurecimento de funções (lints 0028/0029 do Supabase)
-- ============================================================================
-- Funções de trigger não devem ser chamáveis pela API.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_role() from public, anon, authenticated;

-- Auxiliares de RLS: executáveis pelos papéis (as policies precisam), mas fora do schema exposto.
revoke execute on all functions in schema private from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.owns_profile(uuid) to anon, authenticated, service_role;
grant execute on function private.has_active_subscription(uuid) to authenticated, service_role;

-- Contador de views: só utilizadores autenticados.
revoke execute on function public.increment_view(uuid) from public, anon;
grant execute on function public.increment_view(uuid) to authenticated, service_role;
