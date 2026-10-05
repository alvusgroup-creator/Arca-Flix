import type { LucideIcon } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer, PageHeader } from "@/components/shared/page-header"
import type { Content } from "@/types"
import { CategoryChips } from "./category-chips"
import type { CardVariant } from "./content-card"
import { ContentGrid } from "./content-grid"

/** Página de catálogo reutilizada por Séries, Filmes e Músicas. */
export function CatalogPage({
  eyebrow,
  title,
  description,
  basePath,
  items,
  activeCategory,
  variant,
  emptyIcon,
  emptyTitle,
}: {
  eyebrow: string
  title: string
  description: string
  basePath: string
  items: Content[]
  activeCategory?: string
  variant?: CardVariant
  emptyIcon: LucideIcon
  emptyTitle: string
}) {
  const categories = [...new Map(items.flatMap((c) => c.categories).map((c) => [c.slug, c])).values()].sort(
    (a, b) => a.name.localeCompare(b.name)
  )
  const filtered = activeCategory
    ? items.filter((c) => c.categories.some((cat) => cat.slug === activeCategory))
    : items

  return (
    <PageContainer className="space-y-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <CategoryChips basePath={basePath} categories={categories} active={activeCategory} />
      {filtered.length ? (
        <ContentGrid items={filtered} variant={variant} />
      ) : (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description="Tente outra categoria ou volte mais tarde — novos títulos chegam com frequência."
        />
      )}
    </PageContainer>
  )
}
