"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { isActive, mobileNav } from "./nav-items"

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-grape-600/10 bg-white/95 shadow-[0_-8px_24px_-16px_rgb(91_33_182/0.35)] backdrop-blur-lg md:hidden"
    >
      <ul className="grid h-(--mobile-nav-h) grid-cols-5">
        {mobileNav.map((item) => {
          const active =
            isActive(pathname, item.href) ||
            (item.href === "/settings" && pathname.startsWith("/settings"))
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[0.68rem] font-medium text-foreground/55 transition-colors",
                  active && "text-grape-700"
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-12 place-items-center rounded-full transition-colors duration-200",
                    active && "bg-grape-600"
                  )}
                >
                  <Icon className={cn("size-5", active ? "text-white" : "text-grape-500")} aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
