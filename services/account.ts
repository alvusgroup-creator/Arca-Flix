import "server-only"
import { headers } from "next/headers"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { demoStore } from "@/lib/demo/store"
import type { Device } from "@/types"

export interface AccountPreferences {
  language: "pt-BR"
  notifyNewContent: boolean
  notifyEmail: boolean
  autoplayNext: boolean
  captionsByDefault: boolean
}

export const defaultPreferences: AccountPreferences = {
  language: "pt-BR",
  notifyNewContent: true,
  notifyEmail: true,
  autoplayNext: true,
  captionsByDefault: false,
}

export async function getPreferences(userId: string): Promise<AccountPreferences> {
  if (isDemoMode) return { ...defaultPreferences, ...(await demoStore.getPreferences()) }
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("preferences").eq("id", userId).maybeSingle()
  return { ...defaultPreferences, ...((data?.preferences as Partial<AccountPreferences>) ?? {}) }
}

export async function savePreferences(userId: string, prefs: Partial<AccountPreferences>) {
  const next = { ...(await getPreferences(userId)), ...prefs }
  if (isDemoMode) return demoStore.setPreferences({ ...next })
  const supabase = await createClient()
  const { error } = await supabase.from("profiles").update({ preferences: next }).eq("id", userId)
  if (error) throw error
}

export async function saveFullName(userId: string, fullName: string) {
  if (isDemoMode) {
    const session = await demoStore.getSession()
    if (session) await demoStore.setSession({ ...session, name: fullName })
    return
  }
  const supabase = await createClient()
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId)
  if (error) throw error
  await supabase.auth.updateUser({ data: { full_name: fullName } })
}

/** Nome legível do aparelho a partir do user agent. */
export function describeUserAgent(ua: string) {
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Dispositivo"
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navegador"
  return `${browser} · ${os}`
}

/** Regista/atualiza o aparelho atual (chamado no login). */
export async function touchDevice(userId: string) {
  if (isDemoMode) return
  const ua = (await headers()).get("user-agent") ?? ""
  const name = describeUserAgent(ua)
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("devices")
    .select("id")
    .eq("user_id", userId)
    .eq("user_agent", ua)
    .maybeSingle()
  if (existing) {
    await supabase.from("devices").update({ last_seen_at: new Date().toISOString() }).eq("id", existing.id)
  } else {
    await supabase.from("devices").insert({ user_id: userId, name, user_agent: ua })
  }
}

export async function listDevices(userId: string): Promise<Device[]> {
  const ua = (await headers()).get("user-agent") ?? ""
  if (isDemoMode) {
    return [{ id: "current", name: describeUserAgent(ua), lastSeenAt: new Date().toISOString(), current: true }]
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from("devices")
    .select("id, name, user_agent, last_seen_at")
    .eq("user_id", userId)
    .order("last_seen_at", { ascending: false })
  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    lastSeenAt: d.last_seen_at,
    current: d.user_agent === ua,
  }))
}

export async function removeDevice(userId: string, deviceId: string) {
  if (isDemoMode) return
  const supabase = await createClient()
  await supabase.from("devices").delete().eq("id", deviceId).eq("user_id", userId)
}

export async function clearWatchHistory(userId: string) {
  if (isDemoMode) {
    await demoStore.clearProgress()
    return
  }
  const supabase = await createClient()
  const { error } = await supabase.from("watch_history").delete().eq("user_id", userId)
  if (error) throw error
}
