"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { fetchBunnyVideo } from "@/lib/bunny"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/services/auth"
import {
  categorySchema,
  coloringSchema,
  contentSchema,
  episodeSchema,
  formToObject,
  musicMetaSchema,
  planSchema,
  seasonSchema,
  slugify,
  studySchema,
  trackSchema,
  type FormState,
} from "./schemas"

const DEMO_MESSAGE = "Modo demonstração: configure o Supabase para salvar alterações no catálogo."

type DbError = { code?: string; message?: string } | null

function dbError(error: DbError, fallback = "Não foi possível salvar. Tente novamente."): FormState {
  if (!error) return null
  if (error.code === "23505") return { error: "Já existe um registro com este identificador (slug ou número)." }
  console.error("[admin]", error)
  return { error: fallback }
}

/** Garante admin e devolve o cliente com RLS (as policies só deixam o admin escrever). */
async function adminDb() {
  await requireAdmin()
  return createClient()
}

function refresh(contentId?: string) {
  revalidatePath("/", "layout")
  if (contentId) revalidatePath(`/admin/content/${contentId}`)
}

// ---------------------------------------------------------------------------
// Conteúdo

export async function saveContent(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const parsed = contentSchema.safeParse(formToObject(fd, ["categoryIds"]))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const v = parsed.data
  const supabase = await adminDb()

  const row = {
    title: v.title,
    slug: v.slug,
    description: v.description,
    short_description: v.shortDescription,
    age_rating: v.ageRating,
    release_date: v.releaseYear ? `${v.releaseYear}-01-01` : null,
    genres: v.genres,
    thumbnail_url: v.thumbnailUrl,
    banner_url: v.bannerUrl || v.thumbnailUrl,
    poster_url: v.posterUrl,
    video_id: v.type === "movie" ? v.videoId : null,
    duration_seconds: v.type === "movie" ? v.durationSeconds : null,
    trailer_video_id: v.trailerVideoId,
    published: v.published,
    featured: v.featured,
  }

  let id = v.id
  if (id) {
    const { error } = await supabase.from("content").update(row).eq("id", id)
    if (error) return dbError(error)
  } else {
    const { data, error } = await supabase.from("content").insert({ ...row, type: v.type }).select("id").single()
    if (error) return dbError(error)
    id = data.id as string
  }

  // Categorias
  await supabase.from("content_categories").delete().eq("content_id", id)
  if (v.categoryIds.length) {
    const { error } = await supabase
      .from("content_categories")
      .insert(v.categoryIds.map((category_id) => ({ content_id: id, category_id })))
    if (error) return dbError(error)
  }

  // Registro de extensão por tipo (criado uma vez, editado nas secções próprias)
  if (!v.id) {
    if (v.type === "series") await supabase.from("series").insert({ content_id: id })
    if (v.type === "music") await supabase.from("music_albums").insert({ content_id: id })
    if (v.type === "coloring")
      await supabase.from("coloring_materials").insert({ content_id: id, category: "atividades", image_url: v.thumbnailUrl })
    if (v.type === "study") await supabase.from("studies").insert({ content_id: id })
  }

  refresh(id)
  if (!v.id) redirect(`/admin/content/${id}?created=1`)
  return { success: "Conteúdo salvo.", id }
}

export async function setPublished(contentId: string, published: boolean): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const supabase = await adminDb()
  const { error } = await supabase.from("content").update({ published }).eq("id", contentId)
  if (error) return dbError(error)
  refresh(contentId)
  return { success: published ? "Publicado." : "Movido para rascunho." }
}

export async function deleteContent(contentId: string): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const supabase = await adminDb()
  const { error } = await supabase.from("content").delete().eq("id", contentId)
  if (error) return dbError(error, "Não foi possível excluir.")
  refresh()
  redirect("/admin/content")
}

// ---------------------------------------------------------------------------
// Séries: temporadas e episódios

export async function addSeason(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const parsed = seasonSchema.safeParse(formToObject(fd))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { contentId, number, title } = parsed.data
  const supabase = await adminDb()
  const { error } = await supabase
    .from("seasons")
    .insert({ series_id: contentId, number, title: title || `Temporada ${number}` })
  if (error) return dbError(error)
  refresh(contentId)
  return { success: "Temporada criada." }
}

export async function deleteSeason(seasonId: string, contentId: string): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const supabase = await adminDb()
  const { error } = await supabase.from("seasons").delete().eq("id", seasonId)
  if (error) return dbError(error, "Não foi possível excluir a temporada.")
  refresh(contentId)
  return { success: "Temporada excluída." }
}

