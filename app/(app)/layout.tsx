import type { Metadata } from "next"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { TopBar } from "@/components/layout/top-bar"
import { AudioPlayerProvider } from "@/features/music/components/audio-player"
import { getNotifications } from "@/services/notifications"
import { listProfiles, requireActiveProfile } from "@/services/profiles"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { account, profile } = await requireActiveProfile()
  const [profiles, notifications] = await Promise.all([listProfiles(account.id), getNotifications()])

  return (
    <div className="min-h-dvh">
      <a
        href="#conteudo"
        className="sr-only z-[60] rounded-lg bg-lilac-400 px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <AppSidebar isAdmin={account.role === "admin"} />
      <TopBar profile={profile} profiles={profiles} notifications={notifications} />
      <main
        id="conteudo"
        className="min-h-dvh pt-(--topbar-h) pb-[calc(var(--mobile-nav-h)+env(safe-area-inset-bottom))] md:pb-0 md:pl-(--sidebar-w)"
      >
        <AudioPlayerProvider>{children}</AudioPlayerProvider>
      </main>
      <MobileNav />
    </div>
  )
}
