import "server-only"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { demoStore } from "@/lib/demo/store"
import { filterForProfile, getSeasons, listPublishedContent } from "@/services/content"
import type { ContinueWatchingItem, ViewerProfile, WatchProgress } from "@/types"

const COMPLETED_RATIO = 0.92

async function listProgress(profileId: string): Promise<WatchProgress[]> {
  if (isDemoMode) return demoStore.getProgressFor(profileId)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("watch_history")
    .select("content_id, episode_id, progress_seconds, duration, completed, updated_at")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false })
    .limit(50)
  if (error) throw error
  return data.map((r) => ({
    contentId: r.content_id,
    episodeId: r.episode_id,
    progressSeconds: r.progress_seconds,
    durationSeconds: r.duration,
    completed: r.completed,
    updatedAt: r.updated_at,
  }))
}

/** Progresso de cada episódio (ou do filme, chave "movie") para um conteúdo. */
export async function getProgressMap(profileId: string, contentId: string) {
  const all = await listProgress(profileId)
  return new Map(all.filter((p) => p.contentId === contentId).map((p) => [p.episodeId ?? "movie", p]))
}

export async function getResumePoint(profileId: string, contentId: string, episodeId: string | null) {
  const map = await getProgressMap(profileId, contentId)
  const p = map.get(episodeId ?? "movie")
  return p && !p.completed ? p.progressSeconds : 0
}

/** Continuar assistindo: mais recente primeiro, um item por conteúdo, sem concluídos. */
export async function getContinueWatching(profile: ViewerProfile): Promise<ContinueWatchingItem[]> {
  const [progress, catalog] = await Promise.all([listProgress(profile.id), listPublishedContent()])
  const visible = filterForProfile(catalog, profile)

  const seen = new Set<string>()
  const items: ContinueWatchingItem[] = []
  for (const p of progress) {
    if (p.completed || seen.has(p.contentId)) continue
    const content = visible.find((c) => c.id === p.contentId)
    if (!content) continue
    seen.add(p.contentId)
    const episode = p.episodeId
      ? ((await getSeasons(content)).flatMap((s) => s.episodes).find((e) => e.id === p.episodeId) ?? null)
      : null
    items.push({ content, episode, progress: p })
    if (items.length >= 12) break
  }
  return items
}

export async function saveWatchProgress(
  userId: string,
  profileId: string,
  entry: { contentId: string; episodeId: string | null; progressSeconds: number; durationSeconds: number }
) {
  if (isDemoMode) return demoStore.saveProgress(profileId, entry)

  const supabase = await createClient()
  const { error } = await supabase.from("watch_history").upsert(
    {
      user_id: userId,
      profile_id: profileId,
      content_id: entry.contentId,
      episode_id: entry.episodeId,
      progress_seconds: Math.round(entry.progressSeconds),
      duration: Math.round(entry.durationSeconds),
      completed:
        entry.durationSeconds > 0 && entry.progressSeconds / entry.durationSeconds >= COMPLETED_RATIO,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,content_id,episode_id" }
  )
  if (error) throw error
}

export async function registerView(contentId: string) {
  if (isDemoMode) return
  const supabase = await createClient()
  await supabase.rpc("increment_view", { p_content_id: contentId })
}