export async function saveEpisode(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const raw = formToObject(fd)
  const parsed = episodeSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const v = parsed.data
  const supabase = await adminDb()
  const row = {
    season_id: v.seasonId,
    number: v.number,
    title: v.title,
    description: v.description,
    thumbnail_url: v.thumbnailUrl,
    video_id: v.videoId,
    duration_seconds: v.durationSeconds,
  }
  const { error } = v.id
    ? await supabase.from("episodes").update(row).eq("id", v.id)
    : await supabase.from("episodes").insert(row)
  if (error) return dbError(error)
  refresh(String(raw.contentId ?? ""))
  return { success: "Episódio salvo." }
}

export async function deleteEpisode(episodeId: string, contentId: string): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const supabase = await adminDb()
  const { error } = await supabase.from("episodes").delete().eq("id", episodeId)
  if (error) return dbError(error, "Não foi possível excluir o episódio.")
  refresh(contentId)
  return { success: "Episódio excluído." }
}

/** Busca duração e thumbnail de um vídeo na biblioteca do Bunny Stream. */
export async function lookupBunnyVideo(videoId: string) {
  await requireAdmin()
  const video = await fetchBunnyVideo(videoId.trim())
  if (!video) return { error: "Vídeo não encontrado no Bunny (verifique o ID e as chaves BUNNY_*)." }
  return { video }
}

// ---------------------------------------------------------------------------
// Música

async function ensureArtist(supabase: Awaited<ReturnType<typeof createClient>>, name: string) {
  if (!name) return null
  const slug = slugify(name)
  const { data: existing } = await supabase.from("music_artists").select("id").eq("slug", slug).maybeSingle()
  if (existing) return existing.id as string
  const { data } = await supabase.from("music_artists").insert({ name, slug }).select("id").single()
  return (data?.id as string) ?? null
}

export async function saveMusicMeta(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const parsed = musicMetaSchema.safeParse(formToObject(fd))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { contentId, kind, artist } = parsed.data
  const supabase = await adminDb()

  const [{ data: album }, { data: playlist }] = await Promise.all([
    supabase.from("music_albums").select("id").eq("content_id", contentId).maybeSingle(),
    supabase.from("playlists").select("id").eq("content_id", contentId).maybeSingle(),
  ])

  if (kind === "album") {
    if (playlist) {
      const { count } = await supabase.from("playlist_tracks").select("track_id", { count: "exact", head: true }).eq("playlist_id", playlist.id)
      if (count) return { error: "Remova as músicas da playlist antes de transformá-la em álbum." }
      await supabase.from("playlists").delete().eq("id", playlist.id)
    }
    const artistId = await ensureArtist(supabase, artist)
    const { error } = album
      ? await supabase.from("music_albums").update({ artist_id: artistId }).eq("id", album.id)
      : await supabase.from("music_albums").insert({ content_id: contentId, artist_id: artistId })
    if (error) return dbError(error)
  } else {
    if (album) {
      const { count } = await supabase.from("music_tracks").select("id", { count: "exact", head: true }).eq("album_id", album.id)
      if (count) return { error: "Remova as músicas do álbum antes de transformá-lo em playlist." }
      await supabase.from("music_albums").delete().eq("id", album.id)
    }
    if (!playlist) {
      const { data: content } = await supabase.from("content").select("title").eq("id", contentId).single()
      const { error } = await supabase.from("playlists").insert({ content_id: contentId, title: content?.title ?? "Playlist" })
      if (error) return dbError(error)
    }
  }
  refresh(contentId)
  return { success: "Dados do álbum salvos." }
}

export async function saveTrack(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const parsed = trackSchema.safeParse(formToObject(fd))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const v = parsed.data
  const supabase = await adminDb()

  const [{ data: album }, { data: playlist }] = await Promise.all([
    supabase.from("music_albums").select("id, artist_id").eq("content_id", v.contentId).maybeSingle(),
    supabase.from("playlists").select("id").eq("content_id", v.contentId).maybeSingle(),
  ])
  if (!album && !playlist) return { error: "Salve primeiro o tipo (álbum ou playlist)." }

  const row = {
    title: v.title,
    audio_url: v.audioUrl,
    cover_url: v.coverUrl,
    duration: v.durationSeconds,
    track_number: v.trackNumber,
    album_id: album?.id ?? null,
    artist_id: album?.artist_id ?? null,
  }

  if (v.id) {
    const { error } = await supabase.from("music_tracks").update(row).eq("id", v.id)
    if (error) return dbError(error)
    if (playlist) await supabase.from("playlist_tracks").update({ position: v.trackNumber - 1 }).eq("playlist_id", playlist.id).eq("track_id", v.id)
  } else {
    const { data, error } = await supabase.from("music_tracks").insert(row).select("id").single()
    if (error) return dbError(error)
    if (playlist) {
      const { error: linkError } = await supabase
        .from("playlist_tracks")
        .insert({ playlist_id: playlist.id, track_id: data.id, position: v.trackNumber - 1 })
      if (linkError) return dbError(linkError)
    }
  }
  refresh(v.contentId)
  return { success: "Música salva." }
}

