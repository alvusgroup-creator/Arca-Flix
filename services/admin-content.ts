import "server-only"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { CONTENT_SELECT, mapContent, mapPlan, type ContentRowDb, type PlanRowDb } from "@/lib/supabase/mappers"
import { demoColoring, demoContent, demoMusic, demoPlans, demoSeasons, demoStudies } from "@/lib/demo/data"
import { requireAdmin } from "@/services/auth"
import { listCategories } from "@/services/content"
import type {
  ColoringCategory,
  Content,
  ContentType,
  StudyKind,
  SubscriptionPlan,
} from "@/types"

// Leituras do painel admin: incluem rascunhos e campos internos.
// Escritas ficam em features/admin/actions.ts. Tudo passa por requireAdmin()
// e usa o cliente com RLS (as policies liberam escrita só para admin).

export interface AdminContent extends Content {
  published: boolean
  viewCount: number
}

export interface AdminEpisode {
  id: string
  number: number
  title: string
  description: string
  thumbnailUrl: string
  videoId: string | null
  durationSeconds: number
}

export interface AdminSeason {
  id: string
  number: number
  title: string
  episodes: AdminEpisode[]
}

export interface AdminTrack {
  id: string
  title: string
  audioUrl: string
  coverUrl: string | null
  durationSeconds: number
  trackNumber: number
}

export interface AdminContentDetail {
  content: AdminContent
  seasons: AdminSeason[]
  music: { kind: "album" | "playlist"; artist: string; tracks: AdminTrack[] } | null
  coloring: { category: ColoringCategory; ageMin: number; ageMax: number; imageUrl: string; pdfUrl: string | null } | null
  study: { kind: StudyKind; body: string; readingMinutes: number; bibleReference: string | null } | null
}

type AdminRow = ContentRowDb & { published: boolean; view_count: number }

const toAdmin = (row: AdminRow): AdminContent => ({
  ...mapContent(row),
  published: row.published,
  viewCount: Number(row.view_count ?? 0),
})

export async function listAdminContent(type?: ContentType): Promise<AdminContent[]> {
  await requireAdmin()
  if (isDemoMode) {
    return demoContent
      .filter((c) => !type || c.type === type)
      .map((c) => ({ ...c, published: true, viewCount: 0 }))
  }
  const supabase = await createClient()
  let query = supabase.from("content").select(CONTENT_SELECT).order("updated_at", { ascending: false })
  if (type) query = query.eq("type", type)
  const { data, error } = await query
  if (error) throw error
  return (data as AdminRow[]).map(toAdmin)
}

