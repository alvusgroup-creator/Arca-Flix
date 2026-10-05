import type { Metadata } from "next"
import { Check } from "lucide-react"
import { PreferenceSwitch } from "@/features/settings/components/preference-switch"
import { SettingsCard, SettingsTitle } from "@/features/settings/components/settings-card"
import { getPreferences } from "@/services/account"
import { requireAccount } from "@/services/auth"

export const metadata: Metadata = { title: "Idioma" }

export default async function LanguagePage() {
  const account = await requireAccount()
  const prefs = await getPreferences(account.id)
  return (
    <>
      <SettingsTitle title="Idioma e reprodução" description="Idioma da interface, legendas e reprodução automática." />
      <div className="space-y-5">
        <SettingsCard title="Idioma da interface">
          <div className="flex items-center justify-between rounded-xl border border-grape-500/60 bg-grape-600/15 px-4 py-3">
            <span className="font-medium">Português (Brasil)</span>
            <Check className="size-5 text-lilac-400" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Novos idiomas aparecem aqui assim que estiverem disponíveis.</p>
        </SettingsCard>
        <SettingsCard title="Reprodução">
          <div className="divide-y divide-grape-600/[0.06]">
            <PreferenceSwitch
              name="captionsByDefault"
              label="Legendas ativadas"
              description="Iniciar os vídeos com legendas em português quando houver."
              value={prefs.captionsByDefault}
            />
            <PreferenceSwitch
              name="autoplayNext"
              label="Próximo episódio automático"
              description="Começar o episódio seguinte ao terminar o atual."
              value={prefs.autoplayNext}
            />
          </div>
        </SettingsCard>
      </div>
    </>
  )
}
