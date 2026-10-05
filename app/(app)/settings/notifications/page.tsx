import type { Metadata } from "next"
import { PreferenceSwitch } from "@/features/settings/components/preference-switch"
import { SettingsCard, SettingsTitle } from "@/features/settings/components/settings-card"
import { getPreferences } from "@/services/account"
import { requireAccount } from "@/services/auth"

export const metadata: Metadata = { title: "Notificações" }

export default async function NotificationsSettingsPage() {
  const account = await requireAccount()
  const prefs = await getPreferences(account.id)
  return (
    <>
      <SettingsTitle title="Notificações" description="Escolha como quer saber das novidades." />
      <SettingsCard title="Avisos">
        <div className="divide-y divide-grape-600/[0.06]">
          <PreferenceSwitch
            name="notifyNewContent"
            label="Novos conteúdos"
            description="Aviso no sino quando chegarem episódios, músicas e desenhos."
            value={prefs.notifyNewContent}
          />
          <PreferenceSwitch
            name="notifyEmail"
            label="E-mails de novidades"
            description="Um resumo ocasional com lançamentos para a família."
            value={prefs.notifyEmail}
          />
        </div>
      </SettingsCard>
    </>
  )
}
