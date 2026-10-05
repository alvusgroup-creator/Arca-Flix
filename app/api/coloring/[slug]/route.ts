import { NextResponse, type NextRequest } from "next/server"
import { resolvePrivateMedia } from "@/lib/media"
import { getCurrentAccount } from "@/services/auth"
import { getColoringMaterial } from "@/services/coloring"
import { hasActiveSubscription } from "@/services/subscriptions"

/**
 * Entrega o PDF (ou a imagem em alta) de um material para colorir.
 * Verifica sessão e assinatura e redireciona para uma URL assinada temporária.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/coloring/[slug]">) {
  const { slug } = await ctx.params
  const account = await getCurrentAccount()
  if (!account) return NextResponse.redirect(new URL(`/login?next=/colorir/${slug}`, request.url))
  if (!(await hasActiveSubscription(account.id))) return NextResponse.redirect(new URL("/plans?required=1", request.url))

  const material = await getColoringMaterial(slug)
  if (!material) return NextResponse.json({ error: "Material não encontrado" }, { status: 404 })

  const format = request.nextUrl.searchParams.get("format")
  const target = format === "image" ? material.imageUrl : (material.pdfUrl ?? material.imageUrl)
  const url = await resolvePrivateMedia("coloring", target)
  if (!url) return NextResponse.json({ error: "Arquivo indisponível" }, { status: 404 })

  return NextResponse.redirect(new URL(url, request.url))
}
