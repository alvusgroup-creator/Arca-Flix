import type { Metadata } from "next"
import { PrivacyActions } from "@/features/settings/components/privacy-actions"
import { SettingsTitle } from "@/features/settings/components/settings-card"

export const metadata: Metadata = { title: "Privacidade" }

export default function PrivacyPage() {
  return (
    <>
      <SettingsTitle
        title="Privacidade"
        description="Os dados das crianças ficam apenas na sua conta e nunca são usados para publicidade."
      />
      <PrivacyActions />
    </>
  )
}
