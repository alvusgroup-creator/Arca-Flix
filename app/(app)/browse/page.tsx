import type { Metadata } from "next"
import Link from "next/link"
import { Clapperboard } from "lucide-react"
import { ContentCard } from "@/components/content/content-card"
import { ContentCarousel } from "@/components/content/content-carousel"
import { HeroBanner } from "@/components/content/hero-banner"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getHomeData } from "@/services/content"
import { getFavoriteIds } from "@/services/favorites"
import { getContinueWatching } from "@/services/history"
import { requireActiveProfile } from "@/services/profiles"

export const metadata: Metadata = { title: "Início" }

export default async function BrowsePage() {
  const { profile } = await requireActiveProfile()
  const [{ hero, rows }, continueWatching, savedIds] = await Promise.all([
    getHomeData(profile),
    getContinueWatching(profile),
    getFavoriteIds(profile.id),
  ])

  if (!hero.length && !rows.length) {
    return (
      <PageContainer>
        <EmptyState
          icon={Clapperboard}
          title="O catálogo ainda está vazio"
          description="Assim que novos conteúdos forem publicados eles aparecem aqui."
          action={
            <Link href="/settings/parental" className={buttonVariants({ variant: "outline" })}>
              Rever controle parental
            </Link>
          }
        />
      </PageContainer>
    )
  }

  return (
    <>
      <HeroBanner items={hero} savedIds={savedIds} />

      <div className="space-y-10 pt-8 pb-16 md:space-y-12 md:pt-10">
        {continueWatching.length > 0 && (
          <ContentCarousel title={`Continuar assistindo, ${profile.name}`}>
            {continueWatching.map(({ content, episode, progress }) => (
              <ContentCard
                key={content.id}
                inRow
                content={episode ? { ...content, thumbnailUrl: episode.thumbnailUrl } : content}
                href={`/watch/${episode?.id ?? content.id}`}
                progress={progress.progressSeconds / Math.max(1, progress.durationSeconds)}
                subtitle={episode ? `T${episode.seasonNumber}:E${episode.number} · ${episode.title}` : undefined}
              />
            ))}
          </ContentCarousel>
        )}

        {rows.map((row) => (
          <ContentCarousel key={row.id} title={row.title} href={row.href}>
            {row.items.map((item) => (
              <ContentCard key={item.id} inRow content={item} variant={row.variant ?? "landscape"} />
            ))}
          </ContentCarousel>
        ))}
      </div>
    </>
  )
}
