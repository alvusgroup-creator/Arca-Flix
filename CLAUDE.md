# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Arca Flix is a Christian streaming platform for kids and families in Brazil. The UI copy is in Brazilian Portuguese: use "você"/"seu", never "a sua"/"o seu". `README.md` covers setup in detail: Supabase, Stripe, Bunny, Resend, Vercel and admin.

## Commands

```bash
npm run dev               # dev server (Turbopack) on :3000
npm run typecheck         # next typegen + tsc --noEmit (run after route changes: typed PageProps/LayoutProps)
npm run lint              # eslint
npm run build
npm run db:seed:generate  # regenerate supabase/seed.sql from lib/demo/data.ts
npm run stripe:sync       # push active plans to Stripe and save price ids to the DB (needs .env.local)
npm run stripe:listen     # forward test webhooks to localhost:3000 (Stripe CLI must be on PATH)
```

There is no test suite. To verify a change, run `typecheck` and then check the running app. For UI work, take screenshots at 1440/1280/768/390.

## Next.js 16 specifics used here

- Session refresh and redirects live in `proxy.ts`, which replaces `middleware.ts`. It uses `getClaims`.
- `params` and `searchParams` are async.
- `next/image` uses `preload`; `priority` is deprecated.
- Error boundaries receive `retry`.
- shadcn uses the **Base UI** style (`base-nova`). Compose with the `render` prop, not `asChild`.

## Architecture

- **Layers.**
  - `app/` holds the routes:
    - `(auth)` has the auth pages;
    - `(app)` is the logged-in shell with sidebar and bottom nav;
    - `watch/[id]` is the player;
    - `admin/` is the admin panel;
    - `api/webhooks/stripe` is the Stripe webhook.
  - `features/<domain>/` holds server actions (`actions.ts`, `"use server"`) and the client components for that domain.
  - `services/*.ts` are `server-only` data access, the only place that queries data.
  - `lib/` holds the clients (Supabase server/client/admin, Stripe, Bunny, email) and the env.
- **Demo mode.** When the Supabase env vars are missing, `isDemoMode` (`lib/env.ts`) is true.
  - Every service then branches to `lib/demo/store.ts`, which keeps state in cookies, and `lib/demo/data.ts` for the catalog.
  - Any new service function needs both branches.
  - Prices shown in demo mode get the "Exemplo" badge.
- **Secrets.** They are read only in `lib/env.server.ts`, which is `server-only`. The service-role client is `lib/supabase/admin.ts`; use it only in the webhook and admin code.
- **Subscription access.**
  - `hasActiveSubscription` / `requireSubscription` in `services/subscriptions.ts` is the single rule.
  - In SQL the same rule is `private.has_active_subscription()`.
  - Only the Stripe webhook writes subscriptions. `/success` just reads them.
- **Profiles and parental control.**
  - The active profile is stored in the httpOnly cookie `af_profile` and validated on every request by `requireActiveProfile()`.
  - `filterForProfile()` applies the max age rating and blocked categories everywhere.
  - When a PIN-protected adult profile exists, kid profiles cannot manage the family. Check with `canManageFamily` / `requireFamilyManager`, and enforce it in actions as well as in the UI.
- **Database.**
  - The schema and RLS are in `supabase/migrations/`.
  - RLS is on for every table.
  - SECURITY DEFINER helpers live in the `private` schema, which is not exposed to the API.
  - Storage buckets: `images` is public; `coloring` and `audio` are private and served through signed URLs.
- **Media.**
  - `lib/bunny.ts` signs HLS URLs.
  - Until Bunny is configured, it falls back to the test stream and test audio (`serverEnv.demoVideoUrl` / `demoAudioUrl`).
  - The player (`features/player`) loads hls.js lazily, uses native HLS when available, and sends heartbeats to `playback_sessions` (with the `af_device` cookie) to enforce the screen limit.

## Styling

- Tailwind v4 tokens are in `app/globals.css` under `@theme inline`:
  - colors: `grape-*` (primary), `lilac-*`, `sun-*`, `surface-0`;
  - utilities: `.veil`, `.reveal`, `.shadow-soft`, `.page-x`;
  - `.shell`, the standard public-page width that matches the hero.
- The landing page (`app/page.tsx`) composes helpers from `features/landing/`; image paths are in `features/landing/media.ts`.
- Never invent numbers, testimonials, ratings or prices in copy. Use placeholders marked "Exemplo".

## Other

- `docs/prompts-*.md` holds the image-generation prompts for the landing and catalog art. The art itself is in `public/landing/` and `public/catalog/`.
- `.claude/agents/mae-testadora.md` is a persona agent: a 45-year-old mother who usability-tests the app with Playwright.
- `.env.local` is gitignored. Never commit it.
