import "server-only"
import { cache } from "react"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import {
  CONTENT_SELECT,
  mapContent,
  mapEpisode,
  mapSeason,
  type ContentRowDb,
  type EpisodeRowDb,
  type SeasonRowDb,
} from "@/lib/supabase/mappers"
import { demoCategories, demoContent, demoSeasons } from "@/lib/demo/data"
import { isRatingAllowed } from "@/utils/age-rating"
import { isVideo } from "@/utils/content"
import type {
  Category,
  Content,
  ContentDetail,
  ContentRow,
  ContentType,
  Episode,
  Season,
  ViewerProfile,
} from "@/types"

// ---------------------------------------------------------------------------
// Leitura base

/** Todo o catálogo publicado (memoizado por pedido). */
export const listPublishedContent = cache(async (): Promise<Content[]> => {
  if (isDemoMode) return demoContent

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("content")
    .select(CONTENT_SELECT)
    .eq("published", true)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as ContentRowDb[]).map(mapContent)
})

export const listCategories = cache(async (): Promise<Category[]> => {
  if (isDemoMode) return demoCategories
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("id, slug, name").order("name")
  if (error) throw error
  return data as Category[]
})

/** Aplica o controle parental do perfil (classificação e categorias). */
export function filterForProfile<T extends Content>(items: T[], profile: ViewerProfile | null) {
  if (!profile) return items
  return items.filter((item) => {
    if (!isRatingAllowed(item.ageRating, profile.maxAgeRating)) return false
    const ids = item.categories.map((c) => c.id)
    if (profile.blockedCategoryIds.some((id) => ids.includes(id))) return false
    if (profile.allowedCategoryIds.length && !profile.allowedCategoryIds.some((id) => ids.includes(id)))
      return false
    return true
  })
}

export async function getCatalog(profile: ViewerProfile | null, type?: ContentType) {
  const all = await listPublishedContent()
  return filterForProfile(type ? all.filter((c) => c.type === type) : all, profile)
}

export const getContentBySlug = cache(async (slug: string): Promise<Content | null> => {
  const all = await listPublishedContent()
  return all.find((c) => c.slug === slug) ?? null
})

export async function getContentById(id: string) {
  const all = await listPublishedContent()
  return all.find((c) => c.id === id) ?? null
}

export const getSeasons = cache(async (content: Content): Promise<Season[]> => {
  if (content.type !== "series") return []
  if (isDemoMode) return demoSeasons.filter((s) => s.contentId === content.id)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("seasons")
    .select("id, series_id, number, title, episodes(id, season_id, number, title, description, thumbnail_url, video_id, duration_seconds)")
    .eq("series_id", content.id)
    .order("number")
  if (error) throw error
  return (data as SeasonRowDb[]).map((row) => mapSeason(row, content.thumbnailUrl))
})

export async function getContentDetail(slug: string): Promise<ContentDetail | null> {
  const content = await getContentBySlug(slug)
  if (!content) return null
  return { ...content, seasons: await getSeasons(content) }
}

