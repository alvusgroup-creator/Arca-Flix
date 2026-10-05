import "server-only"
import { cookies } from "next/headers"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { getSubscription } from "@/services/subscriptions"

export const DEVICE_COOKIE = "af_device"
const ALIVE_WINDOW_MS = 90_000
const DEFAULT_MAX_SCREENS = 2

async function deviceKey() {
  return (await cookies()).get(DEVICE_COOKIE)?.value ?? "unknown"
}

/**
 * Regista/renova a tela deste aparelho. Devolve false quando o plano já está
 * no limite de telas simultâneas (outros aparelhos ativos nos últimos 90s).
 */
export async function claimScreen(userId: string, profileId: string, contentId: string): Promise<boolean> {
  if (isDemoMode) return true
  const [key, subscription] = await Promise.all([deviceKey(), getSubscription(userId)])
  const max = subscription?.plan?.maxDevices ?? DEFAULT_MAX_SCREENS
  const supabase = await createClient()

  const since = new Date(Date.now() - ALIVE_WINDOW_MS).toISOString()
  const { count } = await supabase
    .from("playback_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("device_key", key)
    .gte("last_seen_at", since)
  if ((count ?? 0) >= max) return false

  await heartbeat(userId, profileId, contentId)
  return true
}

export async function heartbeat(userId: string, profileId: string, contentId: string) {
  if (isDemoMode) return
  const supabase = await createClient()
  await supabase.from("playback_sessions").upsert(
    {
      user_id: userId,
      device_key: await deviceKey(),
      profile_id: profileId,
      content_id: contentId,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,device_key" }
  )
}
