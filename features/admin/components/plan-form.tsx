"use client"

import { useActionState } from "react"
import type { SubscriptionPlan } from "@/types"
import { savePlan } from "../actions"
import { Field, SubmitButton, Toggle, inputClass, textareaClass, useActionToast } from "./form-kit"

export function PlanForm({ plan }: { plan?: SubscriptionPlan & { sortOrder: number } }) {
  const [state, action] = useActionState(savePlan, null)
  useActionToast(state)
  const key = plan?.id ?? "new"

  return (
    <form action={action} className="grid gap-4 md:grid-cols-4">
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <Field label="Nome" htmlFor={`pl-name-${key}`} className="md:col-span-2">
        <input id={`pl-name-${key}`} name="name" required defaultValue={plan?.name} className={inputClass} />
      </Field>
      <Field label="Slug" htmlFor={`pl-slug-${key}`} className="md:col-span-2">
        <input id={`pl-slug-${key}`} name="slug" required defaultValue={plan?.slug} className={inputClass} />
      </Field>
      <Field label="Descrição" htmlFor={`pl-desc-${key}`} className="md:col-span-4">
        <input id={`pl-desc-${key}`} name="description" defaultValue={plan?.description} className={inputClass} />
      </Field>
      <Field label="Preço (R$)" htmlFor={`pl-price-${key}`} hint="Igual ao preço no Stripe.">
        <input
          id={`pl-price-${key}`}
          name="priceCents"
          required
          inputMode="decimal"
          defaultValue={plan ? (plan.priceCents / 100).toFixed(2).replace(".", ",") : ""}
          className={inputClass}
        />
      </Field>
      <Field label="Cobrança" htmlFor={`pl-int-${key}`}>
        <select id={`pl-int-${key}`} name="billingInterval" defaultValue={plan?.billingInterval ?? "month"} className={inputClass}>
          <option value="month">Mensal</option>
          <option value="year">Anual</option>
        </select>
      </Field>
      <Field label="Máx. perfis" htmlFor={`pl-prof-${key}`}>
        <input id={`pl-prof-${key}`} name="maxProfiles" type="number" min={1} defaultValue={plan?.maxProfiles ?? 3} className={inputClass} />
      </Field>
      <Field label="Telas simultâneas" htmlFor={`pl-dev-${key}`}>
        <input id={`pl-dev-${key}`} name="maxDevices" type="number" min={1} defaultValue={plan?.maxDevices ?? 2} className={inputClass} />
      </Field>
      <Field label="Benefícios" htmlFor={`pl-feat-${key}`} hint="Um por linha." className="md:col-span-2">
        <textarea id={`pl-feat-${key}`} name="features" defaultValue={plan?.features.join("\n")} className={textareaClass} />
      </Field>
      <div className="space-y-4 md:col-span-2">
        <Field label="Stripe Price ID" htmlFor={`pl-stripe-${key}`} hint="price_... do produto no Stripe.">
          <input id={`pl-stripe-${key}`} name="stripePriceId" defaultValue={plan?.stripePriceId ?? ""} className={inputClass} />
        </Field>
        <Field label="Ordem" htmlFor={`pl-sort-${key}`}>
          <input id={`pl-sort-${key}`} name="sortOrder" type="number" min={0} defaultValue={plan?.sortOrder ?? 0} className={inputClass} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3 md:col-span-4">
        <Toggle name="active" label="Ativo (aparece na página de planos)" defaultChecked={plan?.active ?? true} />
        <Toggle name="highlighted" label="Destacar como “Mais escolhido”" defaultChecked={plan?.highlighted ?? false} />
      </div>
      <div className="flex justify-end md:col-span-4">
        <SubmitButton>{plan ? "Salvar plano" : "Criar plano"}</SubmitButton>
      </div>
    </form>
  )
}
