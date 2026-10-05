import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { mapProfile, type UserProfileRowDb } from "@/lib/supabase/mappers"
import { DEMO_USER_ID, demoStore, type DemoProfile } from "@/lib/demo/store"
import { requireAccount } from "@/services/auth"
import type { AgeRating, ProfileKind, ViewerProfile } from "@/types"

export const ACTIVE_PROFILE_COOKIE = "af_profile"

const PROFILE_COLUMNS =
  "id, user_id, name, avatar, kind, max_age_rating, pin_hash, allowed_category_ids, blocked_category_ids"

function fromDemo(p: DemoProfile): ViewerProfile {
  return {
    id: p.id,
    userId: DEMO_USER_ID,
    name: p.name,
    avatar: p.avatar,
    kind: p.kind,
    maxAgeRating: p.maxAgeRating,
    hasPin: Boolean(p.pin),
    allowedCategoryIds: [],
    blockedCategoryIds: p.blockedCategoryIds,
  }
}

export const listProfiles = cache(async (userId: string): Promise<ViewerProfile[]> => {
  if (isDemoMode) return (await demoStore.getProfiles()).map(fromDemo)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .order("created_at")
  if (error) throw error
  return (data as UserProfileRowDb[]).map(mapProfile)
})

/** Hash do PIN (apenas servidor) — null quando o perfil não tem PIN. */
export async function getProfilePinHash(userId: string, profileId: string) {
  if (isDemoMode) {
    return (await demoStore.getProfiles()).find((p) => p.id === profileId)?.pin ?? null
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from("user_profiles")
    .select("pin_hash")
    .eq("id", profileId)
    .eq("user_id", userId)
    .maybeSingle()
  return (data?.pin_hash as string | null) ?? null
}

export const getActiveProfile = cache(async (): Promise<ViewerProfile | null> => {
  const account = await requireAccount()
  const id = (await cookies()).get(ACTIVE_PROFILE_COOKIE)?.value
  if (!id) return null
  const profiles = await listProfiles(account.id)
  return profiles.find((p) => p.id === id) ?? null
})

/** Garante conta + perfil escolhido; caso contrário envia para "Quem vai assistir?". */
export async function requireActiveProfile() {
  const account = await requireAccount()
  const profile = await getActiveProfile()
  if (!profile) redirect("/profiles")
  return { account, profile }
}

export interface ProfileInput {
  name: string
  avatar: string
  kind: ProfileKind
  maxAgeRating: AgeRating
  pinHash?: string | null
  blockedCategoryIds?: string[]
}

export async function insertProfile(userId: string, input: ProfileInput) {
  if (isDemoMode) {
    const profiles = await demoStore.getProfiles()
    const profile: DemoProfile = {
      id: `p${Date.now().toString(36)}`,
      name: input.name,
      avatar: input.avatar,
      kind: input.kind,
      maxAgeRating: input.maxAgeRating,
      pin: input.pinHash ?? null,
      blockedCategoryIds: input.blockedCategoryIds ?? [],
    }
    await demoStore.setProfiles([...profiles, profile])
    return profile.id
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      user_id: userId,
      name: input.name,
      avatar: input.avatar,
      kind: input.kind,
      max_age_rating: input.maxAgeRating,
      pin_hash: input.pinHash ?? null,
      blocked_category_ids: input.blockedCategoryIds ?? [],
    })
    .select("id")
    .single()
  if (error) throw error
  return data.id as string
}

/** `pinHash`: undefined mantém, null remove, string substitui. */
export async function patchProfile(userId: string, profileId: string, input: Partial<ProfileInput>) {
  if (isDemoMode) {
    const profiles = await demoStore.getProfiles()
    await demoStore.setProfiles(
      profiles.map((p) =>
        p.id !== profileId
          ? p
          : {
              ...p,
              name: input.name ?? p.name,
              avatar: input.avatar ?? p.avatar,
              kind: input.kind ?? p.kind,
              maxAgeRating: input.maxAgeRating ?? p.maxAgeRating,
              pin: input.pinHash === undefined ? p.pin : input.pinHash,
              blockedCategoryIds: input.blockedCategoryIds ?? p.blockedCategoryIds,
            }
      )
    )
    return
  }

  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.avatar !== undefined) patch.avatar = input.avatar
  if (input.kind !== undefined) patch.kind = input.kind
  if (input.maxAgeRating !== undefined) patch.max_age_rating = input.maxAgeRating
  if (input.pinHash !== undefined) patch.pin_hash = input.pinHash
  if (input.blockedCategoryIds !== undefined) patch.blocked_category_ids = input.blockedCategoryIds

  const supabase = await createClient()
  const { error } = await supabase
    .from("user_profiles")
    .update(patch)
    .eq("id", profileId)
    .eq("user_id", userId)
  if (error) throw error
}

export async function removeProfile(userId: string, profileId: string) {
  if (isDemoMode) {
    const profiles = await demoStore.getProfiles()
    await demoStore.setProfiles(profiles.filter((p) => p.id !== profileId))
    return
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from("user_profiles")
    .delete()
    .eq("id", profileId)
    .eq("user_id", userId)
  if (error) throw error
}
