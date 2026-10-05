import type { Metadata } from "next"
import { Film } from "lucide-react"
import { CatalogPage } from "@/components/content/catalog-page"
import { getCatalog } from "@/services/content"
import { requireActiveProfile } from "@/services/profiles"

export const metadata: Metadata = { title: "Filmes" }

export default async function MoviesPage({ searchParams }: PageProps<"/movies">) {
  const { profile } = await requireActiveProfile()
  const { cat } = await searchParams
  const items = await getCatalog(profile, "movie")

  return (
    <CatalogPage
      eyebrow="Catálogo"
      title="Filmes"
      description="Grandes histórias da Bíblia para a sessão de cinema em casa."
      basePath="/movies"
      items={items}
      activeCategory={typeof cat === "string" ? cat : undefined}
      variant="poster"
      emptyIcon={Film}
      emptyTitle="Nenhum filme encontrado"
    />
  )
}
