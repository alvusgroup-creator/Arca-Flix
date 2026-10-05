import { cn } from "@/lib/utils"
import { ageRatingLabel } from "@/utils/age-rating"
import type { AgeRating } from "@/types"

// Cores da classificação indicativa brasileira.
const styles: Record<AgeRating, string> = {
  L: "bg-[#0c9447] text-foreground",
  "10": "bg-[#0f7dc2] text-foreground",
  "12": "bg-[#f8c411] text-black",
  "14": "bg-[#e67824] text-foreground",
  "16": "bg-[#db2827] text-foreground",
  "18": "bg-black text-foreground ring-1 ring-grape-600/40",
}

export function AgeRatingBadge({ rating, className }: { rating: AgeRating; className?: string }) {
  return (
    <span
      title={`Classificação: ${ageRatingLabel[rating]}`}
      aria-label={`Classificação: ${ageRatingLabel[rating]}`}
      className={cn(
        "inline-grid h-5 min-w-5 place-items-center rounded-[5px] px-1 text-[0.7rem] leading-none font-bold",
        styles[rating],
        className
      )}
    >
      {rating}
    </span>
  )
}
