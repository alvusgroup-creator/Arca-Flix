import { formatDuration } from "@/utils/format"
import type { Content, ContentType } from "@/types"

const basePath: Record<ContentType, string> = {
  series: "/content",
  movie: "/content",
  music: "/music",
  coloring: "/colorir",
  study: "/estudos",
}

export function contentHref(content: Pick<Content, "type" | "slug">) {
  return `${basePath[content.type]}/${content.slug}`
}

export const contentTypeLabel: Record<ContentType, string> = {
  series: "Série",
  movie: "Filme",
  music: "Música",
  coloring: "Para colorir",
  study: "Estudo",
}

export function isVideo(content: Pick<Content, "type">) {
  return content.type === "series" || content.type === "movie"
}

/** "2026 · 2 temporadas" / "2026 · 1h 11min" */
export function contentMeta(content: Content) {
  const parts: string[] = []
  if (content.releaseYear) parts.push(String(content.releaseYear))
  if (content.type === "series" && content.seasonsCount)
    parts.push(`${content.seasonsCount} ${content.seasonsCount === 1 ? "temporada" : "temporadas"}`)
  if (content.type === "movie" && content.durationSeconds) parts.push(formatDuration(content.durationSeconds))
  if (!isVideo(content)) parts.push(contentTypeLabel[content.type])
  return parts.join(" · ")
}
