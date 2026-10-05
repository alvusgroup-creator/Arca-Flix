"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isDemoMode, publicEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { demoStore } from "@/lib/demo/store"
import { touchDevice } from "@/services/account"
import { ACTIVE_PROFILE_COOKIE } from "@/services/profiles"
import {
  forgotSchema,
  loginSchema,
  registerSchema,
  resetSchema,
  safeNext,
  type ActionResult,
  type ForgotInput,
  type LoginInput,
  type RegisterInput,
  type ResetInput,
} from "./schemas"

const firstError = (issues: { message: string }[]) => ({ error: issues[0]?.message ?? "Dados inválidos." })

export async function signIn(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return firstError(parsed.error.issues)
  const { email, password, next } = parsed.data

  if (isDemoMode) {
    const name = email.split("@")[0]
    await demoStore.setSession({ name, email })
    if ((await demoStore.getProfiles()).length === 0) {
      await demoStore.setProfiles([
        { id: "p-familia", name: name.charAt(0).toUpperCase() + name.slice(1), avatar: "lion", kind: "adult", maxAgeRating: "18", pin: null, blockedCategoryIds: [] },
        { id: "p-kids", name: "Kids", avatar: "lamb", kind: "kids", maxAgeRating: "10", pin: null, blockedCategoryIds: [] },
      ])
    }
    if (!(await demoStore.getSubscription())) await demoStore.setSubscription("anual")
    redirect(safeNext(next))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return {
      error:
        error.code === "email_not_confirmed"
          ? "Confirme o seu e-mail antes de entrar."
          : "E-mail ou senha incorretos.",
    }
  }
  await touchDevice(data.user.id).catch(() => undefined)
  redirect(safeNext(next))
}

export async function signUp(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return firstError(parsed.error.issues)
  const { name, email, password } = parsed.data

  if (isDemoMode) {
    await demoStore.clear()
    await demoStore.setSession({ name, email })
    redirect("/plans?step=2")
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${publicEnv.appUrl}/auth/callback?next=${encodeURIComponent("/plans?step=2")}`,
    },
  })
  if (error) {
    return {
      error: error.code === "user_already_exists" ? "Já existe uma conta com este e-mail." : "Não foi possível criar a conta. Tente novamente.",
    }
  }
  if (!data.session) {
    return { success: `Enviamos um link de confirmação para ${email}. Abra-o para continuar.` }
  }
  redirect("/plans?step=2")
}

export async function signInWithGoogle(next?: string): Promise<ActionResult> {
  if (isDemoMode) return { error: "O login com Google fica disponível após configurar o Supabase." }
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${publicEnv.appUrl}/auth/callback?next=${encodeURIComponent(safeNext(next))}` },
  })
  if (error || !data.url) return { error: "Não foi possível iniciar o login com Google." }
  redirect(data.url)
}

export async function requestPasswordReset(input: ForgotInput): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse(input)
  if (!parsed.success) return firstError(parsed.error.issues)

  if (!isDemoMode) {
    const supabase = await createClient()
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${publicEnv.appUrl}/auth/callback?next=/reset-password`,
    })
  }
  // Mesma resposta exista ou não a conta (não revela e-mails cadastrados).
  return { success: "Se existir uma conta com este e-mail, enviaremos um link para redefinir a senha." }
}

export async function updatePassword(input: ResetInput): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(input)
  if (!parsed.success) return firstError(parsed.error.issues)
  if (isDemoMode) redirect("/profiles")

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: "O link expirou. Peça um novo e-mail de recuperação." }
  redirect("/profiles")
}

export async function signOut() {
  if (isDemoMode) {
    await demoStore.clear()
  } else {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  ;(await cookies()).delete(ACTIVE_PROFILE_COOKIE)
  redirect("/login")
}
