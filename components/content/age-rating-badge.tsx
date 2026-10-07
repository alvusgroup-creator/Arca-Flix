import { cn } from "@/lib/utils"
import { ageRatingLabel } from "@/utils/age-rating"
import type { AgeRating } from "@/types"

// Cores da classificação indicativa brasileira.
const styles: Record<AgeRating, string> = {
  L: "bg-[#0c9447] text-white",
  "10": "bg-[#0f7dc2] text-white",
  "12": "bg-[#f8c411] text-black",
  "14": "bg-[#e67824] text-white",
  "16": "bg-[#db2827] text-white",
  "18": "bg-zinc-900 text-white ring-1 ring-zinc-400",
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
