"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ListMusic, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatClock } from "@/utils/format"
import type { MusicTrack } from "@/types"

type RepeatMode = "off" | "all" | "one"

interface AudioPlayerState {
  queue: MusicTrack[]
  current: MusicTrack | null
  playing: boolean
  playQueue: (tracks: MusicTrack[], startIndex?: number) => void
  toggle: () => void
}

const AudioPlayerContext = createContext<AudioPlayerState | null>(null)

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext)
  if (!ctx) throw new Error("useAudioPlayer precisa de <AudioPlayerProvider>")
  return ctx
}

/**
 * Player de áudio persistente: vive no layout da app, por isso a música
 * continua ao navegar entre páginas.
 */
export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [queue, setQueue] = useState<MusicTrack[]>([])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<RepeatMode>("off")

  const current = queue[index] ?? null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current?.audioUrl) return
    audio.src = current.audioUrl
    audio.play().catch(() => setPlaying(false))
  }, [current])

  const playQueue = useCallback((tracks: MusicTrack[], startIndex = 0) => {
    const playable = tracks.filter((t) => t.audioUrl)
    if (!playable.length) return
    const start = Math.max(0, playable.findIndex((t) => t.id === tracks[startIndex]?.id))
    setQueue(playable)
    setIndex(start)
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) audio.play().catch(() => undefined)
    else audio.pause()
  }, [current])

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!queue.length) return
      const audio = audioRef.current
      if (dir === -1 && audio && audio.currentTime > 3) {
        audio.currentTime = 0
        return
      }
      if (shuffle && dir === 1 && queue.length > 1) {
        let n = index
        while (n === index) n = Math.floor(Math.random() * queue.length)
        setIndex(n)
        return
      }
      const next = index + dir
      if (next >= queue.length) {
        if (repeat === "all") setIndex(0)
        else audio?.pause()
        return
      }
      setIndex(Math.max(0, next))
    },
    [queue.length, index, shuffle, repeat]
  )

  const value = useMemo(() => ({ queue, current, playing, playQueue, toggle }), [queue, current, playing, playQueue, toggle])

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      {current && <div aria-hidden="true" className="h-18" />}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setVolume(e.currentTarget.muted ? 0 : e.currentTarget.volume)}
        onEnded={(e) => {
          if (repeat === "one") {
            e.currentTarget.currentTime = 0
            e.currentTarget.play().catch(() => undefined)
          } else go(1)
        }}
      />
      {current && (
        <div
          role="region"
          aria-label="Player de música"
          className="fixed inset-x-0 bottom-[calc(var(--mobile-nav-h)+env(safe-area-inset-bottom))] z-40 border-t border-grape-600/[0.08] bg-surface-1/95 backdrop-blur-lg md:bottom-0 md:left-(--sidebar-w)"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-grape-600/10">
            <div className="h-full bg-grape-500" style={{ width: `${duration ? (time / duration) * 100 : 0}%` }} />
          </div>
          <div className="page-x flex h-18 items-center gap-3 md:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none md:basis-64">
              <Image src={current.coverUrl} alt="" width={48} height={48} className="size-12 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{current.title}</p>
                <p className="truncate text-xs text-muted-foreground">{current.artist}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 md:flex-1">
              <div className="flex items-center gap-1">
                <IconButton label={shuffle ? "Desativar aleatório" : "Aleatório"} active={shuffle} onClick={() => setShuffle((s) => !s)} className="hidden sm:grid">
                  <Shuffle className="size-4" />
                </IconButton>
                <IconButton label="Anterior" onClick={() => go(-1)} className="hidden sm:grid">
                  <SkipBack className="size-5 fill-current" />
                </IconButton>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={playing ? "Pausar" : "Tocar"}
                  className="grid size-11 place-items-center rounded-full bg-white text-grape-700 transition-transform hover:scale-105"
                >
                  {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 translate-x-px fill-current" />}
                </button>
                <IconButton label="Próxima" onClick={() => go(1)}>
                  <SkipForward className="size-5 fill-current" />
                </IconButton>
                <IconButton
                  label={repeat === "off" ? "Repetir tudo" : repeat === "all" ? "Repetir uma" : "Desativar repetição"}
                  active={repeat !== "off"}
                  onClick={() => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"))}
                  className="hidden sm:grid"
                >
                  {repeat === "one" ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
                </IconButton>
              </div>
              <div className="hidden w-full max-w-md items-center gap-2 text-[0.7rem] text-foreground/60 tabular-nums md:flex">
                <span>{formatClock(time)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.5}
                  value={time}
                  aria-label="Posição da música"
                  onChange={(e) => {
                    if (audioRef.current) audioRef.current.currentTime = Number(e.target.value)
                  }}
                  className="h-1 flex-1 cursor-pointer accent-lilac-400"
                />
                <span>{formatClock(duration)}</span>
              </div>
            </div>

            <div className="hidden items-center justify-end gap-2 md:flex md:basis-48">
              <IconButton
                label={volume === 0 ? "Ativar som" : "Silenciar"}
                onClick={() => {
                  const a = audioRef.current
                  if (a) a.muted = !a.muted
                }}
              >
                {volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </IconButton>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                aria-label="Volume"
                onChange={(e) => {
                  const a = audioRef.current
                  if (!a) return
                  a.volume = Number(e.target.value)
                  a.muted = a.volume === 0
                }}
                className="h-1 w-24 cursor-pointer accent-lilac-400"
              />
              <ListMusic className="size-5 text-foreground/40" aria-label={`${queue.length} músicas na fila`} />
            </div>
          </div>
        </div>
      )}
    </AudioPlayerContext.Provider>
  )
}

function IconButton({
  label,
  onClick,
  children,
  active = false,
  className,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      onClick={onClick}
      className={cn(
        "grid size-9 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-grape-600/10 hover:text-foreground",
        active && "text-lilac-400",
        className
      )}
    >
      {children}
    </button>
  )
}
