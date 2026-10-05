import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { listAdminContent } from "@/services/admin-content"
import { contentTypeLabel } from "@/utils/content"
import type { ContentType } from "@/types"
import { Clapperboard } from "lucide-react"

export const metadata: Metadata = { title: "Conteúdos" }

const TYPES: ContentType[] = ["series", "movie", "music", "coloring", "study"]

export default async function AdminContentPage({ searchParams }: PageProps<"/admin/content">) {
  const { type, q } = await searchParams
  const activeType = TYPES.find((t) => t === type)
  const query = typeof q === "string" ? q.trim().toLowerCase() : ""
  const items = (await listAdminContent(activeType)).filter(
    (c) => !query || c.title.toLowerCase().includes(query) || c.slug.includes(query)
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conteúdos"
        description="Séries, filmes, músicas, materiais para colorir e estudos."
        actions={TYPES.map((t) => (
          <Link key={t} href={`/admin/content/new?type=${t}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
            <Plus /> {contentTypeLabel[t]}
          </Link>
        ))}
      />

      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
          {[undefined, ...TYPES].map((t) => (
            <Link
              key={t ?? "all"}
              href={t ? `/admin/content?type=${t}` : "/admin/content"}
              aria-current={activeType === t ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium",
                activeType === t ? "border-grape-500 bg-grape-600 text-white" : "border-input bg-white hover:bg-lilac-100"
              )}
            >
              {t ? contentTypeLabel[t] : "Todos"}
            </Link>
          ))}
        </nav>
        <form className="ml-auto">
          {activeType && <input type="hidden" name="type" value={activeType} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por título…"
            aria-label="Buscar conteúdo"
            className="h-10 w-60 rounded-full border border-input bg-white px-4 text-sm outline-none focus:border-grape-500"
          />
        </form>
      </div>

      {items.length ? (
        <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Tipo</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="hidden px-4 py-3 text-right font-semibold md:table-cell">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-input">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-surface-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/content/${c.id}`} className="flex items-center gap-3 font-semibold hover:text-grape-600">
                      <span className="relative hidden aspect-video w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:block">
                        {c.thumbnailUrl && <Image src={c.thumbnailUrl} alt="" fill sizes="80px" className="object-cover" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate">{c.title}</span>
                        <span className="block truncate text-xs font-normal text-muted-foreground">/{c.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{contentTypeLabel[c.type]}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", c.published ? "bg-emerald-100 text-emerald-700" : "bg-surface-3 text-grape-700")}>
                      {c.published ? "Publicado" : "Rascunho"}
                    </span>
                    {c.featured && <span className="ml-1.5 rounded-full bg-sun-100 px-2.5 py-1 text-xs font-semibold text-orange-700">Destaque</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">{c.viewCount.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Clapperboard} title="Nenhum conteúdo encontrado" description="Crie o primeiro com os botões acima." />
      )}
    </div>
  )
}
