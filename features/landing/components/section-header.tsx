import { cn } from "@/lib/utils"

/** Cabeçalho de secção centrado: pílula → título → texto curto. */
export function SectionHeader({
  pill,
  title,
  text,
  className,
}: {
  pill: string
  title: React.ReactNode
  text?: string
  className?: string
}) {
  return (
    <div className={cn("reveal mx-auto max-w-2xl text-center", className)}>
      <p className="inline-flex rounded-full bg-lilac-100 px-3 py-1 text-[0.72rem] font-bold tracking-[0.14em] text-grape-600 uppercase">
        {pill}
      </p>
      <h2 className="mt-4 text-[2rem] leading-[1.1] font-bold text-grape-900 sm:text-[2.5rem]">{title}</h2>
      {text && <p className="mx-auto mt-4 max-w-lg text-[1.02rem] leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  )
}
