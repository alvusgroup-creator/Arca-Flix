"use server"

import { z } from "zod"
import { getContentById } from "@/services/content"
import { saveWatchProgress } from "@/services/history"
import { heartbeat } from "@/services/playback"
import { requireActiveProfile } from "@/services/profiles"

const progressSchema = z.object({
  contentId: z.string().min(1),
  episodeId: z.string().min(1).nullable(),
  progressSeconds: z.number().min(0).max(60 * 60 * 12),
  durationSeconds: z.number().min(0).max(60 * 60 * 12),
})

export async function saveProgress(input: z.infer<typeof progressSchema>) {
  const parsed = progressSchema.safeParse(input)
  if (!parsed.success) return { ok: false }
  const { account, profile } = await requireActiveProfile()
  if (!(await getContentById(parsed.data.contentId))) return { ok: false }
  try {
    await Promise.all([
      saveWatchProgress(account.id, profile.id, parsed.data),
      heartbeat(account.id, profile.id, parsed.data.contentId),
    ])
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
