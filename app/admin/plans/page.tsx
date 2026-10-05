import type { Metadata } from "next"
import { PageHeader } from "@/components/shared/page-header"
import { AdminCard } from "@/features/admin/components/form-kit"
import { PlanForm } from "@/features/admin/components/plan-form"
import { listAdminPlans } from "@/services/admin-content"
import { formatPrice, intervalLabel } from "@/utils/format"

export const metadata: Metadata = { title: "Planos" }

export default async function AdminPlansPage({ searchParams }: PageProps<"/admin/plans">) {
  const [{ saved }, plans] = await Promise.all([searchParams, listAdminPlans()])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planos"
        description="Valores, limites e benefícios exibidos na página de Planos. O preço cobrado vem do Stripe Price ID."
      />
      {saved && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Plano salvo.</p>}

      {plans.map((plan) => (
        <details key={plan.id} className="group rounded-3xl bg-white shadow-soft">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-5">
            <span className="flex-1">
              <span className="block text-lg font-semibold">{plan.name}</span>
              <span className="text-sm text-muted-foreground">
                {formatPrice(plan.priceCents, plan.currency)}/{intervalLabel[plan.billingInterval]} · até {plan.maxProfiles} perfis ·{" "}
                {plan.maxDevices} telas
              </span>
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${plan.active ? "bg-emerald-100 text-emerald-700" : "bg-surface-3 text-grape-700"}`}>
              {plan.active ? "Ativo" : "Inativo"}
            </span>
            {!plan.stripePriceId && <span className="rounded-full bg-sun-100 px-2.5 py-1 text-xs font-semibold text-orange-700">Sem Stripe</span>}
          </summary>
          <div className="border-t border-input p-5">
            <PlanForm plan={plan} />
          </div>
        </details>
      ))}

      <AdminCard title="Novo plano">
        <PlanForm />
      </AdminCard>
    </div>
  )
}
