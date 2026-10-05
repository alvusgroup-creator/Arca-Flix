import Link from "next/link"
import { PublicHeader } from "@/components/layout/public-header"
import { getCurrentAccount } from "@/services/auth"

/** Moldura das páginas legais (públicas e indexáveis). */
export async function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt: string
  children: React.ReactNode
}) {
  const account = await getCurrentAccount()
  return (
    <div className="min-h-dvh">
      <PublicHeader signedIn={Boolean(account)} />
      <main className="page-x mx-auto max-w-3xl pt-6 pb-20">
        <div className="mb-8 rounded-2xl border border-sun-400/40 bg-sun-100 px-4 py-3 text-sm text-grape-900">
          <strong>Modelo para revisão jurídica.</strong> Os campos entre colchetes devem ser preenchidos com os dados da
          empresa antes da publicação.
        </div>
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {updatedAt}</p>
        <div className="legal mt-8 space-y-6 text-[1.02rem] leading-relaxed text-foreground/85 [&_h2]:pt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
          {children}
        </div>
        <nav className="mt-12 flex gap-6 text-sm text-muted-foreground">
          <Link href="/termos" className="hover:text-grape-600">Termos de Uso</Link>
          <Link href="/privacidade" className="hover:text-grape-600">Política de Privacidade</Link>
          <Link href="/" className="hover:text-grape-600">Início</Link>
        </nav>
      </main>
    </div>
  )
}
