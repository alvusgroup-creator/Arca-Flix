"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Info, Play } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { MyListButton } from "@/features/favorites/components/my-list-button"
import { cn } from "@/lib/utils"
import { contentHref, contentMeta, contentTypeLabel } from "@/utils/content"
import type { Content } from "@/types"
import { AgeRatingBadge } from "./age-rating-badge"

const ROTATE_MS = 9000

/** Destaques da Home: foto inteira com véu escuro e texto branco por cima. */
export function HeroBanner({ items, savedIds }: { items: Content[]; savedIds: string[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const current = items[index]

  useEffect(() => {
    if (items.length < 2 || paused) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS)
    return () => clearTimeout(id)
  }, [index, items.length, paused])

  if (!current) return null
  const category = current.categories[0]?.name ?? current.genres[0]

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-grape-900 md:min-h-[min(80svh,680px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {items.map((item, i) => (
        <Image
          key={item.id}
          src={item.bannerUrl}
          alt=""
          fill
          preload={i === 0}
          sizes="100vw"
          className={cn(
            "-z-20 object-cover transition-opacity duration-700 ease-(--ease-soft)",
            item.posterUrl && "max-md:hidden",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      {/* Celular: capas verticais (quando existem) enquadram melhor os personagens */}
      {items.map((item, i) =>
        item.posterUrl ? (
          <Image
            key={`${item.id}-poster`}
            src={item.posterUrl}
            alt=""
            fill
            preload={i === 0}
            sizes="100vw"
            className={cn(
              "-z-20 object-cover object-top transition-opacity duration-700 ease-(--ease-soft) md:hidden",
              i === index ? "opacity-100" : "opacity-0"
            )}
          />
        ) : null
      )}
      <div className="veil absolute inset-0 -z-10 md:hidden" />
      <div className="veil-side absolute inset-0 -z-10 max-md:hidden" />

      <div className="page-x w-full pt-24 pb-10 md:pb-16">
        <div key={current.id} className="mx-auto max-w-xl animate-fade-up text-center md:mx-0 md:text-left">
          <p className="mb-4 inline-flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.18em] text-white/85 uppercase">
            <span className="size-1.5 rounded-full bg-sun-400" aria-hidden="true" />
            {contentTypeLabel[current.type]}
            {category && <span className="text-white/60">· {category}</span>}
          </p>
          <h1 className="text-[2.6rem] leading-[1.02] font-bold text-white sm:text-5xl lg:text-6xl">{current.title}</h1>
          <p className="mt-4 flex items-center justify-center gap-2.5 text-sm text-white/80 md:justify-start">
            <AgeRatingBadge rating={current.ageRating} />
            {contentMeta(current)}
          </p>
          <p className="mt-3 line-clamp-3 text-[0.98rem] leading-relaxed text-white/85 md:text-[1.05rem]">
            {current.description}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link href={`/watch/${current.id}`} className={buttonVariants({ size: "lg" })}>
              <Play className="fill-current" />
              Assistir agora
            </Link>
            <MyListButton contentId={current.id} saved={savedIds.includes(current.id)} onDark />
            <Link
              href={contentHref(current)}
              aria-label={`Mais informações sobre ${current.title}`}
              className={buttonVariants({ variant: "onDark", size: "icon-lg" })}
            >
              <Info />
            </Link>
          </div>
        </div>

        {items.length > 1 && (
          <div className="mt-8 flex justify-center gap-2 md:justify-start" role="tablist" aria-label="Escolher destaque">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={item.title}
                onClick={() => setIndex(i)}
                className="group grid h-6 place-items-center"
              >
                <span
                  className={cn(
                    "block h-1 rounded-full transition-all duration-300",
                    i === index ? "w-8 bg-white" : "w-4 bg-white/35 group-hover:bg-white/60"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
