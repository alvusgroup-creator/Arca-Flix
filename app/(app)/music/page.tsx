import type { Metadata } from "next"
import { Music } from "lucide-react"
import { CatalogPage } from "@/components/content/catalog-page"
import { getCatalog } from "@/services/content"
import { requireActiveProfile } from "@/services/profiles"

export const metadata: Metadata = { title: "Músicas" }

export default async function MusicPage({ searchParams }: PageProps<"/music">) {
  const { profile } = await requireActiveProfile()
  const { cat } = await searchParams
  const items = await getCatalog(profile, "music")

  return (
    <CatalogPage
      eyebrow="Música"
      title="Músicas"
      description="Álbuns e playlists de louvor para cantar, dançar e descansar."
      basePath="/music"
      items={items}
      activeCategory={typeof cat === "string" ? cat : undefined}
      emptyIcon={Music}
      emptyTitle="Nenhuma música encontrada"
    />
  )
}
