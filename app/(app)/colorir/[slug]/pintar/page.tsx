import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PageContainer } from "@/components/shared/page-header"
import { SubscriptionGate } from "@/components/shared/subscription-gate"
import { Painter } from "@/features/coloring/components/painter"
import { resolvePrivateMedia } from "@/lib/media"
import { filterForProfile } from "@/services/content"
import { getColoringMaterial } from "@/services/coloring"
import { requireActiveProfile } from "@/services/profiles"
import { hasActiveSubscription } from "@/services/subscriptions"

export const metadata: Metadata = { title: "Pintar online" }

export default async function PaintPage({ params }: PageProps<"/colorir/[slug]/pintar">) {
  const { account, profile } = await requireActiveProfile()
  const { slug } = await params
  const material = await getColoringMaterial(slug)
  if (!material || !filterForProfile([material.content], profile).length) notFound()

  const subscribed = await hasActiveSubscription(account.id)
  const imageUrl = subscribed ? await resolvePrivateMedia("coloring", material.imageUrl) : null

  return (
    <PageContainer className="space-y-6">
      <Link href={`/colorir/${slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {material.content.title}
      </Link>
      <h1 className="text-3xl font-bold md:text-4xl">Pintar: {material.content.title}</h1>
      {imageUrl ? (
        <Painter imageUrl={imageUrl} title={material.content.title} />
      ) : (
        <SubscriptionGate description="Assine para pintar online todos os desenhos." />
      )}
    </PageContainer>
  )
}
