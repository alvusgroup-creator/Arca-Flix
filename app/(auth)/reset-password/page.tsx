import type { Metadata } from "next"
import { AuthCard } from "@/features/auth/components/auth-card"
import { ResetForm } from "@/features/auth/components/reset-form"
import { requireAccount } from "@/services/auth"

export const metadata: Metadata = { title: "Nova senha" }

export default async function ResetPasswordPage() {
  // O link do e-mail cria a sessão em /auth/callback antes de chegar aqui.
  await requireAccount()
  return (
    <AuthCard title="Criar nova senha" description="Escolha uma senha com pelo menos 8 caracteres.">
      <ResetForm />
    </AuthCard>
  )
}
