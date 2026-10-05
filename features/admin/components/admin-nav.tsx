"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/content", label: "Conteúdos" },
  { href: "/admin/plans", label: "Planos" },
  { href: "/admin/categories", label: "Categorias" },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Administração" className="scrollbar-none -mx-(--page-x) overflow-x-auto px-(--page-x)">
      <ul className="flex gap-2">
        {items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors",
                  active ? "bg-grape-600 text-white shadow-soft" : "bg-white text-grape-700 shadow-soft hover:bg-lilac-100"
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
