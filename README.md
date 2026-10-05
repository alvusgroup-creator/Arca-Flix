# Arca Flix

Plataforma cristã de streaming para crianças e famílias: séries, filmes, músicas, histórias bíblicas, desenhos para colorir e estudos — com perfis familiares, controle parental e assinatura.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · Supabase (Postgres, Auth, Storage) · Stripe · Bunny Stream · Resend · Zod · React Hook Form · Vercel.

---

## 1. Instalar e executar

Requisitos: **Node.js 22.6+** (recomendado 24) e npm.

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>.

### Modo demonstração

Sem as variáveis do Supabase a app arranca em **modo demonstração**:

- Login/cadastro aceitam qualquer e-mail e senha com 8+ caracteres.
- Sessão, perfis, Minha Lista, progresso e assinatura ficam em cookies httpOnly.
- O catálogo vem de `lib/demo/data.ts` (imagens em `public/demo/`).
- Vídeos usam um stream HLS público de teste; o checkout é simulado.
- Planos e preços aparecem com o selo **"Exemplo"**.

Assim que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existirem, tudo passa a usar o banco — nenhuma lógica depende dos dados demo.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Gera os tipos de rotas e roda `tsc --noEmit` |
| `npm run db:seed:generate` | Regenera `supabase/seed.sql` a partir dos dados demo |
| `npm run stripe:sync` | Cria/atualiza no Stripe os produtos e preços dos planos ativos, grava os `price_...` no banco e configura o portal do cliente |
| `npm run stripe:listen` | Encaminha os webhooks do Stripe (teste) para `localhost:3000` — rode junto com `npm run dev` |

---

## 2. Estrutura

```
app/                 Rotas (App Router)
  (auth)/            login, register, forgot-password, reset-password
  (app)/             Área logada com sidebar/bottom nav: browse, series, movies,
                     music, colorir, estudos, search, my-list, content, settings
  profiles/          "Quem vai assistir?"
  watch/[id]/        Player (episódio, filme ou série → retoma)
  plans, checkout, success
  admin/             Painel administrativo (role = admin)
  api/webhooks/stripe  Webhook do Stripe
  api/coloring/[slug]  Download protegido de materiais
components/          UI partilhada (ui/ = shadcn, layout/, content/, shared/, brand/)
features/            Domínios: auth, profiles, favorites, player, music, coloring,
                     studies, search, settings, subscriptions (actions + componentes)
services/            Acesso a dados (Supabase ↔ demo), sempre no servidor
lib/                 Clientes (supabase, stripe, bunny, email), env, demo store
types/  utils/  hooks/
supabase/migrations  Schema + RLS
supabase/seed.sql    Dados de demonstração
proxy.ts             Renovação de sessão e redirecionamentos (ex-"middleware")
```

Regras importantes:

- **Assinatura:** `hasActiveSubscription(userId)` em `services/subscriptions.ts` é a única regra de acesso premium (espelhada em SQL por `public.has_active_subscription`). Rotas premium usam `requireSubscription()`.
- **Perfil ativo:** cookie httpOnly `af_profile`, validado contra os perfis da conta a cada pedido (`requireActiveProfile()`).
- **Controle parental:** `filterForProfile()` aplica classificação máxima e categorias bloqueadas em catálogo, busca, recomendações e páginas de detalhe.
- Segredos (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `BUNNY_API_KEY`…) só são lidos em `lib/env.server.ts` (marcado `server-only`).

---

## 3. Configurar o Supabase

1. Crie um projeto em <https://supabase.com>.
2. Em **Project Settings › API** copie `URL`, `anon key` e `service_role key` para `.env.local` (veja `.env.example`).
3. Em **Authentication › URL Configuration**:
   - *Site URL*: `http://localhost:3000` (e o domínio de produção depois).
   - *Redirect URLs*: `http://localhost:3000/auth/callback` e `https://SEU-DOMINIO/auth/callback`.
4. (Opcional) Login com Google: **Authentication › Providers › Google**, informe Client ID/Secret do Google Cloud. O botão já está pronto.

### Executar as migrations

