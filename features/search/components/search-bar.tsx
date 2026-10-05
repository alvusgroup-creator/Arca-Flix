"use client"

import { useEffect, useId, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LoaderCircle, Search, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

/**
 * Campo de busca global. Atualiza /search?q= com debounce; os resultados são
 * renderizados no servidor pela página de busca.
 */
export function SearchBar({ className, autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const initial = pathname === "/search" ? (params.get("q") ?? "") : ""
  const [value, setValue] = useState(initial)
  const debounced = useDebounce(value, 300)
  const pending = value !== debounced
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const lastPushed = useRef(initial)

  useEffect(() => {
    const q = debounced.trim()
    if (q === lastPushed.current.trim()) return
    lastPushed.current = q
    const url = q ? `/search?q=${encodeURIComponent(q)}` : "/search"
    if (pathname === "/search") router.replace(url, { scroll: false })
    else if (q) router.push(url)
  }, [debounced, pathname, router])

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault()
        const q = value.trim()
        lastPushed.current = q
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
      }}
    >
      <label htmlFor={id} className="sr-only">
        Buscar séries, filmes, músicas e atividades
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-foreground/50" aria-hidden="true" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar séries, filmes, músicas…"
        className="h-11 w-full rounded-full border border-grape-600/10 bg-grape-600/[0.06] pr-10 pl-10 text-sm text-foreground placeholder:text-foreground/45 transition-colors outline-none focus:border-lilac-500/60 focus:bg-grape-600/[0.09] [&::-webkit-search-cancel-button]:hidden"
      />
      {pending && value ? (
        <LoaderCircle className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-foreground/50" aria-hidden="true" />
      ) : (
        value && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              setValue("")
              inputRef.current?.focus()
            }}
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-foreground/60 hover:bg-grape-600/10 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )
      )}
    </form>
  )
}
