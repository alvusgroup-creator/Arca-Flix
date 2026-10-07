import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Conta", "Plano", "Pagamento", "Perfil"]

/** Indicador do fluxo de cadastro: conta → plano → pagamento → primeiro perfil. */
export function OnboardingSteps({ current, className }: { current: 1 | 2 | 3 | 4; className?: string }) {
  return (
    <ol className={cn("mx-auto grid w-full max-w-sm grid-cols-4", className)} aria-label="Etapas do cadastro">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <li key={label} className="relative flex flex-col items-center gap-1.5" aria-current={active ? "step" : undefined}>
            {step < STEPS.length && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-3.5 right-[calc(-50%+20px)] left-[calc(50%+20px)] h-0.5 rounded-full",
                  done ? "bg-grape-500" : "bg-grape-900/10"
                )}
              />
            )}
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full text-xs font-bold transition-colors",
                done && "bg-grape-500 text-white",
                active && "bg-grape-600 text-white ring-4 ring-grape-600/15",
                !done && !active && "border border-grape-900/15 bg-white text-foreground/45"
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden="true" /> : step}
            </span>
            <span className={cn("text-[0.72rem] font-semibold", active ? "text-grape-700" : "text-foreground/50")}>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
