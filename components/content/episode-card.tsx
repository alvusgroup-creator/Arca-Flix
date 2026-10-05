import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/utils/format"
import type { Episode, WatchProgress } from "@/types"

export function EpisodeCard({
  episode,
  progress,
  current = false,
}: {
  episode: Episode
  progress?: WatchProgress
  current?: boolean
}) {
  const ratio = progress ? (progress.completed ? 1 : progress.progressSeconds / Math.max(1, progress.durationSeconds)) : 0

  return (
    <Link
      href={`/watch/${episode.id}`}
      className={cn(
        "group/ep flex gap-4 rounded-2xl p-2 outline-none transition-colors duration-200 hover:bg-grape-600/[0.05] focus-visible:ring-2 focus-visible:ring-lilac-400 sm:p-3",
        current && "bg-grape-600/[0.04] ring-1 ring-grape-500/40"
      )}
    >
      <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:w-52">
        <Image src={episode.thumbnailUrl} alt="" fill sizes="(min-width: 640px) 208px, 144px" className="object-cover transition-transform duration-500 group-hover/ep:scale-[1.04]" />
        <span className="absolute inset-0 grid place-items-center bg-grape-900/30 opacity-0 transition-opacity duration-200 group-hover/ep:opacity-100">
          <span className="grid size-10 place-items-center rounded-full bg-grape-600/95 text-ink">
            <Play className="size-4 translate-x-px fill-current" aria-hidden="true" />
          </span>
        </span>
        {ratio > 0 && (
          <div className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-grape-600/25">
            <div className="h-full rounded-full bg-grape-500" style={{ width: `${Math.max(4, ratio * 100)}%` }} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1 py-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="line-clamp-2 font-sans text-[0.95rem] font-semibold text-foreground">
            <span className="mr-1.5 text-foreground/45">{episode.number}.</span>
            {episode.title}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">{formatDuration(episode.durationSeconds)}</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-3">{episode.description}</p>
        {progress?.completed && <p className="text-xs font-medium text-lilac-400">Assistido</p>}
      </div>
    </Link>
  )
}
