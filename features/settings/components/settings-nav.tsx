"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { settingsSections } from "../sections"

/** Navegação lateral (desktop) das configurações. No mobile a página índice lista as secções. */
export function SettingsNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Configurações" className="hidden lg:block">
      <p className="mb-3 px-3 text-xs font-semibold tracking-[0.16em] text-lilac-400 uppercase">Configurações</p>
      <ul className="space-y-1">
        {settingsSections.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground/65 transition-colors hover:bg-grape-600/5 hover:text-foreground",
                  active && "bg-grape-600/20 text-foreground"
                )}
              >
                <Icon className={cn("size-4", active && "text-lilac-400")} aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