export async function deleteTrack(trackId: string, contentId: string): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const supabase = await adminDb()
  const { error } = await supabase.from("music_tracks").delete().eq("id", trackId)
  if (error) return dbError(error, "Não foi possível excluir a música.")
  refresh(contentId)
  return { success: "Música excluída." }
}

// ---------------------------------------------------------------------------
// Para colorir e estudos

export async function saveColoring(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const parsed = coloringSchema.safeParse(formToObject(fd))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const v = parsed.data
  if (v.ageMin > v.ageMax) return { error: "A idade mínima deve ser menor que a máxima." }
  const supabase = await adminDb()
  const { error } = await supabase.from("coloring_materials").upsert(
    { content_id: v.contentId, category: v.category, age_min: v.ageMin, age_max: v.ageMax, image_url: v.imageUrl, pdf_url: v.pdfUrl },
    { onConflict: "content_id" }
  )
  if (error) return dbError(error)
  refresh(v.contentId)
  return { success: "Material salvo." }
}

export async function saveStudy(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const parsed = studySchema.safeParse(formToObject(fd))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const v = parsed.data
  const supabase = await adminDb()
  const { error } = await supabase.from("studies").upsert(
    { content_id: v.contentId, kind: v.kind, body: v.body, reading_minutes: v.readingMinutes, bible_reference: v.bibleReference },
    { onConflict: "content_id" }
  )
  if (error) return dbError(error)
  refresh(v.contentId)
  return { success: "Estudo salvo." }
}

// ---------------------------------------------------------------------------
// Planos e categorias

export async function savePlan(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const parsed = planSchema.safeParse(formToObject(fd))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const v = parsed.data
  const supabase = await adminDb()
  const row = {
    name: v.name,
    slug: v.slug,
    description: v.description,
    price: v.priceCents,
    billing_interval: v.billingInterval,
    max_profiles: v.maxProfiles,
    max_devices: v.maxDevices,
    features: v.features,
    stripe_price_id: v.stripePriceId,
    highlighted: v.highlighted,
    active: v.active,
    sort_order: v.sortOrder,
  }
  const { error } = v.id
    ? await supabase.from("subscription_plans").update(row).eq("id", v.id)
    : await supabase.from("subscription_plans").insert(row)
  if (error) return dbError(error)
  refresh()
  redirect("/admin/plans?saved=1")
}

export async function saveCategory(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const parsed = categorySchema.safeParse(formToObject(fd))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const supabase = await adminDb()
  const { error } = await supabase.from("categories").insert(parsed.data)
  if (error) return dbError(error)
  refresh()
  return { success: "Categoria criada." }
}

export async function deleteCategory(categoryId: string): Promise<FormState> {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  const supabase = await adminDb()
  const { error } = await supabase.from("categories").delete().eq("id", categoryId)
  if (error) return dbError(error, "Não foi possível excluir a categoria.")
  refresh()
  return { success: "Categoria excluída." }
}

// ---------------------------------------------------------------------------
// Upload direto para o Supabase Storage (URL assinada; o arquivo não passa pela Vercel)

const BUCKETS = ["images", "coloring", "audio"] as const
export type UploadBucket = (typeof BUCKETS)[number]

export async function createUploadUrl(bucket: UploadBucket, fileName: string) {
  await requireAdmin()
  if (isDemoMode) return { error: DEMO_MESSAGE }
  if (!BUCKETS.includes(bucket)) return { error: "Bucket inválido." }

  const dot = fileName.lastIndexOf(".")
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "bin"
  const base = slugify(dot > 0 ? fileName.slice(0, dot) : fileName) || "arquivo"
  const path = `${new Date().getFullYear()}/${randomUUID().slice(0, 8)}-${base}.${ext}`

  const supabase = await adminDb()
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path)
  if (error || !data) return { error: "Não foi possível preparar o envio." }

  // Imagens são públicas (URL completa); PDFs e áudio guardam só o caminho privado.
  const value = bucket === "images" ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : path
  return { path, token: data.token, value }
}
