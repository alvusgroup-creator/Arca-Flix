// Variáveis públicas (seguras no cliente). Segredos ficam em lib/env.server.ts.

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  appUrl: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, ""),
}

/**
 * Sem Supabase configurado a aplicação roda em "modo demonstração":
 * sessão, perfis, lista e progresso ficam em cookies e o catálogo vem de lib/demo.
 */
export const isSupabaseConfigured = Boolean(
  publicEnv.supabaseUrl && publicEnv.supabaseAnonKey
)

export const isDemoMode = !isSupabaseConfigured
