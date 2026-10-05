import { cn } from "@/lib/utils"

export function SettingsCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-3xl border border-grape-600/[0.07] bg-surface-1 p-5 sm:p-6", className)}>
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export function SettingsTitle({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6 space-y-1">
      <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </header>
  )
}
