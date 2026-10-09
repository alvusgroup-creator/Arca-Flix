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
  /** Catálogo provisório: toca o vídeo do YouTube com os mesmos controles. */
  youtubeId?: string
}

const SAVE_EVERY_MS = 10_000
const HIDE_CONTROLS_MS = 3_000
const NEXT_COUNTDOWN = 8

/** O que os controles precisam da mídia — atendido pelo <video> e pelo adaptador do YouTube. */
interface Media {
  readonly paused: boolean
  currentTime: number
  readonly duration: number
  muted: boolean
  volume: number
  play(): Promise<void>
  pause(): void
}

/**
 * Player HLS próprio (Bunny Stream). Usa HLS nativo no Safari e hls.js nos
 * restantes navegadores — carregado só quando o player abre.
 */
export function VideoPlayer(props: VideoPlayerProps) {
  const { src, poster, title, subtitle, captions, contentId, episodeId, startAt, backHref, next, youtubeId } = props
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ytHostRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<Media | null>(null)
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
      const v = mediaRef.current
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
    [contentId, episodeId],
  )

  // --- Fonte (HLS) -------------------------------------------------------
  useEffect(() => {
    const video = videoRef.current
    if (!video || youtubeId) return
    mediaRef.current = video
    let cancelled = false

    // Tenta tocar sozinho; se o navegador bloquear, tenta sem som; se ainda assim
    // não der, some o "carregando" e aparece o botão grande de play.
    const tryPlay = () => {
      video.play().catch(() => {
        video.muted = true
        video.play().catch(() => {
          setPlaying(false)
          setWaiting(false)
        })
      })
    }
    // Rede lenta ou bloqueio silencioso: nunca deixar o círculo girando para sempre.
    const giveUp = setTimeout(() => setWaiting(false), 8000)

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // HLS nativo (Safari e Chrome recentes): com preload="none" os metadados só
      // chegam depois de um play — por isso pede o play já e retoma o ponto depois.
      video.src = src
      if (startAt > 5) {
        video.addEventListener("loadedmetadata", () => (video.currentTime = startAt), { once: true })
      }
      tryPlay()
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
              .reverse(),
          )
          tryPlay()
        })
        hls.on(HlsCtor.Events.ERROR, (_e, data) => {
          if (data.fatal) setError(true)
        })
      })
    }

    return () => {
      clearTimeout(giveUp)
      cancelled = true
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [src, startAt, youtubeId])

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
    const v = mediaRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => undefined)
    else v.pause()
  }, [])

  const seekBy = useCallback((delta: number) => {
    const v = mediaRef.current
    if (!v) return
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || Infinity)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    else containerRef.current?.requestFullscreen().catch(() => undefined)
  }, [])

  const toggleMute = useCallback(() => {
    const v = mediaRef.current
    if (!v) return
    v.muted = !v.muted
  }, [])

  const showControls = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (!mediaRef.current?.paused) setControlsVisible(false)
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

  // --- Fonte (YouTube) ---------------------------------------------------
  // Mesmos controles do player próprio: o iframe fica sem controles e sem cliques,
  // e o estado é lido por polling (a IFrame API não emite timeupdate).
  const endedRef = useRef({ next, autoplayNext: props.autoplayNext })
  useEffect(() => {
    endedRef.current = { next, autoplayNext: props.autoplayNext }
  }, [next, props.autoplayNext])

  useEffect(() => {
    const host = ytHostRef.current
    if (!youtubeId || !host) return
    let player: YTPlayer | null = null
    let poll: ReturnType<typeof setInterval> | undefined
    const timers: ReturnType<typeof setTimeout>[] = []
    let cancelled = false

    loadYouTubeApi().then((YT) => {
      if (cancelled) return
      const el = document.createElement("div")
      host.appendChild(el)
      player = new YT.Player(el, {
        host: "https://www.youtube-nocookie.com",
        videoId: youtubeId,
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 0,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          cc_load_policy: 0,
          hl: "pt-BR",
          start: startAt > 5 ? Math.floor(startAt) : 0,
          origin: window.location.origin,
        },
        events: {
          onReady: ({ target }) => {
            mediaRef.current = youtubeMedia(target)
            target.playVideo()
            // Autoplay com som bloqueado: tenta sem som; senão mostra o botão de play.
            timers.push(
              setTimeout(() => {
                if (target.getPlayerState() === 1) return
                target.mute()
                target.playVideo()
                timers.push(setTimeout(() => setWaiting(false), 2000))
              }, 1500),
            )
            poll = setInterval(() => {
              const d = target.getDuration()
              setCurrent(target.getCurrentTime())
              setDuration(d)
              setBuffered(target.getVideoLoadedFraction() * d)
              setVolume(target.getVolume() / 100)
              setMuted(target.isMuted())
              persist()
            }, 250)
          },
          onStateChange: ({ data, target }) => {
            if (data === 1) {
              // Legendas automáticas do YouTube ligam sozinhas: desliga.
              target.unloadModule("captions")
              setPlaying(true)
              setWaiting(false)
              setCountdown(null)
              showControls()
            } else if (data === 2) {
              setPlaying(false)
              setControlsVisible(true)
              persist(true)
            } else if (data === 3) {
              setWaiting(true)
            } else if (data === 0) {
              setPlaying(false)
              persist(true)
              const { next: n, autoplayNext } = endedRef.current
              if (n && autoplayNext) setCountdown(NEXT_COUNTDOWN)
            }
          },
          onError: () => setError(true),
        },
      })
    })

    return () => {
      cancelled = true
      clearInterval(poll)
      timers.forEach(clearTimeout)
      player?.destroy()
      host.replaceChildren()
      mediaRef.current = null
    }
  }, [youtubeId, startAt, persist, showControls])

  const progress = duration ? (current / duration) * 100 : 0
  const visible = controlsVisible || !playing

  return (
    <div
      ref={containerRef}
      className={cn("relative h-dvh w-full overflow-hidden bg-black text-white select-none", !visible && "cursor-none")}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      {youtubeId ? (
        <>
          {/* O iframe não recebe cliques: os controles são os nossos. */}
          <div
            ref={ytHostRef}
            className="pointer-events-none absolute inset-0 [&_iframe]:size-full"
            aria-hidden="true"
          />
          <div className="absolute inset-0" onClick={togglePlay} onDoubleClick={toggleFullscreen} />
        </>
      ) : (
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
            <track
              key={c.src}
              kind="subtitles"
              src={c.src}
              srcLang={c.lang}
              label={c.label}
              default={i === 0 && captionsOn}
            />
          ))}
        </video>
      )}

      {waiting && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <LoaderCircle className="size-14 animate-spin text-lilac-400" aria-label="Carregando vídeo" />
        </div>
      )}

      {!playing && !waiting && !error && countdown === null && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Assistir"
          className={cn("absolute inset-0 z-[5] grid place-items-center", youtubeId ? "bg-black/70" : "bg-black/30")}
        >
          <span className="grid size-20 place-items-center rounded-full bg-white text-grape-700 shadow-2xl transition-transform hover:scale-105 sm:size-24">
            <Play className="size-9 translate-x-0.5 fill-current sm:size-11" />
          </span>
        </button>
      )}
      {muted && playing && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-20 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-grape-700 shadow-lg sm:right-6"
        >
          <VolumeX className="size-4" /> Toque para ativar o som
        </button>
      )}

      {error && (
        <div className="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center">
          <div className="max-w-sm space-y-4">
            <p className="text-xl font-semibold">Não foi possível reproduzir este vídeo</p>
            <p className="text-sm text-white/70">Verifique sua ligação à internet e tente novamente.</p>
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
          <p className="text-xs font-semibold tracking-wider text-lilac-400 uppercase">
            Próximo episódio em {countdown}s
          </p>
          <p className="mt-1 line-clamp-2 font-semibold">{next.title}</p>
          <div className="mt-4 flex gap-2">
            <Link
              href={next.href}
              className="flex-1 rounded-full bg-grape-600 px-4 py-2 text-center text-sm font-bold hover:bg-grape-500"
            >
              Assistir
            </Link>
            <button
              type="button"
              onClick={() => setCountdown(null)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Topo */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-10 flex items-center gap-3 bg-linear-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 sm:p-6",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <Link
          href={backHref}
          aria-label="Voltar"
          className="grid size-11 place-items-center rounded-full hover:bg-white/15"
        >
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
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex items-center gap-3 text-xs text-white/80 tabular-nums">
          <span>{formatClock(current)}</span>
          <div className="group relative h-6 flex-1">
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/20 transition-[height] group-hover:h-2">
              <div
                className="absolute inset-y-0 left-0 bg-white/30"
                style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }}
              />
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
                const v = mediaRef.current
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
                const v = mediaRef.current
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
              <ControlButton
                label={captionsOn ? "Desativar legendas (c)" : "Ativar legendas (c)"}
                onClick={() => setCaptionsOn((v) => !v)}
                active={captionsOn}
              >
                <Captions className="size-6" />
              </ControlButton>
            )}
            {levels.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Qualidade"
                  className="grid size-11 place-items-center rounded-full outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-lilac-400"
                >
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
        active && "text-lilac-400",
      )}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// YouTube IFrame API (só o que o player usa)

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  mute(): void
  unMute(): void
  isMuted(): boolean
  setVolume(volume: number): void
  getVolume(): number
  getCurrentTime(): number
  getDuration(): number
  getVideoLoadedFraction(): number
  getPlayerState(): number
  unloadModule(name: string): void
  destroy(): void
}

