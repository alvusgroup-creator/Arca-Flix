import { PageContainer } from "@/components/shared/page-header"
import { SettingsNav } from "@/features/settings/components/settings-nav"

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <PageContainer className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </PageContainer>
  )
}
