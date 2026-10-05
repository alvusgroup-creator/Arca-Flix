import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { SignOutButton } from "@/features/settings/components/sign-out-button"
import { settingsSections } from "@/features/settings/sections"
import { avatarSrc } from "@/features/profiles/avatars"
import { requireActiveProfile } from "@/services/profiles"
import { getSubscription } from "@/services/subscriptions"

export const metadata: Metadata = { title: "Configurações" }

export default async function SettingsPage() {
  const { account, profile } = await requireActiveProfile()
  const subscription = await getSubscription(account.id)

  return (
    <div className="space-y-8">
      <PageHeader title="Configurações" description="Gerencie a sua conta, os perfis da família e a assinatura." />

      <div className="flex items-center gap-4 rounded-3xl border border-grape-600/[0.07] bg-surface-1 p-5">
        <Image src={avatarSrc(profile.avatar)} alt="" width={56} height={56} className="size-14 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{account.fullName || account.email}</p>
          <p className="truncate text-sm text-muted-foreground">{account.email}</p>
        </div>
        <span className="hidden rounded-full bg-grape-600/25 px-3 py-1 text-xs font-semibold text-foreground sm:inline">
          {subscription?.plan ? `Plano ${subscription.plan.name}` : "Sem plano"}
        </span>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {settingsSections.map(({ href, label, description, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-grape-600/[0.07] bg-surface-1 p-4 transition-colors hover:border-grape-600/15 hover:bg-surface-2"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-grape-600/5 text-lilac-400">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="block truncate text-sm text-muted-foreground">{description}</span>
              </span>
              <ChevronRight className="size-5 text-foreground/30 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <SignOutButton />
    </div>
  )
}
