import { cn } from "@/lib/utils"
import type { Content } from "@/types"
import { ContentCard, type CardVariant } from "./content-card"

export function ContentGrid({ items, variant = "landscape" }: { items: Content[]; variant?: CardVariant }) {
  return (
    <div
      className={cn(
        "grid gap-x-4 gap-y-7",
        variant === "poster"
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
          : "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      )}
    >
      {items.map((item) => (
        <ContentCard key={item.id} content={item} variant={variant} />
      ))}
    </div>
  )
}
