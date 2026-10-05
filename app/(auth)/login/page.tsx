import type { Metadata } from "next"
import { AuthCard } from "@/features/auth/components/auth-card"
import { LoginForm } from "@/features/auth/components/login-form"

export const metadata: Metadata = { title: "Entrar" }

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams
  return (
    <AuthCard title="Bem-vindo de volta" description="Entre para continuar assistindo com a sua família.">
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </AuthCard>
  )
}
