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
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login?error=link`)
}
