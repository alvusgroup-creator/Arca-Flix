import "server-only"
import { cache } from "react"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { demoStore } from "@/lib/demo/store"
import { filterForProfile, listPublishedContent } from "@/services/content"
import type { ViewerProfile } from "@/types"

/** Ids na "Minha lista" do perfil, do mais recente para o mais antigo. */
export const getFavoriteIds = cache(async (profileId: string): Promise<string[]> => {
  if (isDemoMode) return demoStore.getList()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("favorites")
    .select("content_id")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data.map((r) => r.content_id as string)
})

export async function getMyList(profile: ViewerProfile) {
  const [ids, all] = await Promise.all([getFavoriteIds(profile.id), listPublishedContent()])
  const items = ids.map((id) => all.find((c) => c.id === id)).filter((c) => c !== undefined)
  return filterForProfile(items, profile)
}

/** Alterna o favorito e devolve o novo estado. */
export async function toggleFavorite(profileId: string, contentId: string) {
  const ids = await getFavoriteIds(profileId)
  const isFavorite = ids.includes(contentId)

  if (isDemoMode) {
    await demoStore.setList(isFavorite ? ids.filter((id) => id !== contentId) : [contentId, ...ids])
    return !isFavorite
  }

  const supabase = await createClient()
  const { error } = isFavorite
    ? await supabase.from("favorites").delete().eq("profile_id", profileId).eq("content_id", contentId)
    : await supabase.from("favorites").insert({ profile_id: profileId, content_id: contentId })
  if (error) throw error
  return !isFavorite
}
