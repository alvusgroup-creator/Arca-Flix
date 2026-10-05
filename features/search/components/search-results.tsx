import Image from "next/image"
import Link from "next/link"
import { SearchX } from "lucide-react"
import { ContentCard } from "@/components/content/content-card"
import { EmptyState } from "@/components/shared/empty-state"
import { contentTypeLabel } from "@/utils/content"
import { formatDuration } from "@/utils/format"
import type { SearchResult } from "@/services/content"

export function SearchResults({ query, results }: { query: string; results: SearchResult }) {
  const total = results.content.length + results.episodes.length
  if (!total) {
    return (
      <EmptyState
        icon={SearchX}
        title={`Nada encontrado para “${query}”`}
        description="Tente outro nome, um personagem bíblico ou um tema como “Noé”, “louvor” ou “colorir”."
      />
    )
  }

  return (
    <div className="space-y-12" aria-live="polite">
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "resultado" : "resultados"} para <span className="font-semibold text-foreground">“{query}”</span>
      </p>

      {results.content.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Títulos</h2>
          <div className="grid grid-cols-1 gap-x-4 gap-y-7 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {results.content.map((c) => (
              <ContentCard key={c.id} content={c} subtitle={contentTypeLabel[c.type]} />
            ))}
          </div>
        </section>
      )}

      {results.episodes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Episódios</h2>
          <ul className="grid gap-2 lg:grid-cols-2">
            {results.episodes.map((e) => (
              <li key={e.id}>
                <Link href={`/watch/${e.id}`} className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-grape-600/[0.05]">
                  <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl">
                    <Image src={e.thumbnailUrl} alt="" fill sizes="128px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{e.title}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {e.contentTitle} · T{e.seasonNumber}:E{e.number} · {formatDuration(e.durationSeconds)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
