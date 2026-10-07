import { NextResponse, type NextRequest } from "next/server"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { safeNext } from "@/features/auth/schemas"

/** Troca o código (OAuth, confirmação de e-mail, recuperação de senha) por sessão. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"))

  if (!isDemoMode && code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Conta nova (ex.: primeiro login com Google) cai no passo de escolher plano,
      // igual ao cadastro por e-mail.
      if (next === "/profiles" && data.user) {
        const [{ count: profiles }, { count: subscriptions }] = await Promise.all([
          supabase.from("user_profiles").select("id", { count: "exact", head: true }).eq("user_id", data.user.id),
          supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("user_id", data.user.id),
        ])
        if (!profiles && !subscriptions) return NextResponse.redirect(`${origin}/plans?step=2`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link`)
}
