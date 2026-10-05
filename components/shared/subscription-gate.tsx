import Link from "next/link"
import { Crown } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Aviso de conteúdo premium (estado subscription_required). */
export function SubscriptionGate({
  title = "Assine para liberar",
  description = "Este conteúdo faz parte da assinatura Arca Flix.",
  className,
}: {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 rounded-3xl border border-lilac-400/25 bg-grape-600/10 p-5 sm:flex-row sm:items-center",
        className
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-grape-600/30 text-lilac-400">
        <Crown className="size-6" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Link href="/plans" className={buttonVariants()}>
        Ver planos
      </Link>
    </div>
  )
}
