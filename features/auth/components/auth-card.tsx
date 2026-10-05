import { cn } from "@/lib/utils"

export function AuthCard({
  title,
  description,
  children,
  className,
  top,
}: {
  /** Conteúdo acima do título (ex.: etapas do cadastro) */
  top?: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "animate-fade-up rounded-2xl bg-white p-6 shadow-soft-lg sm:p-8",
        className
      )}
    >
      {top && <div className="mb-6">{top}</div>}
      <div className="mb-6 space-y-1.5 text-center lg:text-left">
        <h1 className="text-2xl font-semibold sm:text-[1.75rem]">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-red-200"
          : "border-lilac-400/30 bg-lilac-400/10 text-lilac-400"
      )}
    >
      {children}
    </p>
  )
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-xs text-red-300">
      {message}
    </p>
  )
}
