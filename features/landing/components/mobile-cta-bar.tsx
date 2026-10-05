"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** CTA fixo no celular; aparece depois que o hero sai da tela. */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={cn(
        "safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-grape-900/10 bg-white/95 backdrop-blur-md transition-transform duration-300 md:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <p className="flex-1 text-xs leading-tight text-muted-foreground">
          <span className="block text-sm font-bold text-grape-900">Arca Flix para a família</span>
          Sem anúncios · Cancele quando quiser
        </p>
        <Link href="/register" tabIndex={visible ? 0 : -1} className={buttonVariants()}>
          Começar agora
        </Link>
      </div>
    </div>
  )
}
