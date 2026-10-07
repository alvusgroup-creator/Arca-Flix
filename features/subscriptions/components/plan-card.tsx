import Link from "next/link"
import { Check, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPrice, intervalLabel } from "@/utils/format"
import type { SubscriptionPlan } from "@/types"

export function PlanCard({
  plan,
  href,
  cta = "Assinar",
  example = false,
  current = false,
  monthlyReferenceCents,
}: {
  plan: SubscriptionPlan
  href: string
  cta?: string
  /** Preço fictício (modo demonstração): mostra selo "Exemplo". */
  example?: boolean
  current?: boolean
  /** Preço do plano mensal mais barato — para mostrar a economia do anual */
  monthlyReferenceCents?: number
}) {
  const perMonth = plan.billingInterval === "year" ? Math.round(plan.priceCents / 12) : null
  const yearlySaving =
    perMonth !== null && monthlyReferenceCents ? monthlyReferenceCents * 12 - plan.priceCents : 0

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-6 sm:p-7",
        plan.highlighted ? "border-grape-500 ring-1 ring-grape-500" : "border-grape-900/10"
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-md bg-grape-600 px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-white uppercase">
          <Sparkles className="size-3" aria-hidden="true" /> Mais escolhido
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        {example && (
          <span className="rounded-full border border-grape-600/20 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-foreground/60 uppercase">
            Exemplo
          </span>
        )}
      </div>
      {plan.description && <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>}

      <p className="mt-6 flex items-baseline gap-1">
        <span className="font-heading text-4xl font-bold tracking-tight">{formatPrice(plan.priceCents, plan.currency)}</span>
        <span className="text-sm text-muted-foreground">/{intervalLabel[plan.billingInterval]}</span>
      </p>
      <p className="mt-1 min-h-5 text-sm font-semibold text-grape-600">
        {perMonth !== null
          ? `equivale a ${formatPrice(perMonth, plan.currency)}/mês${yearlySaving > 0 ? ` · economize ${formatPrice(yearlySaving, plan.currency)}` : ""}`
          : "cobrado todo mês"}
      </p>

      <ul className="mt-6 flex-1 space-y-3 text-[0.95rem]">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-lilac-400" aria-hidden="true" />
            <span className="text-grape-900">{f}</span>
          </li>
        ))}
      </ul>

      {current ? (
        <span className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-8 pointer-events-none")}>Plano atual</span>
      ) : (
        <Link
          href={href}
          className={cn(buttonVariants({ variant: plan.highlighted ? "default" : "outline", size: "lg" }), "mt-8")}
        >
          {cta}
        </Link>
      )}
    </article>
  )
}
