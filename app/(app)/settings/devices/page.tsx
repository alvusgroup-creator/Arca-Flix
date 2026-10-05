import type { Metadata } from "next"
import { DeviceList } from "@/features/settings/components/device-list"
import { SettingsTitle } from "@/features/settings/components/settings-card"
import { listDevices } from "@/services/account"
import { requireAccount } from "@/services/auth"
import { getSubscription } from "@/services/subscriptions"

export const metadata: Metadata = { title: "Dispositivos" }

export default async function DevicesPage() {
  const account = await requireAccount()
  const [devices, subscription] = await Promise.all([listDevices(account.id), getSubscription(account.id)])
  return (
    <>
      <SettingsTitle title="Dispositivos" description="Aparelhos que entraram na sua conta recentemente." />
      <DeviceList devices={devices} maxDevices={subscription?.plan?.maxDevices ?? null} />
    </>
  )
}
