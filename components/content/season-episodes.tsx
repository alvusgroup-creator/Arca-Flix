"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { plural } from "@/utils/format"
import type { Season, WatchProgress } from "@/types"
import { EpisodeCard } from "./episode-card"

export function SeasonEpisodes({
  seasons,
  progress,
  initialSeason,
  currentEpisodeId,
}: {
  seasons: Season[]
  progress: Record<string, WatchProgress>
  initialSeason?: number
  currentEpisodeId?: string
}) {
  const [selected, setSelected] = useState(initialSeason ?? seasons[0]?.number ?? 1)
  const season = seasons.find((s) => s.number === selected) ?? seasons[0]
  if (!season) return null

  return (
    <section aria-labelledby="episodios" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="episodios" className="text-xl font-semibold md:text-2xl">
          Episódios
        </h2>
        {seasons.length > 1 && (
          <div role="tablist" aria-label="Temporadas" className="scrollbar-none flex gap-2 overflow-x-auto">
            {seasons.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.number === season.number}
                onClick={() => setSelected(s.number)}
                className={cn(
                  "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors duration-200",
                  s.number === season.number
                    ? "border-grape-500 bg-grape-600 text-white"
                    : "border-grape-600/10 bg-grape-600/5 text-foreground/70 hover:border-grape-600/25 hover:text-foreground"
                )}
              >
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {season.title} · {plural(season.episodes.length, "episódio", "episódios")}
      </p>
      <ol className="grid gap-1 lg:grid-cols-2 lg:gap-x-4">
        {season.episodes.map((ep) => (
          <li key={ep.id}>
            <EpisodeCard episode={ep} progress={progress[ep.id]} current={ep.id === currentEpisodeId} />
          </li>
        ))}
      </ol>
    </section>
  )
}
