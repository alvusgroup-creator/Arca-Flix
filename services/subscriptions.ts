import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { mapPlan, type PlanRowDb } from "@/lib/supabase/mappers"
import { demoPlans } from "@/lib/demo/data"
import { demoStore } from "@/lib/demo/store"
import { requireAccount } from "@/services/auth"
import type { Subscription, SubscriptionPlan } from "@/types"

const PLAN_COLUMNS =
  "id, name, slug, description, price, currency, billing_interval, max_profiles, max_devices, features, stripe_price_id, highlighted, active"

export const listPlans = cache(async (): Promise<SubscriptionPlan[]> => {
  if (isDemoMode) return demoPlans

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("subscription_plans")
    .select(PLAN_COLUMNS)
    .eq("active", true)
    .order("sort_order")
  if (error) throw error
  return (data as PlanRowDb[]).map(mapPlan)
})

export async function getPlanBySlug(slug: string) {
  return (await listPlans()).find((p) => p.slug === slug) ?? null
}

export const getSubscription = cache(async (userId: string): Promise<Subscription | null> => {
  if (isDemoMode) {
    const demo = await demoStore.getSubscription()
    if (!demo) return null
    const plan = demoPlans.find((p) => p.slug === demo.plan) ?? null
    const end = new Date(demo.since)
    end.setMonth(end.getMonth() + (plan?.billingInterval === "year" ? 12 : 1))
    return {
      id: "demo-subscription",
      userId,
      plan,
      status: "active",
      currentPeriodEnd: end.toISOString(),
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
    }
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("subscriptions")
    .select(`id, user_id, status, current_period_end, cancel_at_period_end, stripe_customer_id, subscription_plans(${PLAN_COLUMNS})`)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null

  const planRow = (Array.isArray(data.subscription_plans)
    ? data.subscription_plans[0]
    : data.subscription_plans) as PlanRowDb | null

  return {
    id: data.id,
    userId: data.user_id,
    plan: planRow ? mapPlan(planRow) : null,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    stripeCustomerId: data.stripe_customer_id,
  }
})

/** Regra única de acesso premium. Espelha public.has_active_subscription(). */
export async function hasActiveSubscription(userId: string) {
  const sub = await getSubscription(userId)
  if (!sub) return false
  const statusOk = sub.status === "active" || sub.status === "trialing"
  const periodOk = !sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date()
  return statusOk && periodOk
}

/** Para rotas premium (player, downloads): sem assinatura → planos. */
export async function requireSubscription() {
  const account = await requireAccount()
  if (!(await hasActiveSubscription(account.id))) redirect("/plans?required=1")
  return account
}
