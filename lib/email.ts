import "server-only"
import { Resend } from "resend"
import { isResendConfigured, serverEnv } from "@/lib/env.server"

/** Envia e-mail transacional. Sem RESEND_API_KEY apenas regista no log. */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!isResendConfigured) {
    console.info(`[email] (Resend não configurado) → ${to}: ${subject}`)
    return
  }
  const resend = new Resend(serverEnv.resendApiKey)
  const { error } = await resend.emails.send({ from: serverEnv.emailFrom, to, subject, html })
  if (error) console.error("[email] falha ao enviar", error)
}

export function subscriptionActivatedEmail(name: string, planName: string) {
  return `
    <div style="font-family:Arial,sans-serif;background:#090B0F;color:#F5F2EC;padding:32px">
      <h1 style="color:#F2C14E;font-size:22px">Bem-vindo(a) ao Arca Flix!</h1>
      <p>Olá${name ? `, ${name}` : ""}! A sua assinatura <strong>${planName}</strong> está ativa.</p>
      <p>Já pode escolher um perfil e começar a assistir com a família.</p>
    </div>`
}
