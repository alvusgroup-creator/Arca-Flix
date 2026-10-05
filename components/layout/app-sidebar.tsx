"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { isActive, primaryNav, settingsNav, type NavItem } from "./nav-items"

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href)
  const Icon = item.icon
  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[0.925rem] font-medium text-foreground/65 transition-colors duration-200",
        "hover:bg-grape-600/[0.06] hover:text-foreground md:justify-center lg:justify-start",
        active && "bg-grape-600 text-white hover:bg-grape-700 hover:text-white"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sun-400 opacity-0 transition-opacity",
          active && "opacity-100"
        )}
      />
      <Icon
        className={cn("size-5 shrink-0 transition-colors", active ? "text-white" : "text-grape-500 group-hover:text-grape-600")}
        aria-hidden="true"
      />
      <span className="md:sr-only lg:not-sr-only">{item.label}</span>
    </Link>
  )

  // No modo "rail" (tablet) mostra o nome em tooltip.
  return (
    <li>
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side="right" className="lg:hidden">
          {item.label}
        </TooltipContent>
      </Tooltip>
    </li>
  )
}

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 hidden w-(--sidebar-w) flex-col border-r border-grape-600/10 bg-white/80 px-3 py-5 backdrop-blur md:flex"
      aria-label="Navegação principal"
    >
      <Link href="/browse" className="mb-8 flex items-center justify-center rounded-xl px-2 lg:justify-start" aria-label="Arca Flix — início">
        <Logo className="text-lg max-lg:hidden" />
        <Logo variant="icon" iconClassName="h-10 lg:hidden" />
      </Link>

      <nav className="flex flex-1 flex-col justify-between">
        <ul className="space-y-1">
          {primaryNav.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} />
          ))}
        </ul>
        <ul className="space-y-1 border-t border-grape-600/[0.06] pt-4">
          {isAdmin && (
            <SidebarLink item={{ href: "/admin", label: "Administração", icon: ShieldCheck }} pathname={pathname} />
          )}
          <SidebarLink item={settingsNav} pathname={pathname} />
        </ul>
      </nav>
    </aside>
  )
}
