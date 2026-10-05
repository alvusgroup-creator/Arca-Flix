"use client"

import { Pause, Play, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatClock } from "@/utils/format"
import type { MusicTrack } from "@/types"
import { useAudioPlayer } from "./audio-player"

export function PlayCollectionButtons({ tracks }: { tracks: MusicTrack[] }) {
  const { playQueue } = useAudioPlayer()
  const playable = tracks.some((t) => t.audioUrl)
  return (
    <>
      <Button size="lg" disabled={!playable} onClick={() => playQueue(tracks, 0)}>
        <Play className="fill-current" /> Tocar
      </Button>
      <Button
        variant="outline"
        size="lg"
        disabled={!playable}
        onClick={() => playQueue([...tracks].sort(() => Math.random() - 0.5), 0)}
      >
        <Shuffle /> Aleatório
      </Button>
    </>
  )
}

export function TrackList({ tracks }: { tracks: MusicTrack[] }) {
  const { current, playing, playQueue, toggle } = useAudioPlayer()

  return (
    <ol className="divide-y divide-grape-600/[0.05] overflow-hidden rounded-3xl border border-grape-600/[0.07] bg-surface-1">
      {tracks.map((t, i) => {
        const isCurrent = current?.id === t.id
        return (
          <li key={t.id}>
            <button
              type="button"
              disabled={!t.audioUrl}
              onClick={() => (isCurrent ? toggle() : playQueue(tracks, i))}
              aria-label={isCurrent && playing ? `Pausar ${t.title}` : `Tocar ${t.title}`}
              className={cn(
                "group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-grape-600/[0.04] disabled:cursor-not-allowed disabled:opacity-60",
                isCurrent && "bg-grape-600/15"
              )}
            >
              <span className="grid w-6 shrink-0 place-items-center text-sm text-foreground/45 tabular-nums">
                <span className="group-hover:hidden">
                  {isCurrent && playing ? <span className="text-lilac-400">♪</span> : t.trackNumber}
                </span>
                <span className="hidden group-hover:inline">
                  {isCurrent && playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate font-semibold", isCurrent && "text-lilac-400")}>{t.title}</span>
                <span className="block truncate text-sm text-muted-foreground">{t.artist}</span>
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">{formatClock(t.durationSeconds)}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
