import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { ContentForm } from "@/features/admin/components/content-form"
import { DeleteContentButton, PublishToggle } from "@/features/admin/components/content-danger-zone"
import { ColoringForm, StudyForm } from "@/features/admin/components/extension-forms"
import { MusicManager } from "@/features/admin/components/music-manager"
import { SeasonsManager } from "@/features/admin/components/seasons-manager"
import { getAdminContent, listAdminCategories } from "@/services/admin-content"
import { contentHref, contentTypeLabel } from "@/utils/content"

export const metadata: Metadata = { title: "Editar conteúdo" }

export default async function EditContentPage({ params, searchParams }: PageProps<"/admin/content/[id]">) {
  const { id } = await params
  const { created } = await searchParams
  const [detail, categories] = await Promise.all([getAdminContent(id), listAdminCategories()])
  if (!detail) notFound()
  const { content } = detail

  return (
    <div className="space-y-6">
      <Link href="/admin/content" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Conteúdos
      </Link>
      <PageHeader
        eyebrow={`${contentTypeLabel[content.type]} · ${content.published ? "Publicado" : "Rascunho"}`}
        title={content.title}
        actions={
          <>
            {content.published && (
              <Link href={contentHref(content)} target="_blank" className={buttonVariants({ variant: "ghost" })}>
                <ExternalLink /> Ver no app
              </Link>
            )}
            <PublishToggle contentId={content.id} published={content.published} />
          </>
        }
      />
      {created && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Conteúdo criado como {content.published ? "publicado" : "rascunho"}. Complete as secções abaixo.
        </p>
      )}

      {content.type === "series" && <SeasonsManager contentId={content.id} seasons={detail.seasons} />}
      {content.type === "music" && <MusicManager contentId={content.id} music={detail.music} />}
      {content.type === "coloring" && <ColoringForm contentId={content.id} coloring={detail.coloring} />}
      {content.type === "study" && <StudyForm contentId={content.id} study={detail.study} />}

      <ContentForm type={content.type} content={content} categories={categories} />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-destructive/25 bg-white p-5">
        <div>
          <h2 className="font-semibold">Excluir conteúdo</h2>
          <p className="text-sm text-muted-foreground">Prefira despublicar se quiser apenas esconder do catálogo.</p>
        </div>
        <DeleteContentButton contentId={content.id} title={content.title} />
      </section>
    </div>
  )
}
