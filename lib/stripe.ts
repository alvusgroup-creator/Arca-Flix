import "server-only"
import Stripe from "stripe"
import { serverEnv } from "@/lib/env.server"

let client: Stripe | null = null

export function getStripe() {
  if (!serverEnv.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY não configurada.")
  client ??= new Stripe(serverEnv.stripeSecretKey)
  return client
}
