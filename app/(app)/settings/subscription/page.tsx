import type { Metadata } from "next"
import Link from "next/link"
import { Check, CreditCard } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { SettingsCard, SettingsTitle } from "@/features/settings/components/settings-card"
import { BillingPortalButton } from "@/features/subscriptions/components/billing-portal-button"
import { isDemoMode } from "@/lib/env"
import { cn } from "@/lib/utils"
import { requireAccount } from "@/services/auth"
import { getSubscription } from "@/services/subscriptions"
import { formatDate, formatPrice, intervalLabel } from "@/utils/format"
import type { SubscriptionStatus } from "@/types"

export const metadata: Metadata = { title: "Assinatura" }

const statusLabel: Record<SubscriptionStatus, { text: string; tone: string }> = {
  active: { text: "Ativa", tone: "bg-emerald-500/15 text-emerald-300" },
  trialing: { text: "Período de teste", tone: "bg-emerald-500/15 text-emerald-300" },
  past_due: { text: "Pagamento pendente", tone: "bg-amber-500/15 text-amber-300" },
  canceled: { text: "Cancelada", tone: "bg-grape-600/10 text-foreground/70" },
  incomplete: { text: "Incompleta", tone: "bg-amber-500/15 text-amber-300" },
}

export default async function SubscriptionPage() {
  const account = await requireAccount()
  const subscription = await getSubscription(account.id)

  if (!subscription) {
    return (
      <>
        <SettingsTitle title="Assinatura" />
        <EmptyState
          icon={CreditCard}
          title="Nenhuma assinatura ativa"
          description="Escolha um plano para liberar séries, filmes, músicas e materiais para toda a família."
          action={
            <Link href="/plans" className={buttonVariants()}>
              Ver planos
            </Link>
          }
        />
      </>
    )
  }

  const plan = subscription.plan
  const status = statusLabel[subscription.status]

  return (
    <>
      <SettingsTitle title="Assinatura" description="Plano atual, renovação e forma de pagamento." />
      <div className="space-y-5">
        <SettingsCard title={plan ? `Plano ${plan.name}` : "Plano"}>
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", status.tone)}>{status.text}</span>
            {plan && (
              <span className="text-sm text-muted-foreground">
                {formatPrice(plan.priceCents, plan.currency)}/{intervalLabel[plan.billingInterval]}
                {isDemoMode && " · valor de exemplo"}
              </span>
            )}
          </div>

          {subscription.currentPeriodEnd && (
            <p className="mt-4 text-sm text-foreground/80">
              {subscription.cancelAtPeriodEnd || subscription.status === "canceled"
                ? `Acesso até ${formatDate(subscription.currentPeriodEnd)}. A assinatura não será renovada.`
                : `Próxima renovação em ${formatDate(subscription.currentPeriodEnd)}.`}
            </p>
          )}
          {subscription.status === "past_due" && (
            <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Não conseguimos cobrar o último pagamento. Atualize o cartão para não perder o acesso.
            </p>
          )}

          {plan && (
            <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-lilac-400" aria-hidden="true" /> {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <BillingPortalButton label="Trocar cartão e ver faturas" />
            <Link href="/plans" className={buttonVariants({ variant: "ghost" })}>
              Ver outros planos
            </Link>
          </div>
          {!subscription.cancelAtPeriodEnd && subscription.status !== "canceled" && (
            <div className="mt-6 border-t border-grape-900/10 pt-5">
              <p className="mb-3 text-sm text-muted-foreground">
                Sem multa e sem ligação: você continua com acesso até o fim do período já pago.
              </p>
              <BillingPortalButton label="Cancelar assinatura" variant="destructive" icon={false} />
            </div>
          )}
        </SettingsCard>
      </div>
    </>
  )
}
