import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Film, MonitorSmartphone } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { VideoPlayer } from "@/features/player/components/video-player"
import { getVideoSource } from "@/lib/bunny"
import { getPreferences } from "@/services/account"
import { filterForProfile, getContentById, getEpisodeById, getSeasons } from "@/services/content"
import { getProgressMap, getResumePoint, registerView } from "@/services/history"
import { claimScreen } from "@/services/playback"
import { requireActiveProfile } from "@/services/profiles"
import { requireSubscription } from "@/services/subscriptions"

export const metadata: Metadata = { title: "Assistir", robots: { index: false, follow: false } }

/** /watch/[id]: id de episódio, de filme ou de série (retoma o episódio certo). */
export default async function WatchPage({ params }: PageProps<"/watch/[id]">) {
  const { id } = await params
  const { account, profile } = await requireActiveProfile()
  await requireSubscription()

  const episode = await getEpisodeById(id)
  const content = await getContentById(episode?.contentId ?? id)
  if (!content || (content.type !== "series" && content.type !== "movie")) notFound()
  if (!filterForProfile([content], profile).length) redirect(`/content/${content.slug}`)

  const seasons = await getSeasons(content)
  const episodes = seasons.flatMap((s) => s.episodes)

  // Série aberta sem episódio: retoma o último em andamento ou começa do primeiro.
  if (content.type === "series" && !episode) {
    const progress = [...(await getProgressMap(profile.id, content.id)).values()]
      .filter((p) => !p.completed && p.episodeId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
    const target = progress?.episodeId ?? episodes[0]?.id
    if (!target) redirect(`/content/${content.slug}`)
    redirect(`/watch/${target}`)
  }

  const source = getVideoSource(episode?.videoId ?? content.videoId)
  if (!source) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <EmptyState
          icon={Film}
          title="Vídeo ainda não disponível"
          description="Este título está sendo preparado. Volte em breve!"
          action={
            <Link href={`/content/${content.slug}`} className={buttonVariants({ variant: "outline" })}>
              Voltar
            </Link>
          }
        />
      </div>
    )
  }

  if (!(await claimScreen(account.id, profile.id, content.id))) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <EmptyState
          icon={MonitorSmartphone}
          title="Limite de telas atingido"
          description="Sua conta já está assistindo no número máximo de aparelhos do plano. Pause em outro aparelho e tente de novo em um minuto, ou mude de plano."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/watch/${id}`} className={buttonVariants()}>
                Tentar novamente
              </Link>
              <Link href="/plans" className={buttonVariants({ variant: "outline" })}>
                Ver planos
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  const [startAt, prefs] = await Promise.all([
    getResumePoint(profile.id, content.id, episode?.id ?? null),
    getPreferences(account.id),
  ])
  await registerView(content.id)

  const index = episode ? episodes.findIndex((e) => e.id === episode.id) : -1
  const nextEpisode = index >= 0 ? episodes[index + 1] : undefined

  return (
    <VideoPlayer
      src={source.src}
      captions={source.captions}
      poster={episode?.thumbnailUrl || content.bannerUrl}
      title={content.title}
      subtitle={episode ? `T${episode.seasonNumber}:E${episode.number} · ${episode.title}` : undefined}
      contentId={content.id}
      episodeId={episode?.id ?? null}
      startAt={startAt}
      backHref={`/content/${content.slug}`}
      next={nextEpisode ? { href: `/watch/${nextEpisode.id}`, title: `E${nextEpisode.number} · ${nextEpisode.title}` } : null}
      autoplayNext={prefs.autoplayNext}
      captionsByDefault={prefs.captionsByDefault}
    />
  )
}
