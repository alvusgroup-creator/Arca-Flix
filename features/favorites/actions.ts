"use server"

import { revalidatePath } from "next/cache"
import { getContentById } from "@/services/content"
import { toggleFavorite } from "@/services/favorites"
import { requireActiveProfile } from "@/services/profiles"

export async function toggleMyList(contentId: string): Promise<{ saved?: boolean; error?: string }> {
  const { profile } = await requireActiveProfile()
  if (!(await getContentById(contentId))) return { error: "Conteúdo não encontrado." }
  try {
    const saved = await toggleFavorite(profile.id, contentId)
    revalidatePath("/my-list")
    return { saved }
  } catch {
    return { error: "Não foi possível atualizar sua lista." }
  }
}
