import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock } from "lucide-react"
import { PageContainer } from "@/components/shared/page-header"
import { MyListButton } from "@/features/favorites/components/my-list-button"
import { ReadingProgress } from "@/features/studies/components/reading-progress"
import { StudyBody } from "@/features/studies/components/study-body"
import { filterForProfile, getContentBySlug } from "@/services/content"
import { getFavoriteIds } from "@/services/favorites"
import { requireActiveProfile } from "@/services/profiles"
import { getStudy, getStudyProgress, studyKindLabel } from "@/services/studies"

export async function generateMetadata({ params }: PageProps<"/estudos/[slug]">): Promise<Metadata> {
  const { slug } = await params
  return { title: (await getContentBySlug(slug))?.title ?? "Estudo" }
}

export default async function StudyPage({ params }: PageProps<"/estudos/[slug]">) {
  const { profile } = await requireActiveProfile()
  const { slug } = await params
  const study = await getStudy(slug)
  if (!study || !filterForProfile([study.content], profile).length) notFound()
  const [progress, savedIds] = await Promise.all([getStudyProgress(profile.id), getFavoriteIds(profile.id)])
  const { content } = study

  return (
    <>
      <ReadingProgress contentId={content.id} initial={progress[content.id] ?? 0} />
      <PageContainer>
        <article className="mx-auto max-w-2xl space-y-8">
          <Link href="/estudos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Estudos bíblicos
          </Link>
          <header className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-lilac-400 uppercase">
              {studyKindLabel[study.kind]}
              {study.bibleReference && <span className="text-foreground/60"> · {study.bibleReference}</span>}
            </p>
            <h1 className="text-4xl leading-tight font-bold md:text-5xl">{content.title}</h1>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" aria-hidden="true" /> {study.readingMinutes} min de leitura
              </span>
              <MyListButton contentId={content.id} saved={savedIds.includes(content.id)} variant="icon" className="ml-auto" />
            </div>
          </header>
          <div className="relative aspect-video overflow-hidden rounded-3xl">
            <Image src={content.bannerUrl} alt="" fill preload sizes="(min-width: 768px) 672px, 100vw" className="object-cover" />
          </div>
          <StudyBody body={study.body} />
        </article>
      </PageContainer>
    </>
  )
}
