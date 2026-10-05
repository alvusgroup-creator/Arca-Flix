import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Music } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-header"
import { SubscriptionGate } from "@/components/shared/subscription-gate"
import { MyListButton } from "@/features/favorites/components/my-list-button"
import { PlayCollectionButtons, TrackList } from "@/features/music/components/track-list"
import { isDemoMode } from "@/lib/env"
import { serverEnv } from "@/lib/env.server"
import { resolvePrivateMedia } from "@/lib/media"
import { filterForProfile, getContentBySlug } from "@/services/content"
import { getFavoriteIds } from "@/services/favorites"
import { getMusicCollection, totalDuration } from "@/services/music"
import { requireActiveProfile } from "@/services/profiles"
import { hasActiveSubscription } from "@/services/subscriptions"
import { formatDuration, plural } from "@/utils/format"

export async function generateMetadata({ params }: PageProps<"/music/[slug]">): Promise<Metadata> {
  const { slug } = await params
  return { title: (await getContentBySlug(slug))?.title ?? "Música" }
}

export default async function MusicCollectionPage({ params }: PageProps<"/music/[slug]">) {
  const { account, profile } = await requireActiveProfile()
  const { slug } = await params
  const collection = await getMusicCollection(slug)
  if (!collection || !filterForProfile([collection.content], profile).length) notFound()

  const [subscribed, savedIds] = await Promise.all([hasActiveSubscription(account.id), getFavoriteIds(profile.id)])

  // Áudio só sai do servidor para assinantes (URLs assinadas e temporárias).
  const tracks = await Promise.all(
    collection.tracks.map(async (t) => ({
      ...t,
      audioUrl: !subscribed ? null : isDemoMode ? serverEnv.demoAudioUrl : await resolvePrivateMedia("audio", t.audioUrl),
    }))
  )
  const { content } = collection

  return (
    <PageContainer className="space-y-8">
      <header className="flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
        <div className="relative aspect-square w-52 shrink-0 overflow-hidden rounded-3xl shadow-[0_24px_60px_-24px_rgb(145_70_224/0.7)] ring-1 ring-grape-600/10 md:w-60">
          <Image src={content.thumbnailUrl} alt={`Capa de ${content.title}`} fill preload sizes="240px" className="object-cover" />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-lilac-400 uppercase">
            {collection.kind === "album" ? "Álbum" : "Playlist"}
          </p>
          <h1 className="text-4xl font-bold md:text-5xl">{content.title}</h1>
          <p className="text-muted-foreground">{content.description}</p>
          <p className="text-sm text-foreground/70">
            {collection.artist && `${collection.artist} · `}
            {plural(tracks.length, "música", "músicas")} · {formatDuration(totalDuration(collection))}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 md:justify-start">
            <PlayCollectionButtons tracks={tracks} />
            <MyListButton contentId={content.id} saved={savedIds.includes(content.id)} variant="icon" />
          </div>
        </div>
      </header>

      {!subscribed && <SubscriptionGate description="Assine para ouvir todas as músicas e playlists." />}

      {tracks.length ? (
        <TrackList tracks={tracks} />
      ) : (
        <EmptyState icon={Music} title="Ainda sem músicas" description="As faixas deste álbum chegam em breve." />
      )}
    </PageContainer>
  )
}
