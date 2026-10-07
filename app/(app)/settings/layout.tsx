import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { SettingsNav } from "@/features/settings/components/settings-nav"
import { requireFamilyManager } from "@/services/profiles"

export default async function SettingsLayout({ children }: LayoutProps<"/settings">) {
  const { allowed } = await requireFamilyManager()

  // Perfil infantil não mexe em conta, assinatura nem perfis.
  if (!allowed) {
    return (
      <PageContainer>
        <EmptyState
          icon={ShieldCheck}
          title="Área dos pais"
          description="As configurações ficam no perfil de um adulto. Troque de perfil e digite o PIN para entrar."
          action={
            <Link href="/profiles" className={buttonVariants()}>
              Trocar de perfil
            </Link>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </PageContainer>
  )
}
