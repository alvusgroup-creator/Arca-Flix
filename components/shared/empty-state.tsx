import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-grape-600/10 px-6 py-12 text-center",
        className
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-grape-600/5 text-lilac-400">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
