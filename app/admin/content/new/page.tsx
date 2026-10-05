import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ContentForm } from "@/features/admin/components/content-form"
import { listAdminCategories } from "@/services/admin-content"
import { contentTypeLabel } from "@/utils/content"
import type { ContentType } from "@/types"

export const metadata: Metadata = { title: "Novo conteúdo" }

const TYPES: ContentType[] = ["series", "movie", "music", "coloring", "study"]

export default async function NewContentPage({ searchParams }: PageProps<"/admin/content/new">) {
  const { type } = await searchParams
  const contentType = TYPES.find((t) => t === type) ?? "series"
  const categories = await listAdminCategories()

  return (
    <div className="space-y-6">
      <Link href="/admin/content" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Conteúdos
      </Link>
      <PageHeader
        title={`Novo: ${contentTypeLabel[contentType]}`}
        description="Depois de criar, você poderá adicionar temporadas, músicas, arquivos ou o texto do estudo."
      />
      <ContentForm type={contentType} categories={categories} />
    </div>
  )
}
