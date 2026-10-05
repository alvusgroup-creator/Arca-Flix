import "server-only"
import { isDemoMode } from "@/lib/env"
import { demoContent, demoPlans } from "@/lib/demo/data"
import { demoStore } from "@/lib/demo/store"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/services/auth"
import type { ContentType } from "@/types"

export interface DashboardStats {
  totalUsers: number
  activeSubscriptions: number
  contentCount: number
  totalViews: number
  /** Receita mensal recorrente estimada (centavos), planos anuais divididos por 12. */
  monthlyRevenueCents: number
  topContent: { id: string; title: string; type: ContentType; views: number }[]
  contentByType: Record<ContentType, number>
}

const emptyByType = (): Record<ContentType, number> => ({ series: 0, movie: 0, music: 0, coloring: 0, study: 0 })

/** Números do painel. Usa service role — só depois de requireAdmin(). */
export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin()

  if (isDemoMode) {
    const sub = await demoStore.getSubscription()
    const plan = demoPlans.find((p) => p.slug === sub?.plan)
    const byType = emptyByType()
    demoContent.forEach((c) => (byType[c.type] += 1))
    return {
      totalUsers: 1,
      activeSubscriptions: sub ? 1 : 0,
      contentCount: demoContent.length,
      totalViews: 0,
      monthlyRevenueCents: plan ? (plan.billingInterval === "year" ? Math.round(plan.priceCents / 12) : plan.priceCents) : 0,
      topContent: [],
      contentByType: byType,
    }
  }

  const db = createAdminClient()
  const [users, subs, content, top] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db
      .from("subscriptions")
      .select("status, subscription_plans(price, billing_interval)")
      .in("status", ["active", "trialing"]),
    db.from("content").select("type, view_count"),
    db.from("content").select("id, title, type, view_count").order("view_count", { ascending: false }).limit(5),
  ])

  type PlanEmbed = { price: number; billing_interval: "month" | "year" }
  const monthlyRevenueCents = (subs.data ?? []).reduce((sum, s) => {
    const plan = (Array.isArray(s.subscription_plans) ? s.subscription_plans[0] : s.subscription_plans) as PlanEmbed | null
    if (!plan || s.status !== "active") return sum
    return sum + (plan.billing_interval === "year" ? Math.round(plan.price / 12) : plan.price)
  }, 0)

  const byType = emptyByType()
  let totalViews = 0
  for (const c of content.data ?? []) {
    byType[c.type as ContentType] += 1
    totalViews += Number(c.view_count ?? 0)
  }

  return {
    totalUsers: users.count ?? 0,
    activeSubscriptions: subs.data?.length ?? 0,
    contentCount: content.data?.length ?? 0,
    totalViews,
    monthlyRevenueCents,
    topContent: (top.data ?? [])
      .filter((c) => Number(c.view_count) > 0)
      .map((c) => ({ id: c.id, title: c.title, type: c.type as ContentType, views: Number(c.view_count) })),
    contentByType: byType,
  }
}
