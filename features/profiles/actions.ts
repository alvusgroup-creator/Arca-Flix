"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { hashPin, verifyPin } from "@/lib/pin"
import { requireAccount } from "@/services/auth"
import {
  ACTIVE_PROFILE_COOKIE,
  getActiveProfile,
  requireFamilyManager,
  getProfilePinHash,
  insertProfile,
  listProfiles,
  patchProfile,
  removeProfile,
} from "@/services/profiles"
import { getSubscription } from "@/services/subscriptions"
import { defaultMaxRating } from "@/utils/age-rating"
import { parentalSchema, profileSchema, type ParentalFormValues, type ProfileFormValues } from "./schemas"

type Result = { error?: string; ok?: boolean }

const DEFAULT_MAX_PROFILES = 5
const ADULT_ONLY = "Peça a um adulto: entre no perfil adulto (com o PIN) para fazer isso."

async function ownedProfile(profileId: string) {
  const account = await requireAccount()
  const profile = (await listProfiles(account.id)).find((p) => p.id === profileId)
  return { account, profile }
}

export async function selectProfile(profileId: string, pin?: string): Promise<Result> {
  const { account, profile } = await ownedProfile(profileId)
  if (!profile) return { error: "Perfil não encontrado." }

  if (profile.hasPin) {
    if (!pin) return { error: "PIN_REQUIRED" }
    const stored = await getProfilePinHash(account.id, profileId)
    if (!verifyPin(pin, stored)) return { error: "PIN incorreto." }
  }

  ;(await cookies()).set(ACTIVE_PROFILE_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  return { ok: true }
}

export async function createProfile(values: ProfileFormValues): Promise<Result & { id?: string }> {
  if (!(await requireFamilyManager()).allowed) return { error: ADULT_ONLY }
  const parsed = profileSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const account = await requireAccount()
  const [profiles, subscription] = await Promise.all([listProfiles(account.id), getSubscription(account.id)])
  const max = subscription?.plan?.maxProfiles ?? DEFAULT_MAX_PROFILES
  if (profiles.length >= max) {
    return { error: `O seu plano permite até ${max} perfis.` }
  }

  const id = await insertProfile(account.id, {
    ...parsed.data,
    maxAgeRating: defaultMaxRating[parsed.data.kind],
  })
  revalidatePath("/profiles")
  revalidatePath("/settings/profiles")
  return { ok: true, id }
}

export async function updateProfile(profileId: string, values: ProfileFormValues): Promise<Result> {
  if (!(await requireFamilyManager()).allowed) return { error: ADULT_ONLY }
  const parsed = profileSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { account, profile } = await ownedProfile(profileId)
  if (!profile) return { error: "Perfil não encontrado." }

  await patchProfile(account.id, profileId, {
    ...parsed.data,
    // Ao mudar o tipo, aplica a classificação padrão do novo tipo.
    maxAgeRating: parsed.data.kind !== profile.kind ? defaultMaxRating[parsed.data.kind] : undefined,
  })
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function updateParentalControls(profileId: string, values: ParentalFormValues): Promise<Result> {
  const parsed = parentalSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { account, profile } = await ownedProfile(profileId)
  if (!profile) return { error: "Perfil não encontrado." }
  const active = await getActiveProfile()
  if (active?.kind !== "adult") return { error: "Apenas um perfil adulto pode alterar o controle parental." }

  const { pin, ...rest } = parsed.data
  await patchProfile(account.id, profileId, {
    ...rest,
    pinHash: pin === undefined ? undefined : pin === "" ? null : hashPin(pin),
  })
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function deleteProfile(profileId: string): Promise<Result> {
  if (!(await requireFamilyManager()).allowed) return { error: ADULT_ONLY }
  const { account, profile } = await ownedProfile(profileId)
  if (!profile) return { error: "Perfil não encontrado." }
  const profiles = await listProfiles(account.id)
  if (profiles.length <= 1) return { error: "A conta precisa de pelo menos um perfil." }

  await removeProfile(account.id, profileId)
  const store = await cookies()
  if (store.get(ACTIVE_PROFILE_COOKIE)?.value === profileId) store.delete(ACTIVE_PROFILE_COOKIE)
  revalidatePath("/", "layout")
  return { ok: true }
}
