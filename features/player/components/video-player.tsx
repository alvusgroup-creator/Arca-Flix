"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type Hls from "hls.js"
import {
  ArrowLeft,
  Captions,
  LoaderCircle,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatClock } from "@/utils/format"
import { saveProgress } from "../actions"

export interface VideoPlayerProps {
  src: string
  poster: string
  title: string
  subtitle?: string
  captions: { src: string; label: string; lang: string }[]
  contentId: string
  episodeId: string | null
  startAt: number
  backHref: string
  next: { href: string; title: string } | null
  autoplayNext: boolean
  captionsByDefault: boolean
}

const SAVE_EVERY_MS = 10_000
const HIDE_CONTROLS_MS = 3_000
const NEXT_COUNTDOWN = 8

/**
 * Player HLS próprio (Bunny Stream). Usa HLS nativo no Safari e hls.js nos
 * restantes navegadores — carregado só quando o player abre.
 */
export function VideoPlayer(props: VideoPlayerProps) {
  const { src, poster, title, subtitle, captions, contentId, episodeId, startAt, backHref, next } = props
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const lastSaved = useRef(0)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [playing, setPlaying] = useState(false)
  const [waiting, setWaiting] = useState(true)
  const [error, setError] = useState(false)
  const [current, setCurrent] = useState(startAt)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(props.captionsByDefault)
  const [levels, setLevels] = useState<{ index: number; label: string }[]>([])
  const [level, setLevel] = useState("-1")
  const [controlsVisible, setControlsVisible] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)

  // --- Progresso ---------------------------------------------------------
  const persist = useCallback(
    (force = false) => {
      const v = videoRef.current
      if (!v || !v.duration || Number.isNaN(v.duration)) return
      const now = Date.now()
      if (!force && now - lastSaved.current < SAVE_EVERY_MS) return
      lastSaved.current = now
      void saveProgress({
        contentId,
        episodeId,
        progressSeconds: v.currentTime,
        durationSeconds: v.duration,
      })
    },
    [contentId, episodeId]
  )

  // --- Fonte (HLS) -------------------------------------------------------
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let cancelled = false

    const start = () => {
      if (startAt > 5) video.currentTime = startAt
      video.play().catch(() => {
            // Autoplay bloqueado: mostra o botão de play em vez do spinner.
            setPlaying(false)
            setWaiting(false)
          })
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src
      video.addEventListener("loadedmetadata", start, { once: true })
    } else {
      import("hls.js").then(({ default: HlsCtor }) => {
        if (cancelled) return
        if (!HlsCtor.isSupported()) return setError(true)
        const hls = new HlsCtor({ capLevelToPlayerSize: true, startPosition: startAt > 5 ? startAt : -1 })
        hlsRef.current = hls
        hls.loadSource(src)
        hls.attachMedia(video)
        hls.on(HlsCtor.Events.MANIFEST_PARSED, (_e, data) => {
          setLevels(
            data.levels
              .map((l, index) => ({ index, label: l.height ? `${l.height}p` : `${Math.round(l.bitrate / 1000)} kbps` }))
              .reverse()
          )
          video.play().catch(() => {
            // Autoplay bloqueado: mostra o botão de play em vez do spinner.
            setPlaying(false)
            setWaiting(false)
          })
        })
        hls.on(HlsCtor.Events.ERROR, (_e, data) => {
          if (data.fatal) setError(true)
        })
      })
    }

    return () => {
      cancelled = true
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [src, startAt])

  // Salva ao sair da página / esconder a aba.
  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && persist(true)
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("pagehide", onHide)
    return () => {
      document.removeEventListener("visibilitychange", onHide)
      window.removeEventListener("pagehide", onHide)
      persist(true)
    }
  }, [persist])

  // Legendas
  useEffect(() => {
    if (videoRef.current) setCaptionMode(videoRef.current, captionsOn)
  }, [captionsOn])

  // Contagem para o próximo episódio
  useEffect(() => {
    if (countdown === null || !next) return
    if (countdown <= 0) {
      router.push(next.href)
      return
    }
    const id = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000)
    return () => clearTimeout(id)
  }, [countdown, next, router])

  // --- Ações -------------------------------------------------------------
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => undefined)
    else v.pause()
  }, [])

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || Infinity)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    else containerRef.current?.requestFullscreen().catch(() => undefined)
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
  }, [])

  const showControls = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false)
    }, HIDE_CONTROLS_MS)
  }, [])

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [])

  // Atalhos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("input, [role=menu], [role=slider]")) return
      const actions: Record<string, () => void> = {
        " ": togglePlay,
        k: togglePlay,
        ArrowLeft: () => seekBy(-10),
        j: () => seekBy(-10),
        ArrowRight: () => seekBy(10),
        l: () => seekBy(10),
        f: toggleFullscreen,
        m: toggleMute,
        c: () => setCaptionsOn((v) => !v),
      }
      const action = actions[e.key]
      if (action) {
        e.preventDefault()
        action()
        showControls()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [togglePlay, seekBy, toggleFullscreen, toggleMute, showControls])

  const progress = duration ? (current / duration) * 100 : 0
  const visible = controlsVisible || !playing

  return (
    <div
      ref={containerRef}
      className={cn("relative h-dvh w-full overflow-hidden bg-black text-white select-none", !visible && "cursor-none")}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="none"
        crossOrigin="anonymous"
        className="absolute inset-0 size-full object-contain"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => {
          setPlaying(true)
          setCountdown(null)
          showControls()
        }}
        onPause={() => {
          setPlaying(false)
          setControlsVisible(true)
          persist(true)
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget
          setCurrent(v.currentTime)
          if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1))
          persist()
        }}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume)
          setMuted(e.currentTarget.muted)
        }}
        onEnded={() => {
          persist(true)
          if (next && props.autoplayNext) setCountdown(NEXT_COUNTDOWN)
        }}
        onError={() => setError(true)}
      >
        {captions.map((c, i) => (
          <track key={c.src} kind="subtitles" src={c.src} srcLang={c.lang} label={c.label} default={i === 0 && captionsOn} />
        ))}
      </video>

      {waiting && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <LoaderCircle className="size-14 animate-spin text-lilac-400" aria-label="Carregando vídeo" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center">
          <div className="max-w-sm space-y-4">
            <p className="text-xl font-semibold">Não foi possível reproduzir este vídeo</p>
            <p className="text-sm text-white/70">Verifique a sua ligação à internet e tente novamente.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-grape-600 px-6 py-3 font-bold hover:bg-grape-500"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {countdown !== null && next && (
        <div className="absolute right-6 bottom-28 z-20 w-72 rounded-3xl border border-white/10 bg-surface-1/95 p-5 shadow-2xl">
          <p className="text-xs font-semibold tracking-wider text-lilac-400 uppercase">Próximo episódio em {countdown}s</p>
          <p className="mt-1 line-clamp-2 font-semibold">{next.title}</p>
          <div className="mt-4 flex gap-2">
            <Link href={next.href} className="flex-1 rounded-full bg-grape-600 px-4 py-2 text-center text-sm font-bold hover:bg-grape-500">
              Assistir
            </Link>
            <button type="button" onClick={() => setCountdown(null)} className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Topo */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-10 flex items-center gap-3 bg-linear-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 sm:p-6",
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <Link href={backHref} aria-label="Voltar" className="grid size-11 place-items-center rounded-full hover:bg-white/15">
          <ArrowLeft className="size-6" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
          {subtitle && <p className="truncate text-sm text-white/70">{subtitle}</p>}
        </div>
      </div>

      {/* Controles */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 space-y-3 bg-linear-to-t from-black/90 via-black/60 to-transparent px-4 pt-16 pb-4 transition-opacity duration-300 sm:px-6 sm:pb-6",
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="flex items-center gap-3 text-xs text-white/80 tabular-nums">
          <span>{formatClock(current)}</span>
          <div className="group relative h-6 flex-1">
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/20 transition-[height] group-hover:h-2">
              <div className="absolute inset-y-0 left-0 bg-white/30" style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-grape-500" style={{ width: `${progress}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              aria-label="Progresso do vídeo"
              aria-valuetext={`${formatClock(current)} de ${formatClock(duration)}`}
              onChange={(e) => {
                const v = videoRef.current
                if (v) v.currentTime = Number(e.target.value)
                setCurrent(Number(e.target.value))
              }}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
          </div>
          <span>{formatClock(duration)}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ControlButton label={playing ? "Pausar (k)" : "Reproduzir (k)"} onClick={togglePlay} big>
            {playing ? <Pause className="size-7 fill-current" /> : <Play className="size-7 fill-current" />}
          </ControlButton>
          <ControlButton label="Voltar 10 segundos" onClick={() => seekBy(-10)}>
            <RotateCcw className="size-6" />
          </ControlButton>
          <ControlButton label="Avançar 10 segundos" onClick={() => seekBy(10)}>
            <RotateCw className="size-6" />
          </ControlButton>

          <div className="group/vol flex items-center">
            <ControlButton label={muted ? "Ativar som (m)" : "Silenciar (m)"} onClick={toggleMute}>
              {muted || volume === 0 ? <VolumeX className="size-6" /> : <Volume2 className="size-6" />}
            </ControlButton>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => {
                const v = videoRef.current
                if (!v) return
                v.volume = Number(e.target.value)
                v.muted = v.volume === 0
              }}
              className="hidden h-1 w-0 cursor-pointer accent-lilac-400 transition-[width] duration-200 group-hover/vol:w-24 focus-visible:w-24 sm:block"
            />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {next && (
              <Link
                href={next.href}
                aria-label={`Próximo episódio: ${next.title}`}
                className="grid size-11 place-items-center rounded-full hover:bg-white/15"
              >
                <SkipForward className="size-6" />
              </Link>
            )}
            {captions.length > 0 && (
              <ControlButton label={captionsOn ? "Desativar legendas (c)" : "Ativar legendas (c)"} onClick={() => setCaptionsOn((v) => !v)} active={captionsOn}>
                <Captions className="size-6" />
              </ControlButton>
            )}
            {levels.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="Qualidade" className="grid size-11 place-items-center rounded-full outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-lilac-400">
                  <Settings className="size-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-40 p-1.5">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">Qualidade</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={level}
                      onValueChange={(value) => {
                        setLevel(String(value))
                        if (hlsRef.current) hlsRef.current.currentLevel = Number(value)
                      }}
                    >
                      <DropdownMenuRadioItem value="-1">Automática</DropdownMenuRadioItem>
                      {levels.map((l) => (
                        <DropdownMenuRadioItem key={l.index} value={String(l.index)}>
                          {l.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ControlButton label={fullscreen ? "Sair da tela cheia (f)" : "Tela cheia (f)"} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize className="size-6" /> : <Maximize className="size-6" />}
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function setCaptionMode(video: HTMLVideoElement, on: boolean) {
  const tracks = video.textTracks
  for (let i = 0; i < tracks.length; i++) tracks[i].mode = on && i === 0 ? "showing" : "hidden"
}

function ControlButton({
  label,
  onClick,
  children,
  big = false,
  active = false,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  big?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      onClick={onClick}
      className={cn(
        "grid place-items-center rounded-full outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-lilac-400",
        big ? "size-13" : "size-11",
        active && "text-lilac-400"
      )}
    >
      {children}
    </button>
  )
}
