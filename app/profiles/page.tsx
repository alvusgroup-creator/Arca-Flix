import type { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { OnboardingSteps } from "@/components/shared/onboarding-steps"
import { FirstProfile } from "@/features/profiles/components/first-profile"
import { ProfilePicker } from "@/features/profiles/components/profile-picker"
import { requireAccount } from "@/services/auth"
import { canManageFamily, getActiveProfile, listProfiles } from "@/services/profiles"
import { getSubscription } from "@/services/subscriptions"

export const metadata: Metadata = {
  title: "Quem vai assistir?",
  robots: { index: false, follow: false },
}

export default async function ProfilesPage({ searchParams }: PageProps<"/profiles">) {
  const account = await requireAccount()
  const [profiles, subscription, { unlock, criado }] = await Promise.all([
    listProfiles(account.id),
    getSubscription(account.id),
    searchParams,
  ])
  const maxProfiles = subscription?.plan?.maxProfiles ?? 5

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgb(123_47_190/0.28),transparent_60%),radial-gradient(ellipse_at_bottom,rgb(180_122_234/0.08),transparent_55%)]"
      />
      <header className="page-x flex h-20 items-center justify-center md:justify-start">
        <Link href="/browse" aria-label="Arca Flix">
          <Logo className="text-xl" iconClassName="h-10" />
        </Link>
      </header>

      <main className="page-x flex flex-1 flex-col items-center justify-center py-10">
        {profiles.length === 0 ? (
          <div className="w-full max-w-lg space-y-6">
            {/* Só mostra as etapas no fluxo de cadastro (já assinou e falta o perfil) */}
            {subscription && <OnboardingSteps current={4} />}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold md:text-4xl">Primeiro, o seu perfil</h1>
              <p className="text-muted-foreground">
                É o perfil do responsável, onde ficam o controle parental e a assinatura. Depois você cria um perfil para cada filho.
              </p>
            </div>
            <div className="rounded-3xl border border-grape-600/10 bg-surface-1/80 p-6">
              <FirstProfile name={account.fullName} />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <h1 className="mb-3 text-center text-3xl font-semibold md:text-5xl">Quem vai assistir?</h1>
            <p className="mb-10 text-center text-muted-foreground md:mb-14">
              {criado && profiles.length === 1
                ? "Perfil criado! Agora toque em “Adicionar perfil” para criar o perfil de cada filho."
                : "Escolha seu perfil para começar."}
            </p>
            <ProfilePicker
              profiles={profiles}
              maxProfiles={maxProfiles}
              canManage={canManageFamily(profiles, await getActiveProfile())}
              unlockId={typeof unlock === "string" ? unlock : undefined}
            />
          </div>
        )}
      </main>
    </div>
  )
}
