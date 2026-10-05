import "server-only"
import { cookies } from "next/headers"
import type { AgeRating, ProfileKind, WatchProgress } from "@/types"

// Persistência do modo demonstração (sem Supabase): cookies httpOnly pequenos.
// A escrita só funciona em Server Actions e Route Handlers.

const ONE_YEAR = 60 * 60 * 24 * 365

export const DEMO_USER_ID = "demo-user"

export interface DemoSession {
  name: string
  email: string
}

export interface DemoProfile {
  id: string
  name: string
  avatar: string
  kind: ProfileKind
  maxAgeRating: AgeRating
  pin: string | null
  blockedCategoryIds: string[]
}

type ProgressTuple = [
  contentId: string,
  episodeId: string | null,
  progressSeconds: number,
  durationSeconds: number,
  updatedAt: number,
]

async function read<T>(name: string, fallback: T): Promise<T> {
  const raw = (await cookies()).get(name)?.value
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function write(name: string, value: unknown) {
  ;(await cookies()).set(name, JSON.stringify(value), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  })
}

const K = {
  session: "af_demo_session",
  profiles: "af_demo_profiles",
  list: "af_demo_list",
  progress: "af_demo_progress",
  subscription: "af_demo_sub",
  studies: "af_demo_studies",
  prefs: "af_demo_prefs",
}

export const demoStore = {
  getSession: () => read<DemoSession | null>(K.session, null),
  setSession: (s: DemoSession) => write(K.session, s),
  async clear() {
    const store = await cookies()
    Object.values(K).forEach((name) => store.delete(name))
  },

  getProfiles: () => read<DemoProfile[]>(K.profiles, []),
  setProfiles: (profiles: DemoProfile[]) => write(K.profiles, profiles),

  getList: () => read<string[]>(K.list, []),
  setList: (ids: string[]) => write(K.list, ids.slice(0, 60)),

  async getProgressFor(profileId: string) {
    const map = await read<Record<string, ProgressTuple[]>>(K.progress, {})
    return (map[profileId] ?? []).map(
      ([contentId, episodeId, progressSeconds, durationSeconds, updatedAt]): WatchProgress => ({
        contentId,
        episodeId,
        progressSeconds,
        durationSeconds,
        completed: durationSeconds > 0 && progressSeconds / durationSeconds > 0.92,
        updatedAt: new Date(updatedAt).toISOString(),
      })
    )
  },
  async saveProgress(profileId: string, entry: Omit<WatchProgress, "completed" | "updatedAt">) {
    const map = await read<Record<string, ProgressTuple[]>>(K.progress, {})
    const list = (map[profileId] ?? []).filter(
      ([c, e]) => !(c === entry.contentId && e === entry.episodeId)
    )
    list.unshift([
      entry.contentId,
      entry.episodeId,
      Math.round(entry.progressSeconds),
      Math.round(entry.durationSeconds),
      Date.now(),
    ])
    // Mantém o cookie pequeno: só os itens mais recentes por perfil.
    map[profileId] = list.slice(0, 12)
    await write(K.progress, map)
  },

  async clearProgress() {
    ;(await cookies()).delete(K.progress)
  },

  getSubscription: () => read<{ plan: string; since: number } | null>(K.subscription, null),
  setSubscription: (plan: string) => write(K.subscription, { plan, since: Date.now() }),

  getPreferences: () => read<Record<string, unknown>>(K.prefs, {}),
  setPreferences: (prefs: Record<string, unknown>) => write(K.prefs, prefs),

  getStudyProgress: () => read<Record<string, number>>(K.studies, {}),
  async setStudyProgress(contentId: string, percent: number) {
    const map = await read<Record<string, number>>(K.studies, {})
    map[contentId] = Math.max(map[contentId] ?? 0, Math.round(percent))
    await write(K.studies, map)
  },
}
