"use server"

import { getContentById } from "@/services/content"
import { requireActiveProfile } from "@/services/profiles"
import { saveStudyProgress } from "@/services/studies"

export async function recordStudyProgress(contentId: string, percent: number) {
  if (!Number.isFinite(percent)) return
  const { profile } = await requireActiveProfile()
  const content = await getContentById(contentId)
  if (!content || content.type !== "study") return
  await saveStudyProgress(profile.id, contentId, Math.min(100, Math.max(0, percent)))
}
