import type { Metadata } from "next"
import { OnboardingSteps } from "@/components/shared/onboarding-steps"
import { AuthCard } from "@/features/auth/components/auth-card"
import { RegisterForm } from "@/features/auth/components/register-form"
import { getPlanBySlug } from "@/services/subscriptions"
import { formatPrice, intervalLabel } from "@/utils/format"

export const metadata: Metadata = { title: "Criar conta" }

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { plan: slug } = await searchParams
  const plan = typeof slug === "string" ? await getPlanBySlug(slug) : null

  return (
    <AuthCard
      top={<OnboardingSteps current={1} />}
      title="Crie sua conta"
      description="Em poucos passos a família toda está assistindo."
    >
      <RegisterForm
        plan={
          plan
            ? { slug: plan.slug, label: `${plan.name} · ${formatPrice(plan.priceCents, plan.currency)}/${intervalLabel[plan.billingInterval]}` }
            : undefined
        }
      />
    </AuthCard>
  )
}
