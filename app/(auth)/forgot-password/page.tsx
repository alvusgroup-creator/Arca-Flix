import type { Metadata } from "next"
import { AuthCard } from "@/features/auth/components/auth-card"
import { ForgotForm } from "@/features/auth/components/forgot-form"

export const metadata: Metadata = { title: "Recuperar senha" }

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Recuperar senha" description="Informe seu e-mail e enviaremos um link para criar uma nova senha.">
      <ForgotForm />
    </AuthCard>
  )
}
