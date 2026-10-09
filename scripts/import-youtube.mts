// Importa scripts/youtube-catalog.mts para o Supabase (idempotente: pode correr de novo).
//   npm run db:youtube
import { createClient } from "@supabase/supabase-js"
import { ytCatalog as baseCatalog, type YtVideo } from "./youtube-catalog.mts"
import { ytExtend, ytExtraTitles, ytReplace } from "./youtube-catalog-extra.mts"

const ytCatalog = [
  ...baseCatalog.map((t) => ({ ...t, videos: [...(ytReplace[t.slug] ?? t.videos), ...(ytExtend[t.slug] ?? [])] })),
  ...ytExtraTitles,
]

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local")
const db = createClient(url, key, { auth: { persistSession: false } })

/** Títulos de exemplo sem vídeo real: saem do catálogo enquanto os vídeos do YouTube estiverem no ar. */
const HIDE_PLACEHOLDERS = [
  "amigos-de-jesus",
  "historias-da-biblia",
  "jose-sonhos-de-deus",
  "daniel-na-cova-dos-leoes",
  "ester",
]

const seconds = (d: string) =>
  d
    .split(":")
    .map(Number)
    .reduce((acc, n) => acc * 60 + n, 0)
const firstSentence = (s: string) => s.split(/(?<=[.!?])\s/)[0]

async function check(video: YtVideo) {
  const oembed = await fetch(
    `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${video.id}`,
  )
  const maxres = await fetch(`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`, { method: "HEAD" })
  return {
    embeddable: oembed.ok,
    status: oembed.status,
    thumb: `https://i.ytimg.com/vi/${video.id}/${maxres.ok ? "maxresdefault" : "hqdefault"}.jpg`,
  }
}

const { data: cats, error: catErr } = await db.from("categories").select("id, slug")
if (catErr) throw catErr
const catId = new Map(cats.map((c) => [c.slug, c.id]))

let imported = 0
const skipped: string[] = []

// O catálogo ordena por mais recente: o primeiro da lista fica no topo das fileiras.
const base = Date.now()

for (const [index, item] of ytCatalog.entries()) {
  const checks = await Promise.all(item.videos.map(check))
  const videos = item.videos
    .map((v, i) => ({ ...v, ...checks[i] }))
    .filter((v) => {
      if (!v.embeddable) skipped.push(`${item.title} › ${v.title} (${v.id}, HTTP ${v.status})`)
      return v.embeddable
    })
  if (!videos.length) continue

  const channels = [...new Set(videos.map((v) => v.channel))]
  const credit = `Vídeo${videos.length > 1 ? "s" : ""} do${channels.length > 1 ? "s canais" : " canal"} ${channels.join(", ")} no YouTube.`
  const cover = videos[0].thumb

  const { data: content, error } = await db
    .from("content")
    .upsert(
      {
        slug: item.slug,
        title: item.title,
        description: `${item.description}\n\n${credit}`,
        short_description: firstSentence(item.description),
        type: item.type,
        thumbnail_url: cover,
        banner_url: cover,
        poster_url: null,
        age_rating: item.age ?? "L",
        genres: item.genres,
        video_id: item.type === "movie" ? `yt:${videos[0].id}` : null,
        duration_seconds: item.type === "movie" ? seconds(videos[0].duration) : null,
        published: true,
        featured: Boolean(item.featured),
        created_at: new Date(base - index * 60_000).toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single()
  if (error) throw error

  await db.from("content_categories").delete().eq("content_id", content.id)
  const links = item.categories
    .filter((s) => catId.has(s))
    .map((s) => ({ content_id: content.id, category_id: catId.get(s) }))
  if (links.length) await db.from("content_categories").insert(links)

  if (item.type === "series") {
    await db.from("series").upsert({ content_id: content.id, status: "ongoing" })
    // Recria temporadas e episódios (apaga o progresso já assistido desta série).
    await db.from("seasons").delete().eq("series_id", content.id)
    const numbers = [...new Set(videos.map((v) => v.season ?? 1))].sort((a, b) => a - b)
    const { data: seasons, error: sErr } = await db
      .from("seasons")
      .insert(numbers.map((number) => ({ series_id: content.id, number, title: `Temporada ${number}` })))
      .select("id, number")
    if (sErr) throw sErr
    const seasonId = new Map(seasons.map((s) => [s.number, s.id]))
    const perSeason = new Map<number, number>()
    const { error: eErr } = await db.from("episodes").insert(
      videos.map((v) => {
        const season = v.season ?? 1
        const number = (perSeason.get(season) ?? 0) + 1
        perSeason.set(season, number)
        return {
          season_id: seasonId.get(season),
          number,
          title: v.title,
          description: `Canal ${v.channel} no YouTube.`,
          thumbnail_url: v.thumb,
          video_id: `yt:${v.id}`,
          duration_seconds: seconds(v.duration),
          published: true,
        }
      }),
    )
    if (eErr) throw eErr
  }

  imported += videos.length
  console.log(`✓ ${item.title} (${videos.length})`)
}

await db.from("content").update({ published: false }).in("slug", HIDE_PLACEHOLDERS)

console.log(`\n${imported} vídeos importados em ${ytCatalog.length} títulos.`)
if (skipped.length) console.log(`Ignorados (indisponíveis ou com incorporação bloqueada):\n- ${skipped.join("\n- ")}`)
