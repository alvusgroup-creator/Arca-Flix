import type { Metadata } from "next"
import { OnboardingSteps } from "@/components/shared/onboarding-steps"
import { AuthCard } from "@/features/auth/components/auth-card"
import { RegisterForm } from "@/features/auth/components/register-form"

export const metadata: Metadata = { title: "Criar conta" }

export default function RegisterPage() {
  return (
    <AuthCard
      top={<OnboardingSteps current={1} />}
      title="Crie a sua conta"
      description="Em poucos passos a família toda está assistindo."
    >
      <RegisterForm />
    </AuthCard>
  )
}
