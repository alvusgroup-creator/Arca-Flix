import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl space-y-2 animate-fade-up">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.18em] text-lilac-400 uppercase">{eyebrow}</p>
        )}
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        {description && <p className="text-muted-foreground md:text-lg">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

/** Contentor padrão das páginas internas sem hero (compensa a topbar fixa). */
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("page-x pt-6 pb-16 md:pt-10", className)}>
      {children}
    </div>
  )
}
