import type { Metadata } from "next"
import { AccountForms } from "@/features/settings/components/account-forms"
import { SettingsTitle } from "@/features/settings/components/settings-card"
import { requireAccount } from "@/services/auth"

export const metadata: Metadata = { title: "Conta" }

export default async function AccountPage() {
  const account = await requireAccount()
  return (
    <>
      <SettingsTitle title="Conta" description="Dados de acesso da sua conta Arca Flix." />
      <AccountForms fullName={account.fullName} email={account.email} />
    </>
  )
}
