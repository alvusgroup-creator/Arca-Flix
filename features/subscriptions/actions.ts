"use server"

import { redirect } from "next/navigation"
import { isDemoMode, publicEnv } from "@/lib/env"
import { isStripeConfigured } from "@/lib/env.server"
import { demoStore } from "@/lib/demo/store"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { requireAccount } from "@/services/auth"
import { getPlanBySlug, getSubscription } from "@/services/subscriptions"

type Result = { error?: string }

async function getOrCreateCustomer(userId: string, email: string, name: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("stripe_customer_id").eq("id", userId).single()
  if (data?.stripe_customer_id) return data.stripe_customer_id as string

  const customer = await getStripe().customers.create({ email, name, metadata: { user_id: userId } })
  // stripe_customer_id é protegido contra escrita do utilizador: grava com service role.
  await createAdminClient().from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId)
  return customer.id
}

/** Inicia o Stripe Checkout. O acesso só é liberado pelo webhook. */
export async function startCheckout(planSlug: string): Promise<Result> {
  const account = await requireAccount()
  const plan = await getPlanBySlug(planSlug)
  if (!plan) return { error: "Plano não encontrado." }

  if (isDemoMode) {
    await demoStore.setSubscription(plan.slug)
    redirect(`/success?plan=${plan.slug}`)
  }

  if (!isStripeConfigured || !plan.stripePriceId) {
    return { error: "Pagamentos ainda não estão configurados para este plano." }
  }

  const current = await getSubscription(account.id)
  if (current && (current.status === "active" || current.status === "trialing")) {
    return { error: "Você já tem uma assinatura ativa. Gerencie-a em Configurações › Assinatura." }
  }

  let url: string | null = null
  try {
    const customer = await getOrCreateCustomer(account.id, account.email, account.fullName)
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: account.id,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      subscription_data: { metadata: { user_id: account.id, plan_id: plan.id } },
      metadata: { user_id: account.id, plan_id: plan.id },
      allow_promotion_codes: true,
      locale: "pt-BR",
      success_url: `${publicEnv.appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${publicEnv.appUrl}/checkout?plan=${plan.slug}&canceled=1`,
    })
    url = session.url
  } catch (err) {
    console.error("[checkout]", err)
    return { error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." }
  }
  if (!url) return { error: "Não foi possível iniciar o pagamento." }
  redirect(url)
}

/** Portal do cliente Stripe: trocar cartão, cancelar, ver faturas. */
export async function openBillingPortal(): Promise<Result> {
  const account = await requireAccount()
  if (isDemoMode || !isStripeConfigured) {
    return { error: "O portal de pagamento fica disponível após configurar o Stripe." }
  }
  const subscription = await getSubscription(account.id)
  if (!subscription?.stripeCustomerId) return { error: "Nenhuma assinatura encontrada." }

  let url: string
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${publicEnv.appUrl}/settings/subscription`,
    })
    url = session.url
  } catch (err) {
    console.error("[billing-portal]", err)
    return { error: "Não foi possível abrir o portal de pagamento." }
  }
  redirect(url)
}
