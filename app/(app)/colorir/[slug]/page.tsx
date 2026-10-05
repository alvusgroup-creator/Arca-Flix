import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Download, Paintbrush } from "lucide-react"
import { ContentCard } from "@/components/content/content-card"
import { PageContainer } from "@/components/shared/page-header"
import { SubscriptionGate } from "@/components/shared/subscription-gate"
import { buttonVariants } from "@/components/ui/button"
import { PrintButton } from "@/features/coloring/components/print-button"
import { MyListButton } from "@/features/favorites/components/my-list-button"
import { filterForProfile, getContentBySlug } from "@/services/content"
import { coloringCategories, getColoringMaterial, listColoring } from "@/services/coloring"
import { getFavoriteIds } from "@/services/favorites"
import { requireActiveProfile } from "@/services/profiles"
import { hasActiveSubscription } from "@/services/subscriptions"

export async function generateMetadata({ params }: PageProps<"/colorir/[slug]">): Promise<Metadata> {
  const { slug } = await params
  return { title: (await getContentBySlug(slug))?.title ?? "Para colorir" }
}

export default async function ColoringDetailPage({ params }: PageProps<"/colorir/[slug]">) {
  const { account, profile } = await requireActiveProfile()
  const { slug } = await params
  const material = await getColoringMaterial(slug)
  if (!material || !filterForProfile([material.content], profile).length) notFound()

  const [subscribed, savedIds, all] = await Promise.all([
    hasActiveSubscription(account.id),
    getFavoriteIds(profile.id),
    listColoring(profile),
  ])
  const { content } = material
  const category = coloringCategories.find((c) => c.slug === material.category)
  const more = all.filter((m) => m.content.id !== content.id).slice(0, 4)
  const fileHref = `/api/coloring/${content.slug}`

  return (
    <PageContainer className="space-y-12">
      <Link href="/colorir" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Para colorir
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12">
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-white ring-1 ring-grape-600/10">
          <Image src={content.thumbnailUrl} alt={`Prévia: ${content.title}`} fill preload sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
        </div>
        <div className="space-y-5">
          {category && <p className="text-xs font-semibold tracking-[0.16em] text-lilac-400 uppercase">{category.name}</p>}
          <h1 className="text-4xl font-bold">{content.title}</h1>
          <p className="text-muted-foreground">{content.description}</p>
          <p className="inline-flex rounded-full bg-grape-600/20 px-3 py-1 text-sm font-semibold text-lilac-400">
            Idade recomendada: {material.ageMin} a {material.ageMax} anos
          </p>
          {subscribed ? (
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={fileHref} className={buttonVariants({ size: "lg" })} download>
                <Download /> Baixar {material.pdfUrl ? "PDF" : "imagem"}
              </a>
              <PrintButton href={fileHref} title={content.title} />
              <Link href={`/colorir/${content.slug}/pintar`} className={buttonVariants({ variant: "outline", size: "lg" })}>
                <Paintbrush /> Pintar online
              </Link>
              <MyListButton contentId={content.id} saved={savedIds.includes(content.id)} variant="icon" />
            </div>
          ) : (
            <SubscriptionGate description="Assine para baixar e imprimir todos os desenhos." />
          )}
        </div>
      </div>

      {more.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Mais para colorir</h2>
          <div className="grid grid-cols-1 gap-x-4 gap-y-7 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {more.map((m) => (
              <ContentCard key={m.content.id} content={m.content} subtitle={`${m.ageMin} a ${m.ageMax} anos`} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
