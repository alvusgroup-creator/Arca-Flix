import "server-only"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { publicEnv } from "@/lib/env"

/** Cliente Supabase para Server Components, Server Actions e Route Handlers (respeita RLS). */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Chamado a partir de um Server Component: o proxy renova a sessão.
        }
      },
    },
  })
}
