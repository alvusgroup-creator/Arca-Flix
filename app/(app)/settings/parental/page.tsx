import type { Metadata } from "next"
import { ParentalControls } from "@/features/profiles/components/parental-controls"
import { SettingsTitle } from "@/features/settings/components/settings-card"
import { ShieldCheck } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { listCategories } from "@/services/content"
import { listProfiles, requireActiveProfile } from "@/services/profiles"

export const metadata: Metadata = { title: "Controle parental" }

export default async function ParentalPage() {
  const { account, profile } = await requireActiveProfile()
  if (profile.kind !== "adult") {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Área dos pais"
        description="O controle parental só pode ser alterado a partir de um perfil adulto."
      />
    )
  }
  const [profiles, categories] = await Promise.all([listProfiles(account.id), listCategories()])
  return (
    <>
      <SettingsTitle
        title="Controle parental"
        description="Defina o que cada perfil pode assistir. As regras valem para catálogo, busca e recomendações."
      />
      <ParentalControls profiles={profiles} categories={categories} />
    </>
  )
}
