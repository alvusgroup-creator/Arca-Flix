"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { SearchBar } from "@/features/search/components/search-bar"
import type { NotificationItem, ViewerProfile } from "@/types"
import { NotificationsMenu } from "./notifications-menu"
import { ProfileMenu } from "./profile-menu"

export function TopBar({
  profile,
  profiles,
  notifications,
}: {
  profile: ViewerProfile
  profiles: ViewerProfile[]
  notifications: NotificationItem[]
}) {
  return (
    <header
      className="fixed top-0 right-0 left-0 z-40 h-(--topbar-h) border-b border-grape-900/8 bg-white/90 backdrop-blur-md md:left-(--sidebar-w)"
    >
      <div className="page-x flex h-full items-center gap-3">
        <Link href="/browse" className="shrink-0 md:hidden" aria-label="Arca Flix — início">
          <Logo className="text-base" iconClassName="h-8" />
        </Link>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0 md:flex-1 md:gap-3">
          <Suspense fallback={<div className="hidden h-11 w-full max-w-md md:block" />}>
            <SearchBar className="hidden w-full max-w-md md:block" />
          </Suspense>
          <Link
            href="/search"
            aria-label="Buscar"
            className="grid size-10 place-items-center rounded-full text-foreground/85 hover:bg-grape-600/10 md:hidden"
          >
            <Search className="size-5" />
          </Link>
          <div className="flex items-center gap-1.5 md:ml-auto">
            <NotificationsMenu notifications={notifications} />
            <ProfileMenu profile={profile} profiles={profiles} />
          </div>
        </div>
      </div>
    </header>
  )
}
