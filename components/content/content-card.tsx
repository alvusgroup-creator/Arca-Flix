import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { contentHref, contentMeta, isVideo } from "@/utils/content"
import type { Content } from "@/types"
import { AgeRatingBadge } from "./age-rating-badge"

export type CardVariant = "landscape" | "poster"

const widths: Record<CardVariant, string> = {
  landscape: "w-[74vw] sm:w-[44vw] md:w-[280px] xl:w-[312px]",
  poster: "w-[40vw] sm:w-[28vw] md:w-[176px] xl:w-[196px]",
}

export function ContentCard({
  content,
  variant = "landscape",
  href,
  progress,
  subtitle,
  inRow = false,
}: {
  content: Content
  variant?: CardVariant
  /** Por padrão: página do conteúdo. */
  href?: string
  /** 0..1 — barra de progresso (continuar assistindo). */
  progress?: number
  subtitle?: string
  /** Dentro de carrossel: largura fixa + snap. */
  inRow?: boolean
}) {
  const target = href ?? contentHref(content)
  const poster = variant === "poster"

  return (
    <article className={cn("group/card relative", inRow && ["shrink-0 snap-start", widths[variant]])}>
      <Link
        href={target}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-lilac-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-xl bg-surface-2 ring-1 ring-grape-900/5 transition-[box-shadow] duration-300 md:group-hover/card:ring-2 md:group-hover/card:ring-grape-500",
            poster ? "aspect-[2/3]" : "aspect-video"
          )}
        >
          <Image
            src={content.posterUrl && poster ? content.posterUrl : content.thumbnailUrl}
            alt=""
            fill
            sizes={poster ? "(min-width: 1280px) 196px, (min-width: 768px) 176px, 40vw" : "(min-width: 1280px) 312px, (min-width: 768px) 280px, 74vw"}
            className="object-cover transition-transform duration-500 ease-(--ease-soft) md:group-hover/card:scale-[1.04]"
          />
          {/* Véu + botão play no hover (desktop) */}
          <div className="absolute inset-0 bg-linear-to-t from-grape-900/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 md:group-hover/card:opacity-100" />
          {isVideo(content) && (
            <span className="absolute bottom-3 left-3 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-grape-600 opacity-0 shadow-lg transition-all duration-300 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100">
              <Play className="size-4 translate-x-px fill-current" aria-hidden="true" />
            </span>
          )}
          {typeof progress === "number" && (
            <div className="absolute inset-x-3 bottom-2.5 h-1 overflow-hidden rounded-full bg-white/70" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso">
              <div className="h-full rounded-full bg-grape-500" style={{ width: `${Math.max(4, progress * 100)}%` }} />
            </div>
          )}
        </div>

        <div className="mt-2.5 space-y-0.5">
          <h3 className="line-clamp-1 font-heading text-[0.95rem] font-semibold leading-snug text-grape-900">{content.title}</h3>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            {isVideo(content) && <AgeRatingBadge rating={content.ageRating} className="h-4 min-w-4 text-[0.6rem]" />}
            <span className="line-clamp-1">{subtitle ?? contentMeta(content)}</span>
          </p>
        </div>
      </Link>
    </article>
  )
}
