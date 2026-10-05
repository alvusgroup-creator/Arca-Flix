import "server-only"
import { createClient } from "@supabase/supabase-js"
import { publicEnv } from "@/lib/env"
import { serverEnv } from "@/lib/env.server"

/**
 * Cliente com service role: ignora RLS. Usar apenas em código de servidor
 * confiável (webhooks, tarefas administrativas).
 */
export function createAdminClient() {
  if (!serverEnv.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.")
  }
  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
