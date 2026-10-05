import { z } from "zod"

const email = z.string().trim().min(1, "Informe o seu e-mail.").email("E-mail inválido.")
const password = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.")

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe a sua senha."),
  next: z.string().optional(),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe o seu nome.").max(60),
  email,
  password,
})

export const forgotSchema = z.object({ email })

export const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "As senhas não coincidem.", path: ["confirm"] })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotInput = z.infer<typeof forgotSchema>
export type ResetInput = z.infer<typeof resetSchema>

export type ActionResult = { error?: string; success?: string } | void

/** Evita open redirect: só caminhos internos. */
export function safeNext(next: string | undefined | null, fallback = "/profiles") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback
}
