import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { publicEnv } from "@/lib/env"

/**
 * Renova a sessão do Supabase a cada pedido e devolve o id do utilizador
 * (ou null). Verificação otimista: a autorização real acontece no servidor.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const userId = (data?.claims?.sub as string | undefined) ?? null

  return { response, userId }
}
