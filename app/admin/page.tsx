import Link from "next/link"
import { BarChart3, Clapperboard, CreditCard, Eye, Users, Wallet } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { isDemoMode } from "@/lib/env"
import { getDashboardStats } from "@/services/admin"
import { listPublishedContent } from "@/services/content"
import { contentHref, contentTypeLabel } from "@/utils/content"
import { formatPrice } from "@/utils/format"

export default async function AdminDashboardPage() {
  const [stats, content] = await Promise.all([getDashboardStats(), listPublishedContent()])

  const cards = [
    { label: "Usuários", value: stats.totalUsers.toLocaleString("pt-BR"), icon: Users },
    { label: "Assinaturas ativas", value: stats.activeSubscriptions.toLocaleString("pt-BR"), icon: CreditCard },
    { label: "Conteúdos", value: stats.contentCount.toLocaleString("pt-BR"), icon: Clapperboard },
    { label: "Visualizações", value: stats.totalViews.toLocaleString("pt-BR"), icon: Eye },
    { label: "Receita mensal (MRR)", value: formatPrice(stats.monthlyRevenueCents), icon: Wallet },
  ]

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Painel"
        title="Visão geral"
        description={isDemoMode ? "Modo demonstração: os números refletem apenas a sua sessão local." : "Indicadores da plataforma em tempo real."}
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <li key={label} className="rounded-3xl border border-grape-600/[0.07] bg-surface-1 p-5">
            <Icon className="size-5 text-lilac-400" aria-hidden="true" />
            <p className="mt-4 font-heading text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-3xl border border-grape-600/[0.07] bg-surface-1 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="size-5 text-lilac-400" aria-hidden="true" /> Mais vistos
          </h2>
          {stats.topContent.length ? (
            <ol className="mt-4 space-y-3">
              {stats.topContent.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="grid size-7 place-items-center rounded-full bg-grape-600/25 font-bold text-lilac-400">{i + 1}</span>
                  <span className="flex-1 truncate">{c.title}</span>
                  <span className="text-muted-foreground tabular-nums">{c.views.toLocaleString("pt-BR")}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Ainda sem visualizações registradas.</p>
          )}
        </section>

        <section className="rounded-3xl border border-grape-600/[0.07] bg-surface-1 p-6">
          <h2 className="text-lg font-semibold">Catálogo publicado</h2>
          <div className="mt-4 max-h-96 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface-1 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 font-medium">Título</th>
                  <th className="py-2 font-medium">Tipo</th>
                  <th className="py-2 text-right font-medium">Classif.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grape-600/[0.05]">
                {content.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3">
                      <Link href={contentHref(c)} className="hover:text-lilac-400">
                        {c.title}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{contentTypeLabel[c.type]}</td>
                    <td className="py-2.5 text-right">{c.ageRating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
