import type { Metadata } from "next"
import { Palette } from "lucide-react"
import { CategoryChips } from "@/components/content/category-chips"
import { ContentCard } from "@/components/content/content-card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer, PageHeader } from "@/components/shared/page-header"
import { coloringCategories, listColoring } from "@/services/coloring"
import { requireActiveProfile } from "@/services/profiles"

export const metadata: Metadata = { title: "Para colorir" }

export default async function ColoringPage({ searchParams }: PageProps<"/colorir">) {
  const { profile } = await requireActiveProfile()
  const { cat } = await searchParams
  const materials = await listColoring(profile)
  const active = typeof cat === "string" ? cat : undefined
  const filtered = active ? materials.filter((m) => m.category === active) : materials
  const categories = coloringCategories.filter((c) => materials.some((m) => m.category === c.slug))

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Atividades"
        title="Para colorir"
        description="Desenhos bíblicos e atividades para baixar, imprimir e pintar em família."
      />
      <CategoryChips basePath="/colorir" categories={categories} active={active} />
      {filtered.length ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-7 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((m) => (
            <ContentCard key={m.content.id} content={m.content} subtitle={`${m.ageMin} a ${m.ageMax} anos`} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Palette} title="Nenhum desenho nesta categoria" description="Escolha outra categoria para ver mais atividades." />
      )}
    </PageContainer>
  )
}