interface YTNamespace {
  Player: new (
    el: HTMLElement,
    options: {
      host?: string
      videoId: string
      width?: string
      height?: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (e: { target: YTPlayer }) => void
        onStateChange?: (e: { data: number; target: YTPlayer }) => void
        onError?: (e: { data: number }) => void
      }
    },
  ) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApi: Promise<YTNamespace> | null = null

function loadYouTubeApi() {
  ytApi ??= new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT)
    window.onYouTubeIframeAPIReady = () => resolve(window.YT!)
    const script = document.createElement("script")
    script.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(script)
  })
  return ytApi
}

function youtubeMedia(p: YTPlayer): Media {
  return {
    get paused() {
      const state = p.getPlayerState()
      return state !== 1 && state !== 3
    },
    get currentTime() {
      return p.getCurrentTime()
    },
    set currentTime(t: number) {
      p.seekTo(t, true)
    },
    get duration() {
      return p.getDuration()
    },
    get muted() {
      return p.isMuted()
    },
    set muted(m: boolean) {
      if (m) p.mute()
      else p.unMute()
    },
    get volume() {
      return p.getVolume() / 100
    },
    set volume(v: number) {
      p.setVolume(Math.round(v * 100))
      if (v > 0) p.unMute()
    },
    play: async () => p.playVideo(),
    pause: () => p.pauseVideo(),
  }
}
