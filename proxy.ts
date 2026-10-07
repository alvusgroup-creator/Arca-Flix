import { NextResponse, type NextRequest } from "next/server"
import { isDemoMode } from "@/lib/env"
import { updateSession } from "@/lib/supabase/proxy"

// Verificação otimista de sessão. A autorização real (conta, perfil,
// assinatura, admin) é feita no servidor pelos services.

const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/plans",
  "/termos",
  "/privacidade",
  "/offline",
  "/auth",
  "/api/webhooks",
]
const AUTH_PAGES = ["/login", "/register", "/forgot-password"]

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`))

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  let response = NextResponse.next({ request })
  let signedIn: boolean

  if (isDemoMode) {
    signedIn = request.cookies.has("af_demo_session")
  } else {
    const session = await updateSession(request)
    response = session.response
    signedIn = Boolean(session.userId)
  }

  const isPublic = pathname === "/" || matches(pathname, PUBLIC_PREFIXES)

  if (!signedIn && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  if (signedIn && matches(pathname, AUTH_PAGES) && !request.nextUrl.searchParams.has("step")) {
    const url = request.nextUrl.clone()
    // Já logado e veio escolher um plano na landing: direto para o pagamento dele.
    const plan = request.nextUrl.searchParams.get("plan")
    url.pathname = plan && /^[a-z0-9-]+$/.test(plan) ? "/checkout" : "/profiles"
    url.search = plan && url.pathname === "/checkout" ? `?plan=${plan}` : ""
    return NextResponse.redirect(url)
  }

  // Identificador estável do aparelho (limite de telas simultâneas).
  if (!request.cookies.has("af_device")) {
    response.cookies.set("af_device", crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
    })
  }

  return response
}

export const config = {
  matcher: [
    // Tudo exceto assets estáticos e imagens.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|brand/|demo/|icons/|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
