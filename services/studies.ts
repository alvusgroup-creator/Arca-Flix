import "server-only"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { demoStudies } from "@/lib/demo/data"
import { demoStore } from "@/lib/demo/store"
import { getCatalog, getContentBySlug } from "@/services/content"
import type { Content, Study, StudyKind, ViewerProfile } from "@/types"

export const studyKindLabel: Record<StudyKind, string> = {
  devocional: "Devocional",
  historia: "História",
  estudo: "Estudo",
  atividade: "Atividade",
  versiculo: "Versículo",
}

interface StudyRowDb {
  content_id: string
  kind: StudyKind
  body?: string
  reading_minutes: number
  bible_reference: string | null
}

function mapStudy(content: Content, row: StudyRowDb): Study {
  return {
    content,
    kind: row.kind,
    body: row.body ?? "",
    readingMinutes: row.reading_minutes,
    bibleReference: row.bible_reference,
  }
}

export async function listStudies(profile: ViewerProfile | null): Promise<Study[]> {
  const items = await getCatalog(profile, "study")
  if (isDemoMode) return demoStudies.filter((s) => items.some((c) => c.id === s.content.id))
  if (!items.length) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("studies")
    .select("content_id, kind, reading_minutes, bible_reference")
    .in("content_id", items.map((c) => c.id))
  return ((data ?? []) as StudyRowDb[]).flatMap((row) => {
    const content = items.find((c) => c.id === row.content_id)
    return content ? [mapStudy(content, row)] : []
  })
}

export async function getStudy(slug: string): Promise<Study | null> {
  if (isDemoMode) return demoStudies.find((s) => s.content.slug === slug) ?? null

  const content = await getContentBySlug(slug)
  if (!content || content.type !== "study") return null
  const supabase = await createClient()
  const { data } = await supabase
    .from("studies")
    .select("content_id, kind, body, reading_minutes, bible_reference")
    .eq("content_id", content.id)
    .maybeSingle()
  return data ? mapStudy(content, data as StudyRowDb) : null
}

/** Percentual lido por estudo (content_id → 0..100). */
export async function getStudyProgress(profileId: string): Promise<Record<string, number>> {
  if (isDemoMode) return demoStore.getStudyProgress()
  const supabase = await createClient()
  const { data } = await supabase
    .from("study_progress")
    .select("content_id, percent")
    .eq("profile_id", profileId)
  return Object.fromEntries((data ?? []).map((r) => [r.content_id as string, r.percent as number]))
}

export async function saveStudyProgress(profileId: string, contentId: string, percent: number) {
  if (isDemoMode) return demoStore.setStudyProgress(contentId, percent)
  const current = (await getStudyProgress(profileId))[contentId] ?? 0
  if (percent <= current) return
  const supabase = await createClient()
  await supabase.from("study_progress").upsert({
    profile_id: profileId,
    content_id: contentId,
    percent: Math.round(percent),
    updated_at: new Date().toISOString(),
  })
}
