import type { Metadata } from "next"
import { SettingsTitle } from "@/features/settings/components/settings-card"
import { ProfilesManager } from "@/features/profiles/components/profiles-manager"
import { requireAccount } from "@/services/auth"
import { listProfiles } from "@/services/profiles"
import { getSubscription } from "@/services/subscriptions"

export const metadata: Metadata = { title: "Perfis" }

export default async function SettingsProfilesPage() {
  const account = await requireAccount()
  const [profiles, subscription] = await Promise.all([listProfiles(account.id), getSubscription(account.id)])
  return (
    <>
      <SettingsTitle title="Perfis" description="Cada pessoa da família com o seu histórico, lista e recomendações." />
      <ProfilesManager profiles={profiles} maxProfiles={subscription?.plan?.maxProfiles ?? 5} />
    </>
  )
}
