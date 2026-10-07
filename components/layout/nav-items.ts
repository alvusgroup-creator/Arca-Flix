import {
  Bookmark,
  BookOpen,
  Clapperboard,
  Compass,
  Film,
  House,
  Music,
  Palette,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const primaryNav: NavItem[] = [
  { href: "/browse", label: "Início", icon: House },
  { href: "/series", label: "Séries", icon: Clapperboard },
  { href: "/movies", label: "Filmes", icon: Film },
  { href: "/music", label: "Músicas", icon: Music },
  { href: "/colorir", label: "Para Colorir", icon: Palette },
  { href: "/estudos", label: "Estudos Bíblicos", icon: BookOpen },
  { href: "/my-list", label: "Minha Lista", icon: Bookmark },
]

export const settingsNav: NavItem = { href: "/settings", label: "Configurações", icon: Settings }

export const mobileNav: NavItem[] = [
  { href: "/browse", label: "Início", icon: House },
  { href: "/search", label: "Explorar", icon: Compass },
  { href: "/music", label: "Músicas", icon: Music },
  { href: "/my-list", label: "Minha Lista", icon: Bookmark },
  { href: "/settings", label: "Conta", icon: UserRound },
]

export function isActive(pathname: string, href: string) {
  if (href === "/browse") return pathname === "/browse"
  return pathname === href || pathname.startsWith(`${href}/`)
}
