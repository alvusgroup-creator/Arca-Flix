import {
  Bell,
  CreditCard,
  Languages,
  MonitorSmartphone,
  ShieldCheck,
  Lock,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

export interface SettingsSection {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

export const settingsSections: SettingsSection[] = [
  { href: "/settings/account", label: "Conta", description: "Nome, e-mail e senha", icon: UserRound },
  { href: "/settings/profiles", label: "Perfis", description: "Criar, editar e remover perfis", icon: Users },
  { href: "/settings/parental", label: "Controle parental", description: "Classificação, categorias e PIN", icon: ShieldCheck },
  { href: "/settings/subscription", label: "Assinatura", description: "Plano, pagamento e faturas", icon: CreditCard },
  { href: "/settings/language", label: "Idioma", description: "Idioma da interface e legendas", icon: Languages },
  { href: "/settings/notifications", label: "Notificações", description: "Novidades e lembretes", icon: Bell },
  { href: "/settings/devices", label: "Dispositivos", description: "Aparelhos conectados à conta", icon: MonitorSmartphone },
  { href: "/settings/privacy", label: "Privacidade", description: "Dados, histórico e exclusão da conta", icon: Lock },
]
