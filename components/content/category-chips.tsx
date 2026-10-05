import Link from "next/link"
import { cn } from "@/lib/utils"

/** Filtros por categoria via query string (?cat=slug) — funciona sem JS. */
export function CategoryChips({
  basePath,
  categories,
  active,
}: {
  basePath: string
  categories: { slug: string; name: string }[]
  active?: string
}) {
  if (!categories.length) return null
  const chip = (isActive: boolean) =>
    cn(
      "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200",
      isActive
        ? "border-grape-500 bg-grape-600 text-white"
        : "border-grape-600/10 bg-grape-600/5 text-foreground/70 hover:border-grape-600/25 hover:text-foreground"
    )

  return (
    <nav aria-label="Filtrar por categoria" className="scrollbar-none -mx-(--page-x) overflow-x-auto px-(--page-x)">
      <ul className="flex gap-2">
        <li>
          <Link href={basePath} className={chip(!active)} aria-current={!active ? "page" : undefined}>
            Todos
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`${basePath}?cat=${c.slug}`}
              className={chip(active === c.slug)}
              aria-current={active === c.slug ? "page" : undefined}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
