import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Conta", "Plano", "Pagamento", "Perfil"]

/** Indicador do fluxo de cadastro: conta → plano → pagamento → primeiro perfil. */
export function OnboardingSteps({ current, className }: { current: 1 | 2 | 3 | 4; className?: string }) {
  return (
    <ol className={cn("flex items-center justify-center gap-2 text-xs", className)} aria-label="Etapas do cadastro">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border text-[0.7rem] font-semibold transition-colors",
                done && "border-lilac-500 bg-lilac-500 text-ink",
                active && "border-grape-500 bg-grape-600 text-white",
                !done && !active && "border-grape-600/15 text-foreground/50"
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden="true" /> : step}
            </span>
            <span className={cn("hidden font-medium sm:inline", active ? "text-foreground" : "text-foreground/50")}>{label}</span>
            {step < STEPS.length && <span className="h-px w-5 bg-grape-600/15 sm:w-8" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
