"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Linha horizontal com scroll-snap. No toque usa o gesto nativo; no desktop
 * mostra setas ao passar o rato.
 */
export function ContentCarousel({
  title,
  href,
  children,
  className,
}: {
  title: string
  href?: string
  children: React.ReactNode
  className?: string
}) {
  const id = useId()
  const scroller = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const update = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update])

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" })
  }

  const arrow = "absolute top-0 bottom-14 z-10 hidden w-14 items-center justify-center text-foreground opacity-0 transition-opacity duration-200 md:flex group-hover/row:opacity-100 focus-visible:opacity-100 disabled:!opacity-0"

  return (
    <section aria-labelledby={id} className={cn("space-y-3", className)}>
      <div className="page-x flex items-end justify-between gap-4">
        <h2 id={id} className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h2>
        {href && (
          <Link href={href} className="shrink-0 text-sm font-medium text-foreground/60 transition-colors hover:text-lilac-400">
            Ver tudo
          </Link>
        )}
      </div>

      <div className="group/row relative">
        <button
          type="button"
          aria-label={`Anterior: ${title}`}
          onClick={() => scrollBy(-1)}
          disabled={edges.start}
          className={cn(arrow, "left-0 bg-linear-to-r from-surface-0 via-surface-0/70 to-transparent")}
        >
          <ChevronLeft className="size-7" />
        </button>
        <div
          ref={scroller}
          onScroll={update}
          className="scrollbar-none flex snap-x snap-mandatory scroll-px-(--page-x) gap-3 overflow-x-auto overscroll-x-contain px-(--page-x) pt-1 pb-3 md:gap-4"
        >
          {children}
        </div>
        <button
          type="button"
          aria-label={`Próximo: ${title}`}
          onClick={() => scrollBy(1)}
          disabled={edges.end}
          className={cn(arrow, "right-0 bg-linear-to-l from-surface-0 via-surface-0/70 to-transparent")}
        >
          <ChevronRight className="size-7" />
        </button>
      </div>
    </section>
  )
}
