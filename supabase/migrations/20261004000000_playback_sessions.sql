-- Telas simultâneas: cada aparelho a reproduzir mantém uma sessão "viva"
-- (heartbeat a cada ~10s). Sessões sem sinal há mais de 90s deixam de contar.

create table public.playback_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_key text not null,
  profile_id uuid references public.user_profiles (id) on delete set null,
  content_id uuid references public.content (id) on delete set null,
  last_seen_at timestamptz not null default now(),
  unique (user_id, device_key)
);
create index playback_sessions_user_idx on public.playback_sessions (user_id, last_seen_at desc);

alter table public.playback_sessions enable row level security;
create policy "playback_sessions: dono" on public.playback_sessions for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
