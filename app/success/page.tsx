import type { Metadata } from "next"
import Link from "next/link"
import { CircleCheck, LoaderCircle } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { OnboardingSteps } from "@/components/shared/onboarding-steps"
import { buttonVariants } from "@/components/ui/button"
import { isResendConfigured } from "@/lib/env.server"
import { requireAccount } from "@/services/auth"
import { listProfiles } from "@/services/profiles"
import { hasActiveSubscription } from "@/services/subscriptions"

export const metadata: Metadata = { title: "Pagamento confirmado", robots: { index: false, follow: false } }

export default async function SuccessPage() {
  const account = await requireAccount()
  // Só o webhook ativa a assinatura; aqui apenas lemos o estado atual.
  const [active, profiles] = await Promise.all([hasActiveSubscription(account.id), listProfiles(account.id)])

  return (
    <div className="min-h-dvh">
      <PublicHeader signedIn />
      <main className="page-x mx-auto flex max-w-lg flex-col items-center pt-8 pb-20 text-center">
        {profiles.length === 0 && <OnboardingSteps current={4} className="mb-10" />}

        {active ? (
          <div className="animate-fade-up space-y-5">
            <span className="glow-lilac mx-auto grid size-20 place-items-center rounded-full bg-lilac-500/15">
              <CircleCheck className="size-10 text-lilac-400" aria-hidden="true" />
            </span>
            <h1 className="text-3xl font-semibold sm:text-4xl">Assinatura ativa!</h1>
            <p className="text-muted-foreground">
              Tudo pronto{account.fullName ? `, ${account.fullName}` : ""}.
              {isResendConfigured && ` Enviamos a confirmação para ${account.email}.`}
            </p>
            <Link href="/profiles" className={buttonVariants({ size: "lg" })}>
              {profiles.length === 0 ? "Criar o primeiro perfil" : "Começar a assistir"}
            </Link>
          </div>
        ) : (
          <div className="animate-fade-up space-y-5">
            <LoaderCircle className="mx-auto size-12 animate-spin text-lilac-400" aria-hidden="true" />
            <h1 className="text-3xl font-semibold">Confirmando o pagamento…</h1>
            <p className="text-muted-foreground">
              Isso costuma levar poucos segundos. Atualize esta página em instantes.
            </p>
            <Link href="/success" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Atualizar
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
