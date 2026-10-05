import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"
import { isStripeConfigured, serverEnv } from "@/lib/env.server"
import { sendEmail, subscriptionActivatedEmail } from "@/lib/email"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SubscriptionStatus } from "@/types"

// Fonte da verdade das assinaturas: o redirect de sucesso nunca libera acesso.

const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  unpaid: "past_due",
  paused: "past_due",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
}

const toIso = (seconds?: number | null) => (seconds ? new Date(seconds * 1000).toISOString() : null)

async function syncSubscription(subscriptionId: string, fallbackUserId?: string | null) {
  const stripe = getStripe()
  const supabase = createAdminClient()
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id

  let userId = sub.metadata.user_id || fallbackUserId || null
  if (!userId) {
    const { data } = await supabase.from("profiles").select("id").eq("stripe_customer_id", customerId).maybeSingle()
    userId = data?.id ?? null
  }
  if (!userId) throw new Error(`Utilizador não encontrado para a assinatura ${sub.id}`)

  const item = sub.items.data[0]
  let planId = sub.metadata.plan_id || null
  if (!planId && item?.price.id) {
    const { data } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("stripe_price_id", item.price.id)
      .maybeSingle()
    planId = data?.id ?? null
  }

  const { data: previous } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle()

  const status = statusMap[sub.status]
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: planId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status,
      current_period_start: toIso(item?.current_period_start),
      current_period_end: toIso(item?.current_period_end),
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" }
  )
  if (error) throw error

  const isActive = status === "active" || status === "trialing"
  const wasActive = previous?.status === "active" || previous?.status === "trialing"
  if (isActive && !wasActive) {
    const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", userId).single()
    const { data: plan } = planId
      ? await supabase.from("subscription_plans").select("name").eq("id", planId).single()
      : { data: null }
    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: "A sua assinatura Arca Flix está ativa",
        html: subscriptionActivatedEmail(profile.full_name ?? "", plan?.name ?? "Arca Flix"),
      })
    }
  }
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured || !serverEnv.stripeWebhookSecret) {
    return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 })

  let event: Stripe.Event
  try {
    const body = await request.text()
    event = getStripe().webhooks.constructEvent(body, signature, serverEnv.stripeWebhookSecret)
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        if (session.mode === "subscription" && session.subscription) {
          const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id
          await syncSubscription(id, session.client_reference_id)
        }
        break
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object.id)
        break
      default:
        break
    }
  } catch (err) {
    console.error(`[stripe-webhook] ${event.type}`, err)
    // 500 faz o Stripe reenviar o evento.
    return NextResponse.json({ error: "Falha ao processar" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
