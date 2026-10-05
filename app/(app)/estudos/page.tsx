import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Clock } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer, PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { requireActiveProfile } from "@/services/profiles"
import { getStudyProgress, listStudies, studyKindLabel } from "@/services/studies"
import type { StudyKind } from "@/types"

export const metadata: Metadata = { title: "Estudos bíblicos" }

const KINDS = Object.keys(studyKindLabel) as StudyKind[]

export default async function StudiesPage({ searchParams }: PageProps<"/estudos">) {
  const { profile } = await requireActiveProfile()
  const [studies, progress, { tipo }] = await Promise.all([listStudies(profile), getStudyProgress(profile.id), searchParams])
  const active = KINDS.find((k) => k === tipo)
  const filtered = active ? studies.filter((s) => s.kind === active) : studies
  const available = KINDS.filter((k) => studies.some((s) => s.kind === k))

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Para ler juntos"
        title="Estudos bíblicos"
        description="Devocionais, histórias e versículos curtos para conversar em família."
      />

      {available.length > 1 && (
        <nav aria-label="Tipo de estudo" className="scrollbar-none -mx-(--page-x) overflow-x-auto px-(--page-x)">
          <ul className="flex gap-2">
            {[undefined, ...available].map((k) => (
              <li key={k ?? "todos"}>
                <Link
                  href={k ? `/estudos?tipo=${k}` : "/estudos"}
                  aria-current={active === k ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                    active === k ? "border-grape-500 bg-grape-600 text-white" : "border-grape-600/10 bg-grape-600/5 text-foreground/70 hover:text-foreground"
                  )}
                >
                  {k ? studyKindLabel[k] : "Todos"}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {filtered.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => {
            const p = progress[s.content.id] ?? 0
            return (
              <li key={s.content.id}>
                <Link
                  href={`/estudos/${s.content.slug}`}
                  className="group block h-full overflow-hidden rounded-3xl border border-grape-600/[0.07] bg-surface-1 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-lilac-400/30"
                >
                  <div className="relative aspect-[16/8] overflow-hidden">
                    <Image src={s.content.thumbnailUrl} alt="" fill sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-grape-600 shadow-soft">
                      {studyKindLabel[s.kind]}
                    </span>
                  </div>
                  <div className="space-y-2 p-5">
                    <h2 className="text-lg font-semibold">{s.content.title}</h2>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{s.content.description}</p>
                    <p className="flex items-center gap-3 pt-1 text-xs text-foreground/55">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden="true" /> {s.readingMinutes} min
                      </span>
                      {s.bibleReference && <span>{s.bibleReference}</span>}
                      {p > 0 && <span className="ml-auto font-semibold text-lilac-400">{p >= 95 ? "Lido ✓" : `${p}% lido`}</span>}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState icon={BookOpen} title="Nenhum estudo por aqui" description="Novos devocionais e estudos chegam toda semana." />
      )}
    </PageContainer>
  )
}