Com a [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push            # aplica supabase/migrations
psql "$DATABASE_URL" -f supabase/seed.sql   # opcional: dados demo
```

Sem CLI: cole, por ordem, o conteúdo de cada arquivo de `supabase/migrations/` (`20260930000000_init.sql`, depois `20261004000000_playback_sessions.sql`) e por fim `supabase/seed.sql` no **SQL Editor** do painel.

A migration cria tabelas, enums, índices, triggers, **Row Level Security** em todas as tabelas e os buckets `images` (público), `coloring` e `audio` (privados — servidos por URL assinada após verificar a assinatura).

### Tornar um utilizador administrador

```sql
update public.profiles set role = 'admin' where email = 'voce@exemplo.com';
```

---

## 4. Configurar o Stripe

1. Em <https://dashboard.stripe.com> (modo de teste), crie um **Produto** para cada plano com um **Preço recorrente** (mensal ou anual).
2. Copie o `price_...` de cada preço para `subscription_plans.stripe_price_id`:

   ```sql
   update public.subscription_plans set stripe_price_id = 'price_123' where slug = 'mensal';
   ```

   Os valores exibidos vêm da tabela `subscription_plans` — nada é fixo na interface. Mantenha `price` igual ao valor do Stripe.
3. Coloque `STRIPE_SECRET_KEY` e `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` no `.env.local`.
4. Ative o **Customer Portal** (Settings › Billing › Customer portal) para o botão "Gerenciar pagamento".

### Webhook

O acesso é liberado **apenas** pelo webhook (`/api/webhooks/stripe`), que valida a assinatura do evento. A página `/success` só lê o estado.

Local:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copie o "whsec_..." exibido para STRIPE_WEBHOOK_SECRET
```

Produção: em **Developers › Webhooks** adicione `https://SEU-DOMINIO/api/webhooks/stripe` com os eventos:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## 5. Configurar o Bunny Stream

1. Crie uma **Video Library** em <https://dash.bunny.net>.
2. Copie `Library ID`, `API Key` (da biblioteca) e o **CDN hostname** (`vz-xxxx.b-cdn.net`) para `BUNNY_LIBRARY_ID`, `BUNNY_API_KEY` e `BUNNY_CDN_HOST`.
3. Proteção recomendada: na pull zone da biblioteca ative **Token Authentication** e copie a chave para `BUNNY_TOKEN_KEY`. O servidor gera URLs HLS assinadas por diretório, válidas por 4h, só para utilizadores com assinatura ativa. Ative também *Allowed referrers* com o seu domínio.
4. Envie os vídeos no Bunny e registe o `video_id` (GUID) em `episodes.video_id` (séries) ou `content.video_id` (filmes). Legendas: envie um `.vtt` com o idioma `pt` — o player procura `captions/pt.vtt`.

Arquivos de vídeo **nunca** passam pela Vercel; o player carrega `playlist.m3u8` direto da CDN (HLS nativo no Safari, `hls.js` carregado sob demanda nos outros navegadores).

---

## 6. E-mail (Resend)

Defina `RESEND_API_KEY` e `EMAIL_FROM` (domínio verificado no Resend). É enviado um e-mail quando a assinatura fica ativa. Os e-mails de autenticação (confirmação, recuperação) são enviados pelo Supabase — configure SMTP do Resend em **Authentication › SMTP Settings** para usar o mesmo remetente.

---

## 7. Deploy na Vercel

1. Envie o repositório para o GitHub e importe-o em <https://vercel.com/new>.
2. Em **Settings › Environment Variables** adicione todas as variáveis do `.env.example` (`NEXT_PUBLIC_APP_URL` = domínio de produção).
3. Deploy. Depois:
   - adicione `https://SEU-DOMINIO/auth/callback` nas Redirect URLs do Supabase;
   - crie o webhook de produção no Stripe e atualize `STRIPE_WEBHOOK_SECRET`;
   - ajuste `images.remotePatterns` em `next.config.ts` se usar outro host de imagens.

---

## 8. Painel administrativo

Em `/admin` (apenas `role = admin`):

- **Conteúdos:** criar/editar séries, filmes, músicas, materiais para colorir e estudos; publicar/despublicar, destacar na Home, categorias, imagens.
- **Séries:** temporadas e episódios, com botão que busca duração e thumbnail direto no Bunny pelo ID do vídeo.
- **Músicas:** álbum (com artista) ou playlist, faixas com upload de áudio (a duração é lida do arquivo).
- **Para colorir:** imagem em alta + PDF opcional. **Estudos:** tipo, referência bíblica e texto.
- **Planos** (preço, limites, benefícios, Stripe Price ID) e **Categorias**.

Uploads vão direto do navegador para o Supabase Storage por URL assinada (nada passa pela Vercel): imagens no bucket público `images`; áudio e PDFs nos buckets privados `audio` e `coloring`, entregues só a assinantes por URL temporária.

## 9. Telas simultâneas, offline e páginas legais

- **Limite de telas:** cada aparelho recebe um cookie `af_device`; o player envia sinal a cada ~10s (`playback_sessions`). Se a conta já estiver tocando no máximo de aparelhos do plano (`max_devices`), o player mostra "Limite de telas atingido". Uma tela pausada há mais de 90s libera a vaga.
- **Offline:** `public/sw.js` (ativo só em produção) guarda os estáticos e mostra `/offline` sem internet. Vídeo e áudio nunca ficam em cache.
- **Pintura online:** `/colorir/[slug]/pintar` — cores, pincel, borracha, desfazer, limpar e baixar PNG. Funciona melhor com desenhos de traço (fundo branco, linhas pretas).
- **Termos e Privacidade:** `/termos` e `/privacidade` são modelos — preencha os campos entre colchetes e peça revisão jurídica (LGPD art. 14, dados de crianças).

## 10. PWA, SEO e acessibilidade

- `app/manifest.ts` + ícones em `public/icons/` permitem "Adicionar à tela inicial".
- Landing (`/`) e `/plans` são indexáveis; área logada, player e admin são `noindex` (metadata + `robots.ts`).
- Navegação por teclado, foco visível, `aria-*` nos controles, atalhos no player (`espaço/k`, `←/→`, `f`, `m`, `c`) e legendas.

## 11. Identidade visual

Logo em `public/brand/` (`logo.png`, `logo-icon.png` com fundo transparente; `logo*.svg` são placeholders que embutem a arte — substitua pelos vetores finais quando existirem). Tokens de cor, raios e movimento em `app/globals.css`: tema claro e fofo (céu lilás-pastel, cartões brancos, sombras arroxeadas), **uva** (`grape-*`) para ações e estados ativos, **lilás** (`lilac-*`) para destaques, **sol/rosa/céu** como toques pontuais. Títulos em Fredoka, texto em Nunito. O player de vídeo é escuro de propósito.

## 12. Próximas evoluções

- Playlists pessoais por perfil.
- E-mails periódicos de novidades (a preferência já existe em Configurações › Notificações).
- Testes automatizados (Playwright) dos fluxos de cadastro, checkout e player.
