"use client"

import { useEffect, useRef, useState } from "react"
import { recordStudyProgress } from "../actions"

/** Barra de leitura no topo + gravação do progresso (no máximo a cada 5s). */
export function ReadingProgress({ contentId, initial }: { contentId: string; initial: number }) {
  const [percent, setPercent] = useState(initial)
  const saved = useRef(initial)
  const lastSave = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const p = max > 0 ? Math.round((el.scrollTop / max) * 100) : 100
      setPercent((prev) => Math.max(prev, p))
      const now = Date.now()
      if (p > saved.current + 4 && now - lastSave.current > 5000) {
        saved.current = p
        lastSave.current = now
        void recordStudyProgress(contentId, p)
      }
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (saved.current < 100) {
        const el = document.documentElement
        const max = el.scrollHeight - el.clientHeight
        const p = max > 0 ? Math.round((el.scrollTop / max) * 100) : 100
        if (p > saved.current) void recordStudyProgress(contentId, p)
      }
    }
  }, [contentId])

  return (
    <div
      className="fixed top-(--topbar-h) right-0 left-0 z-30 h-1 bg-grape-600/5 md:left-(--sidebar-w)"
      role="progressbar"
      aria-label="Progresso de leitura"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-linear-to-r from-grape-500 to-lilac-400 transition-[width] duration-200" style={{ width: `${percent}%` }} />
    </div>
  )
}
