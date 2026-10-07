import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Check, CreditCard, ShieldCheck } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { OnboardingSteps } from "@/components/shared/onboarding-steps"
import { CheckoutButton } from "@/features/subscriptions/components/checkout-button"
import { isDemoMode } from "@/lib/env"
import { requireAccount } from "@/services/auth"
import { listProfiles } from "@/services/profiles"
import { getPlanBySlug } from "@/services/subscriptions"
import { formatPrice, intervalLabel } from "@/utils/format"

export const metadata: Metadata = { title: "Pagamento", robots: { index: false, follow: false } }

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const account = await requireAccount()
  const firstTime = (await listProfiles(account.id)).length === 0
  const { plan: slug, canceled } = await searchParams
  const plan = typeof slug === "string" ? await getPlanBySlug(slug) : null
  if (!plan) redirect("/plans?step=2")

  return (
    <div className="min-h-dvh">
      <PublicHeader signedIn />
      <main className="page-x mx-auto max-w-5xl pt-4 pb-20">
        {firstTime && <OnboardingSteps current={3} className="mb-10" />}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <section className="space-y-6">
            <Link href="/plans?step=2" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Trocar de plano
            </Link>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold sm:text-4xl">Finalize sua assinatura</h1>
              <p className="text-muted-foreground">
                Você será levado ao ambiente seguro do Stripe para pagar com cartão. O acesso é liberado assim que o
                pagamento for confirmado.
              </p>
            </div>

            {canceled && (
              <p role="status" className="rounded-xl border border-grape-600/10 bg-grape-600/5 px-4 py-3 text-sm text-foreground/80">
                O pagamento foi cancelado. Nenhum valor foi cobrado — pode tentar novamente quando quiser.
              </p>
            )}

            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: "Pagamento protegido", text: "Dados do cartão nunca passam pelos nossos servidores." },
                { icon: CreditCard, title: "Cancele quando quiser", text: "Sem fidelidade. Gerencie tudo em Configurações." },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-2xl border border-grape-600/[0.07] bg-surface-1 p-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-lilac-400" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-sm text-muted-foreground">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="h-fit rounded-3xl border border-grape-600/10 bg-surface-1 p-6 sm:p-8 lg:sticky lg:top-8">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Resumo</h2>
            <div className="mt-4 flex items-start justify-between gap-4 border-b border-grape-600/[0.07] pb-5">
              <div>
                <p className="text-xl font-semibold">Plano {plan.name}</p>
                <p className="text-sm text-muted-foreground">
                  Até {plan.maxProfiles} perfis · {plan.maxDevices} telas
                </p>
              </div>
              {(isDemoMode || !plan.stripePriceId) && (
                <span className="rounded-full border border-grape-600/20 px-2 py-0.5 text-[0.65rem] font-semibold text-foreground/60 uppercase">
                  Exemplo
                </span>
              )}
            </div>
            <ul className="space-y-2.5 py-5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-lilac-400" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-grape-600/[0.07] pt-5">
              <span className="text-muted-foreground">Total</span>
              <span>
                <span className="font-heading text-3xl font-bold">{formatPrice(plan.priceCents, plan.currency)}</span>
                <span className="text-sm text-muted-foreground">/{intervalLabel[plan.billingInterval]}</span>
              </span>
            </div>
            <div className="mt-6 space-y-3">
              <CheckoutButton planSlug={plan.slug} label={isDemoMode ? "Simular pagamento" : "Ir para o pagamento seguro"} />
              <p className="text-center text-xs text-foreground/45">Conta: {account.email}</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