export async function getEpisodeById(id: string): Promise<Episode | null> {
  if (isDemoMode) {
    return demoSeasons.flatMap((s) => s.episodes).find((e) => e.id === id) ?? null
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from("episodes")
    .select("id, season_id, number, title, description, thumbnail_url, video_id, duration_seconds, seasons(number, series_id)")
    .eq("id", id)
    .maybeSingle()
  if (!data) return null
  const row = data as EpisodeRowDb
  const season = Array.isArray(row.seasons) ? row.seasons[0] : row.seasons
  if (!season) return null
  return mapEpisode(row, season.series_id, season.number)
}

// ---------------------------------------------------------------------------
// Composição de páginas

async function getMostWatched(items: Content[]) {
  if (isDemoMode) return items.filter(isVideo).slice(0, 6)
  const supabase = await createClient()
  const { data } = await supabase
    .from("content")
    .select("id")
    .eq("published", true)
    .in("type", ["series", "movie"])
    .order("view_count", { ascending: false })
    .limit(10)
  const ids = (data ?? []).map((r) => r.id as string)
  return ids.map((id) => items.find((c) => c.id === id)).filter((c): c is Content => Boolean(c))
}

const inCategory = (slug: string) => (c: Content) => c.categories.some((cat) => cat.slug === slug)

export async function getHomeData(profile: ViewerProfile | null) {
  const items = await getCatalog(profile)
  const videos = items.filter(isVideo)
  const featured = videos.filter((c) => c.featured)

  const rows: ContentRow[] = [
    { id: "series", title: "Séries em destaque", items: items.filter((c) => c.type === "series"), href: "/series" },
    { id: "movies", title: "Filmes", items: items.filter((c) => c.type === "movie"), href: "/movies", variant: "poster" },
    {
      id: "bible",
      title: "Histórias da Bíblia",
      items: videos.filter((c) => inCategory("antigo-testamento")(c) || inCategory("novo-testamento")(c)),
    },
    {
      id: "new",
      title: "Novidades",
      items: [...videos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
    },
    { id: "top", title: "Mais assistidos", items: await getMostWatched(videos) },
    { id: "praise", title: "Louvor infantil", items: items.filter((c) => c.type === "music" && inCategory("louvor")(c)), href: "/music" },
    { id: "sleep", title: "Músicas para dormir", items: items.filter((c) => c.type === "music" && inCategory("dormir")(c)), href: "/music" },
    { id: "coloring", title: "Para colorir", items: items.filter((c) => c.type === "coloring"), href: "/colorir" },
    { id: "studies", title: "Estudos e atividades", items: items.filter((c) => c.type === "study"), href: "/estudos" },
  ]

  // Catálogo pequeno: não repetir fileiras que só mostram títulos já vistos acima.
  const shown = new Set<string>()
  const visibleRows = rows.filter((r) => {
    if (!r.items.length) return false
    const fresh = r.items.some((c) => !shown.has(c.id))
    r.items.forEach((c) => shown.add(c.id))
    return fresh
  })

  return {
    hero: (featured.length ? featured : videos).slice(0, 5),
    rows: visibleRows,
  }
}

export async function getSimilar(content: Content, profile: ViewerProfile | null, limit = 10) {
  const items = await getCatalog(profile)
  const catIds = new Set(content.categories.map((c) => c.id))
  return items
    .filter((c) => c.id !== content.id && isVideo(c) === isVideo(content))
    .map((c) => ({
      c,
      score:
        c.categories.filter((cat) => catIds.has(cat.id)).length +
        c.genres.filter((g) => content.genres.includes(g)).length +
        (c.type === content.type ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ c }) => c)
}

// ---------------------------------------------------------------------------
// Busca

export interface SearchResult {
  content: Content[]
  episodes: (Episode & { contentTitle: string; contentSlug: string })[]
}

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export async function searchCatalog(query: string, profile: ViewerProfile | null): Promise<SearchResult> {
  const q = normalize(query.trim())
  if (q.length < 2) return { content: [], episodes: [] }

  const items = await getCatalog(profile)
  const content = items.filter((c) =>
    normalize([c.title, c.description, ...c.genres, ...c.categories.map((x) => x.name)].join(" ")).includes(q)
  )

  const visibleSeries = new Map(items.filter((c) => c.type === "series").map((c) => [c.id, c]))
  let episodes: Episode[]
  if (isDemoMode) {
    episodes = demoSeasons.flatMap((s) => s.episodes).filter((e) => normalize(e.title).includes(q))
  } else {
    const supabase = await createClient()
    const { data } = await supabase
      .from("episodes")
      .select("id, season_id, number, title, description, thumbnail_url, video_id, duration_seconds, seasons(number, series_id)")
      .ilike("title", `%${query.trim().replace(/[%_]/g, "")}%`)
      .limit(20)
    episodes = ((data ?? []) as EpisodeRowDb[]).flatMap((row) => {
      const season = Array.isArray(row.seasons) ? row.seasons[0] : row.seasons
      return season ? [mapEpisode(row, season.series_id, season.number)] : []
    })
  }

  return {
    content,
    episodes: episodes
      .filter((e) => visibleSeries.has(e.contentId))
      .slice(0, 12)
      .map((e) => {
        const parent = visibleSeries.get(e.contentId)!
        return {
          ...e,
          thumbnailUrl: e.thumbnailUrl || parent.thumbnailUrl,
          contentTitle: parent.title,
          contentSlug: parent.slug,
        }
      }),
  }
}
