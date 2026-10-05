// Gera supabase/seed.sql a partir de lib/demo/data.ts (fonte única dos dados DEMO).
// Uso: npm run db:seed:generate   (Node >= 22.6 executa TypeScript diretamente)

import { writeFileSync } from "node:fs"
import {
  demoCategories,
  demoColoring,
  demoContent,
  demoMusic,
  demoNotifications,
  demoPlans,
  demoSeasons,
  demoStudies,
} from "../lib/demo/data.ts"

const q = (v: string | null | undefined) => (v == null ? "null" : `'${v.replace(/'/g, "''")}'`)
const arr = (v: string[]) => `array[${v.map(q).join(", ")}]::text[]`
// IDs estáveis derivados do slug: o seed pode ser reaplicado sem duplicar.
const id = (kind: string, key: string) => `md5(${q(`${kind}:${key}`)})::uuid`

const out: string[] = [
  "-- Dados de DEMONSTRAÇÃO do Arca Flix. Gerado por scripts/generate-seed.ts — não editar à mão.",
  "-- As imagens apontam para /public/demo; troque por URLs do Storage/CDN em produção.",
  "begin;",
  "",
]

for (const c of demoCategories) {
  out.push(`insert into public.categories (id, slug, name) values (${id("cat", c.slug)}, ${q(c.slug)}, ${q(c.name)}) on conflict (slug) do nothing;`)
}
out.push("")

for (const c of demoContent) {
  out.push(
    `insert into public.content (id, title, slug, description, short_description, type, thumbnail_url, banner_url, age_rating, genres, release_date, video_id, duration_seconds, published, featured) values (` +
      [
        id("content", c.slug),
        q(c.title),
        q(c.slug),
        q(c.description),
        q(c.shortDescription),
        q(c.type),
        q(c.thumbnailUrl),
        q(c.bannerUrl),
        q(c.ageRating),
        arr(c.genres),
        c.releaseYear ? q(`${c.releaseYear}-01-01`) : "null",
        // Filmes demo sem vídeo real: cadastre o video_id do Bunny no admin.
        "null",
        c.durationSeconds ?? "null",
        "true",
        String(c.featured),
      ].join(", ") +
      ") on conflict (slug) do nothing;"
  )
  for (const cat of c.categories) {
    out.push(`insert into public.content_categories (content_id, category_id) values (${id("content", c.slug)}, ${id("cat", cat.slug)}) on conflict do nothing;`)
  }
}
out.push("")

for (const c of demoContent.filter((x) => x.type === "series")) {
  out.push(`insert into public.series (content_id) values (${id("content", c.slug)}) on conflict do nothing;`)
}
for (const s of demoSeasons) {
  const slug = demoContent.find((c) => c.id === s.contentId)!.slug
  out.push(`insert into public.seasons (id, series_id, number, title) values (${id("season", s.id)}, ${id("content", slug)}, ${s.number}, ${q(s.title)}) on conflict do nothing;`)
  for (const e of s.episodes) {
    out.push(
      `insert into public.episodes (id, season_id, number, title, description, thumbnail_url, video_id, duration_seconds) values (${id("episode", e.id)}, ${id("season", s.id)}, ${e.number}, ${q(e.title)}, ${q(e.description)}, ${q(e.thumbnailUrl)}, null, ${e.durationSeconds}) on conflict do nothing;`
    )
  }
}
out.push("")

out.push(`insert into public.music_artists (id, name, slug) values (${id("artist", "coral")}, 'Coral Arca Flix', 'coral-arca-flix') on conflict do nothing;`)
for (const m of demoMusic) {
  const cid = id("content", m.content.slug)
  if (m.kind === "album") {
    out.push(`insert into public.music_albums (id, content_id, artist_id) values (${id("album", m.content.slug)}, ${cid}, ${id("artist", "coral")}) on conflict do nothing;`)
  } else {
    out.push(`insert into public.playlists (id, content_id, title) values (${id("playlist", m.content.slug)}, ${cid}, ${q(m.content.title)}) on conflict do nothing;`)
  }
  m.tracks.forEach((t, i) => {
    const album = m.kind === "album" ? id("album", m.content.slug) : "null"
    // audio_url: caminho no bucket privado "audio" (faça upload dos arquivos).
    out.push(
      `insert into public.music_tracks (id, album_id, artist_id, title, audio_url, cover_url, duration, track_number) values (${id("track", t.id)}, ${album}, ${id("artist", "coral")}, ${q(t.title)}, ${q(`${m.content.slug}/${String(i + 1).padStart(2, "0")}.mp3`)}, ${q(t.coverUrl)}, ${t.durationSeconds}, ${t.trackNumber}) on conflict do nothing;`
    )
    if (m.kind === "playlist") {
      out.push(`insert into public.playlist_tracks (playlist_id, track_id, position) values (${id("playlist", m.content.slug)}, ${id("track", t.id)}, ${i}) on conflict do nothing;`)
    }
  })
}
out.push("")

for (const m of demoColoring) {
  out.push(
    `insert into public.coloring_materials (content_id, category, age_min, age_max, image_url, pdf_url) values (${id("content", m.content.slug)}, ${q(m.category)}, ${m.ageMin}, ${m.ageMax}, ${q(m.imageUrl)}, null) on conflict do nothing;`
  )
}
for (const s of demoStudies) {
  out.push(
    `insert into public.studies (content_id, kind, body, reading_minutes, bible_reference) values (${id("content", s.content.slug)}, ${q(s.kind)}, ${q(s.body)}, ${s.readingMinutes}, ${q(s.bibleReference)}) on conflict do nothing;`
  )
}
out.push("")

demoPlans.forEach((p, i) => {
  out.push(
    `insert into public.subscription_plans (name, slug, description, price, currency, billing_interval, max_profiles, max_devices, features, stripe_price_id, highlighted, active, sort_order) values (${q(p.name)}, ${q(p.slug)}, ${q(p.description)}, ${p.priceCents}, ${q(p.currency)}, ${q(p.billingInterval)}, ${p.maxProfiles}, ${p.maxDevices}, ${arr(p.features)}, null, ${p.highlighted}, true, ${i}) on conflict (slug) do nothing;`
  )
})
out.push("")

for (const n of demoNotifications) {
  out.push(`insert into public.notifications (title, body, href) values (${q(n.title)}, ${q(n.body)}, ${q(n.href)});`)
}

out.push("", "commit;", "")
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), out.join("\n"))
console.log("supabase/seed.sql gerado.")
