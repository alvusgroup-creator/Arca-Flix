import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { EmptyState } from "@/components/shared/empty-state"
import { OnboardingSteps } from "@/components/shared/onboarding-steps"
import { PlanCard } from "@/features/subscriptions/components/plan-card"
import { isDemoMode } from "@/lib/env"
import { getCurrentAccount } from "@/services/auth"
import { getSubscription, listPlans } from "@/services/subscriptions"

export const metadata: Metadata = {
  title: "Planos",
  description: "Escolha o plano do Arca Flix para sua família: séries, filmes, músicas e atividades cristãs.",
  alternates: { canonical: "/plans" },
}

function cheapestMonthly(plans: { billingInterval: string; priceCents: number }[]) {
  const min = Math.min(...plans.filter((p) => p.billingInterval === "month").map((p) => p.priceCents))
  return Number.isFinite(min) ? min : undefined
}

export default async function PlansPage({ searchParams }: PageProps<"/plans">) {
  const [account, plans, { step, required }] = await Promise.all([getCurrentAccount(), listPlans(), searchParams])
  const subscription = account ? await getSubscription(account.id) : null
  const onboarding = Boolean(account && step === "2")

  return (
    <div className="relative isolate min-h-dvh">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top,rgb(123_47_190/0.35),transparent_65%)]"
      />
      <PublicHeader signedIn={Boolean(account)} />

      <main className="page-x mx-auto max-w-6xl pt-6 pb-20">
        {onboarding && <OnboardingSteps current={2} className="mb-8" />}
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="inline-flex rounded-full border border-lilac-400/30 bg-lilac-400/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-lilac-400 uppercase">
            Planos
          </p>
          <h1 className="text-3xl font-semibold sm:text-5xl">
            {required ? "Assine para assistir" : "Um plano para toda a família"}
          </h1>
          <p className="text-muted-foreground sm:text-lg">
            Conteúdo cristão sem anúncios, com perfis infantis e controle parental. Cancele quando quiser.
          </p>
        </div>

        {plans.length ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
            {plans.map((plan) => (
              <PlanCard
                monthlyReferenceCents={cheapestMonthly(plans)}
                key={plan.id}
                plan={plan}
                example={isDemoMode || !plan.stripePriceId}
                current={subscription?.plan?.id === plan.id && subscription.status === "active"}
                href={account ? `/checkout?plan=${plan.slug}` : `/register?plan=${plan.slug}`}
                cta={account ? "Escolher plano" : "Começar agora"}
              />
            ))}
          </div>
        ) : (
          <EmptyState className="mt-12" icon={ShieldCheck} title="Planos indisponíveis" description="Os planos estão sendo atualizados. Volte em instantes." />
        )}

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-lilac-400" aria-hidden="true" />
          Pagamento seguro processado pelo Stripe.
        </p>
      </main>
    </div>
  )
}
