import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { AdminNav } from "@/features/admin/components/admin-nav"
import { isDemoMode } from "@/lib/env"
import { requireAdmin } from "@/services/auth"

export const metadata: Metadata = {
  title: { default: "Administração", template: "%s · Admin Arca Flix" },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin()
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-grape-600/10 bg-surface-0/90 backdrop-blur-md">
        <div className="page-x mx-auto flex h-16 max-w-7xl items-center gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo variant="icon" iconClassName="h-9" />
            <span className="font-heading text-lg font-bold text-grape-700">Admin</span>
          </Link>
          <Link href="/browse" className="ml-auto inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Voltar ao app
          </Link>
        </div>
      </header>
      <main className="page-x mx-auto max-w-7xl space-y-8 py-8 md:py-10">
        <AdminNav />
        {isDemoMode && (
          <p className="rounded-2xl border border-sun-400/40 bg-sun-100 px-4 py-3 text-sm text-grape-900">
            <strong>Modo demonstração:</strong> pode navegar e abrir todos os formulários, mas salvar e enviar arquivos só
            funciona com o Supabase configurado.
          </p>
        )}
        {children}
      </main>
    </div>
  )
}