export async function getAdminContent(id: string): Promise<AdminContentDetail | null> {
  await requireAdmin()

  if (isDemoMode) {
    const c = demoContent.find((x) => x.id === id)
    if (!c) return null
    const music = demoMusic.find((m) => m.content.id === id)
    const coloring = demoColoring.find((m) => m.content.id === id)
    const study = demoStudies.find((s) => s.content.id === id)
    return {
      content: { ...c, published: true, viewCount: 0 },
      seasons: demoSeasons
        .filter((s) => s.contentId === id)
        .map((s) => ({ id: s.id, number: s.number, title: s.title, episodes: s.episodes })),
      music: music
        ? {
            kind: music.kind,
            artist: music.artist,
            tracks: music.tracks.map((t) => ({ ...t, audioUrl: t.audioUrl ?? "" })),
          }
        : null,
      coloring: coloring
        ? { category: coloring.category, ageMin: coloring.ageMin, ageMax: coloring.ageMax, imageUrl: coloring.imageUrl, pdfUrl: coloring.pdfUrl }
        : null,
      study: study
        ? { kind: study.kind, body: study.body, readingMinutes: study.readingMinutes, bibleReference: study.bibleReference }
        : null,
    }
  }

  const supabase = await createClient()
  const { data: row } = await supabase.from("content").select(CONTENT_SELECT).eq("id", id).maybeSingle()
  if (!row) return null
  const content = toAdmin(row as AdminRow)

  const detail: AdminContentDetail = { content, seasons: [], music: null, coloring: null, study: null }

  if (content.type === "series") {
    const { data } = await supabase
      .from("seasons")
      .select("id, number, title, episodes(id, number, title, description, thumbnail_url, video_id, duration_seconds)")
      .eq("series_id", id)
      .order("number")
    type EpRow = { id: string; number: number; title: string; description: string; thumbnail_url: string; video_id: string | null; duration_seconds: number }
    detail.seasons = (data ?? []).map((s) => ({
      id: s.id as string,
      number: s.number as number,
      title: s.title as string,
      episodes: ((s.episodes ?? []) as EpRow[])
        .sort((a, b) => a.number - b.number)
        .map((e) => ({
          id: e.id,
          number: e.number,
          title: e.title,
          description: e.description,
          thumbnailUrl: e.thumbnail_url,
          videoId: e.video_id,
          durationSeconds: e.duration_seconds,
        })),
    }))
  }

  if (content.type === "music") {
    type TrackRow = { id: string; title: string; audio_url: string; cover_url: string | null; duration: number; track_number: number }
    const mapTrack = (t: TrackRow): AdminTrack => ({
      id: t.id,
      title: t.title,
      audioUrl: t.audio_url,
      coverUrl: t.cover_url,
      durationSeconds: t.duration,
      trackNumber: t.track_number,
    })
    const { data: album } = await supabase
      .from("music_albums")
      .select("id, music_artists(name)")
      .eq("content_id", id)
      .maybeSingle()
    if (album) {
      const { data: tracks } = await supabase
        .from("music_tracks")
        .select("id, title, audio_url, cover_url, duration, track_number")
        .eq("album_id", album.id)
        .order("track_number")
      const artist = album.music_artists as { name: string } | { name: string }[] | null
      detail.music = {
        kind: "album",
        artist: (Array.isArray(artist) ? artist[0]?.name : artist?.name) ?? "",
        tracks: ((tracks ?? []) as TrackRow[]).map(mapTrack),
      }
    } else {
      const { data: playlist } = await supabase
        .from("playlists")
        .select("id, playlist_tracks(position, music_tracks(id, title, audio_url, cover_url, duration, track_number))")
        .eq("content_id", id)
        .maybeSingle()
      type PT = { position: number; music_tracks: TrackRow | TrackRow[] | null }
      detail.music = {
        kind: "playlist",
        artist: "",
        tracks: ((playlist?.playlist_tracks ?? []) as PT[])
          .sort((a, b) => a.position - b.position)
          .flatMap((pt) => {
            const t = Array.isArray(pt.music_tracks) ? pt.music_tracks[0] : pt.music_tracks
            return t ? [mapTrack(t)] : []
          }),
      }
    }
  }

  if (content.type === "coloring") {
    const { data } = await supabase
      .from("coloring_materials")
      .select("category, age_min, age_max, image_url, pdf_url")
      .eq("content_id", id)
      .maybeSingle()
    if (data) {
      detail.coloring = {
        category: data.category as ColoringCategory,
        ageMin: data.age_min,
        ageMax: data.age_max,
        imageUrl: data.image_url,
        pdfUrl: data.pdf_url,
      }
    }
  }

  if (content.type === "study") {
    const { data } = await supabase
      .from("studies")
      .select("kind, body, reading_minutes, bible_reference")
      .eq("content_id", id)
      .maybeSingle()
    if (data) {
      detail.study = {
        kind: data.kind as StudyKind,
        body: data.body,
        readingMinutes: data.reading_minutes,
        bibleReference: data.bible_reference,
      }
    }
  }

  return detail
}

export async function listAdminPlans(): Promise<(SubscriptionPlan & { sortOrder: number })[]> {
  await requireAdmin()
  if (isDemoMode) return demoPlans.map((p, i) => ({ ...p, sortOrder: i }))
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, name, slug, description, price, currency, billing_interval, max_profiles, max_devices, features, stripe_price_id, highlighted, active, sort_order")
    .order("sort_order")
  if (error) throw error
  return (data as (PlanRowDb & { sort_order: number })[]).map((r) => ({ ...mapPlan(r), sortOrder: r.sort_order }))
}

export async function listAdminCategories() {
  await requireAdmin()
  return listCategories()
}
