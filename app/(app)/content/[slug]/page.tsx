import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Lock, Play } from "lucide-react"
import { AgeRatingBadge } from "@/components/content/age-rating-badge"
import { ContentCard } from "@/components/content/content-card"
import { ContentCarousel } from "@/components/content/content-carousel"
import { SeasonEpisodes } from "@/components/content/season-episodes"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MyListButton } from "@/features/favorites/components/my-list-button"
import { filterForProfile, getContentBySlug, getContentDetail, getSimilar } from "@/services/content"
import { getFavoriteIds } from "@/services/favorites"
import { getProgressMap } from "@/services/history"
import { requireActiveProfile } from "@/services/profiles"
import { ageRatingLabel } from "@/utils/age-rating"
import { contentMeta, contentTypeLabel, isVideo } from "@/utils/content"
import { formatClock } from "@/utils/format"

export async function generateMetadata({ params }: PageProps<"/content/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const content = await getContentBySlug(slug)
  return { title: content?.title ?? "Conteúdo", description: content?.shortDescription }
}

export default async function ContentPage({ params }: PageProps<"/content/[slug]">) {
  const { profile } = await requireActiveProfile()
  const { slug } = await params
  const content = await getContentDetail(slug)
  if (!content || !isVideo(content)) notFound()

  if (!filterForProfile([content], profile).length) {
    return (
      <PageContainer>
        <EmptyState
          icon={Lock}
          title="Indisponível para este perfil"
          description="Este título está bloqueado pelo controle parental do perfil atual."
          action={
            <Link href="/profiles" className={buttonVariants({ variant: "outline" })}>
              Trocar de perfil
            </Link>
          }
        />
      </PageContainer>
    )
  }

  const [progressMap, savedIds, similar] = await Promise.all([
    getProgressMap(profile.id, content.id),
    getFavoriteIds(profile.id),
    getSimilar(content, profile),
  ])

  // Retomar: o item com progresso mais recente e não concluído.
  const latest = [...progressMap.values()]
    .filter((p) => !p.completed)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const episodes = content.seasons.flatMap((s) => s.episodes)
  const resumeEpisode = latest?.episodeId ? episodes.find((e) => e.id === latest.episodeId) : undefined
  const watchHref = `/watch/${resumeEpisode?.id ?? episodes[0]?.id ?? content.id}`
  const watchLabel = latest
    ? resumeEpisode
      ? `Continuar T${resumeEpisode.seasonNumber}:E${resumeEpisode.number}`
      : `Continuar de ${formatClock(latest.progressSeconds)}`
    : "Assistir"

  return (
    <article>
      {/* Banner: foto inteira + véu escuro, texto branco */}
      <section className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-grape-900 md:min-h-[min(72svh,620px)]">
        <Image
          src={content.bannerUrl}
          alt=""
          fill
          preload
          sizes="100vw"
          className={cn("-z-20 object-cover", content.posterUrl && "max-md:hidden")}
        />
        {/* Celular: a capa vertical enquadra melhor o personagem */}
        {content.posterUrl && (
          <Image src={content.posterUrl} alt="" fill preload sizes="100vw" className="-z-20 object-cover object-top md:hidden" />
        )}
        <div className="veil absolute inset-0 -z-10 md:hidden" />
        <div className="veil-side absolute inset-0 -z-10 max-md:hidden" />

        <div className="page-x flex w-full flex-col items-center gap-8 pt-24 pb-10 text-center md:flex-row md:items-end md:pb-14 md:text-left">
          <div className="relative hidden aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/20 xl:block">
            <Image src={content.posterUrl ?? content.thumbnailUrl} alt={`Capa de ${content.title}`} fill sizes="160px" className="object-cover" />
          </div>
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-3 inline-flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.18em] text-white/85 uppercase">
              <span className="size-1.5 rounded-full bg-sun-400" aria-hidden="true" />
              {contentTypeLabel[content.type]}
            </p>
            <h1 className="text-[2.4rem] leading-[1.04] font-bold text-white sm:text-5xl lg:text-6xl">{content.title}</h1>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm text-white/80 md:justify-start">
              <AgeRatingBadge rating={content.ageRating} />
              <span>{contentMeta(content)}</span>
              {content.genres.length > 0 && <span className="text-white/60">· {content.genres.join(", ")}</span>}
            </p>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-white/85 md:text-[1.05rem]">{content.description}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link href={watchHref} className={buttonVariants({ size: "lg" })}>
                <Play className="fill-current" />
                {watchLabel}
              </Link>
              <MyListButton contentId={content.id} saved={savedIds.includes(content.id)} onDark />
            </div>
          </div>
        </div>
      </section>

      <div className="page-x space-y-14 pt-10 pb-16">
        {content.seasons.length > 0 && (
          <SeasonEpisodes
            seasons={content.seasons}
            progress={Object.fromEntries([...progressMap.entries()])}
            initialSeason={resumeEpisode?.seasonNumber}
            currentEpisodeId={resumeEpisode?.id}
          />
        )}

        <section aria-labelledby="detalhes" className="grid gap-6 border-t border-grape-900/10 pt-8 md:grid-cols-3">
          <h2 id="detalhes" className="sr-only">
            Detalhes
          </h2>
          <Detail label="Classificação">
            <span className="inline-flex items-center gap-2">
              <AgeRatingBadge rating={content.ageRating} /> {ageRatingLabel[content.ageRating]}
            </span>
          </Detail>
          <Detail label="Gêneros">{content.genres.join(", ") || "—"}</Detail>
          <Detail label="Temas">{content.categories.map((c) => c.name).join(", ") || "—"}</Detail>
        </section>
      </div>

      {similar.length > 0 && (
        <ContentCarousel title="Títulos semelhantes" className="pb-16">
          {similar.map((item) => (
            <ContentCard key={item.id} inRow content={item} />
          ))}
        </ContentCarousel>
      )}
    </article>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  )
}
