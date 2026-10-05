import type { Metadata } from "next"
import { Clapperboard } from "lucide-react"
import { CatalogPage } from "@/components/content/catalog-page"
import { getCatalog } from "@/services/content"
import { requireActiveProfile } from "@/services/profiles"

export const metadata: Metadata = { title: "Séries" }

export default async function SeriesPage({ searchParams }: PageProps<"/series">) {
  const { profile } = await requireActiveProfile()
  const { cat } = await searchParams
  const items = await getCatalog(profile, "series")

  return (
    <CatalogPage
      eyebrow="Catálogo"
      title="Séries"
      description="Histórias bíblicas em episódios para acompanhar em família."
      basePath="/series"
      items={items}
      activeCategory={typeof cat === "string" ? cat : undefined}
      emptyIcon={Clapperboard}
      emptyTitle="Nenhuma série encontrada"
    />
  )
}
