// Sincroniza os planos do Supabase com o Stripe e configura o portal do cliente.
// Uso: npm run stripe:sync   (lê .env.local)
//
// Para cada plano ativo garante um Produto + Preço recorrente no Stripe e grava
// o price_... em subscription_plans.stripe_price_id. Preços no Stripe são
// imutáveis: se o valor ou o intervalo mudar, cria um preço novo (lookup_key
// diferente) e o antigo deixa de ser usado. Pode rodar quantas vezes quiser.

import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const required = ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
for (const key of required) {
  if (!process.env[key]) throw new Error(`Falta ${key} no .env.local`)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "")

type Plan = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  currency: string
  billing_interval: "month" | "year"
  stripe_price_id: string | null
}

const { data: plans, error } = await db
  .from("subscription_plans")
  .select("id, slug, name, description, price, currency, billing_interval, stripe_price_id")
  .eq("active", true)
  .order("sort_order")
if (error) throw error

for (const plan of plans as Plan[]) {
  const lookupKey = `arcaflix_${plan.slug}_${plan.billing_interval}_${plan.price}_${plan.currency.toLowerCase()}`
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 })
  let price = existing.data[0]

  if (!price) {
    // Reaproveita o produto do plano (metadata.plan_id) se já existir.
    const products = await stripe.products.search({ query: `metadata['plan_id']:'${plan.id}'` })
    const product =
      products.data[0] ??
      (await stripe.products.create({
        name: `Arca Flix ${plan.name}`,
        description: plan.description || undefined,
        metadata: { plan_id: plan.id, slug: plan.slug },
      }))

    price = await stripe.prices.create({
      product: product.id,
      currency: plan.currency.toLowerCase(),
      unit_amount: plan.price,
      recurring: { interval: plan.billing_interval },
      lookup_key: lookupKey,
      metadata: { plan_id: plan.id, slug: plan.slug },
    })
    await stripe.products.update(product.id, { default_price: price.id })
    console.log(`+ ${plan.name}: preço criado ${price.id}`)
  } else {
    console.log(`= ${plan.name}: preço já existe ${price.id}`)
  }

  if (plan.stripe_price_id !== price.id) {
    const { error: updateError } = await db
      .from("subscription_plans")
      .update({ stripe_price_id: price.id })
      .eq("id", plan.id)
    if (updateError) throw updateError
    console.log(`  → subscription_plans.stripe_price_id atualizado`)
  }
}

// Portal do cliente: trocar cartão, ver faturas e cancelar ao fim do período.
const configs = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 })
if (!configs.data.length) {
  await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Arca Flix — gerencie a sua assinatura",
      privacy_policy_url: `${appUrl}/privacidade`,
      terms_of_service_url: `${appUrl}/termos`,
    },
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "name"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
    },
  })
  console.log("+ Portal do cliente configurado")
} else {
  console.log("= Portal do cliente já configurado")
}

console.log("Pronto.")
