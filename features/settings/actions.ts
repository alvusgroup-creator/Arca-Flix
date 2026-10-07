"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { isDemoMode, publicEnv } from "@/lib/env"
import { isStripeConfigured } from "@/lib/env.server"
import { demoStore } from "@/lib/demo/store"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { resetSchema, type ResetInput } from "@/features/auth/schemas"
import {
  clearWatchHistory,
  removeDevice,
  saveFullName,
  savePreferences,
  type AccountPreferences,
} from "@/services/account"
import { requireAccount } from "@/services/auth"
import { ACTIVE_PROFILE_COOKIE, requireFamilyManager } from "@/services/profiles"

type Result = { error?: string; success?: string }

const nameSchema = z.object({ fullName: z.string().trim().min(2, "Informe seu nome.").max(60) })
const emailSchema = z.object({ email: z.string().trim().email("E-mail inválido.") })

export async function updateName(values: z.infer<typeof nameSchema>): Promise<Result> {
  if (!(await requireFamilyManager()).allowed) return { error: "Só um perfil adulto pode fazer isso." }
  const parsed = nameSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const account = await requireAccount()
  await saveFullName(account.id, parsed.data.fullName)
  revalidatePath("/settings", "layout")
  return { success: "Nome atualizado." }
}

export async function changeEmail(values: z.infer<typeof emailSchema>): Promise<Result> {
  if (!(await requireFamilyManager()).allowed) return { error: "Só um perfil adulto pode fazer isso." }
  const parsed = emailSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  await requireAccount()

  if (isDemoMode) {
    const session = await demoStore.getSession()
    if (session) await demoStore.setSession({ ...session, email: parsed.data.email })
    revalidatePath("/settings", "layout")
    return { success: "E-mail atualizado." }
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data.email },
    { emailRedirectTo: `${publicEnv.appUrl}/auth/callback?next=/settings/account` }
  )
  if (error) return { error: "Não foi possível alterar o e-mail." }
  return { success: "Enviamos um link de confirmação para o novo e-mail." }
}

export async function changePassword(values: ResetInput): Promise<Result> {
  if (!(await requireFamilyManager()).allowed) return { error: "Só um perfil adulto pode fazer isso." }
  const parsed = resetSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  await requireAccount()
  if (isDemoMode) return { success: "Senha alterada." }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: "Não foi possível alterar a senha. Entre novamente e tente outra vez." }
  return { success: "Senha alterada." }
}

export async function updatePreferences(prefs: Partial<AccountPreferences>): Promise<Result> {
  const account = await requireAccount()
  const allowed: (keyof AccountPreferences)[] = ["notifyNewContent", "notifyEmail", "autoplayNext", "captionsByDefault"]
  const clean = Object.fromEntries(
    Object.entries(prefs).filter(([k, v]) => allowed.includes(k as keyof AccountPreferences) && typeof v === "boolean")
  )
  await savePreferences(account.id, clean)
  revalidatePath("/settings", "layout")
  return { success: "Preferência salva." }
}

export async function signOutDevice(deviceId: string): Promise<Result> {
  if (!(await requireFamilyManager()).allowed) return { error: "Só um perfil adulto pode fazer isso." }
  const account = await requireAccount()
  await removeDevice(account.id, deviceId)
  revalidatePath("/settings/devices")
  return { success: "Dispositivo removido." }
}

export async function clearHistory(): Promise<Result> {
  if (!(await requireFamilyManager()).allowed) return { error: "Só um perfil adulto pode fazer isso." }
  const account = await requireAccount()
  await clearWatchHistory(account.id)
  revalidatePath("/", "layout")
  return { success: "Histórico apagado." }
}

export async function deleteAccount(): Promise<Result> {
  if (!(await requireFamilyManager()).allowed) return { error: "Só um perfil adulto pode fazer isso." }
  const account = await requireAccount()

  if (!isDemoMode) {
    const admin = createAdminClient()
    if (isStripeConfigured) {
      const { data: subs } = await admin
        .from("subscriptions")
        .select("stripe_subscription_id, status")
        .eq("user_id", account.id)
        .in("status", ["active", "trialing", "past_due"])
      for (const s of subs ?? []) {
        if (s.stripe_subscription_id) await getStripe().subscriptions.cancel(s.stripe_subscription_id).catch(() => undefined)
      }
    }
    const { error } = await admin.auth.admin.deleteUser(account.id)
    if (error) return { error: "Não foi possível excluir a conta. Contacte o suporte." }
    const supabase = await createClient()
    await supabase.auth.signOut()
  } else {
    await demoStore.clear()
  }

  ;(await cookies()).delete(ACTIVE_PROFILE_COOKIE)
  redirect("/")
}
