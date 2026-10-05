// Encaminha os webhooks do Stripe (modo de teste) para o app local.
// Uso: npm run stripe:listen   (com `npm run dev` rodando em outro terminal)
// Usa a STRIPE_SECRET_KEY do .env.local — não precisa de `stripe login`.

import { spawn } from "node:child_process"

const key = process.env.STRIPE_SECRET_KEY
if (!key) throw new Error("Falta STRIPE_SECRET_KEY no .env.local")
const port = process.env.PORT ?? "3000"

const events = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
].join(",")

spawn("stripe", ["listen", "--api-key", key, "--events", events, "--forward-to", `localhost:${port}/api/webhooks/stripe`], {
  stdio: "inherit",
  shell: process.platform === "win32",
}).on("exit", (code) => process.exit(code ?? 0))
