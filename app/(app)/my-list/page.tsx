import type { Metadata } from "next"
import Link from "next/link"
import { Bookmark } from "lucide-react"
import { ContentCard } from "@/components/content/content-card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer, PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getMyList } from "@/services/favorites"
import { requireActiveProfile } from "@/services/profiles"
import { contentTypeLabel } from "@/utils/content"

export const metadata: Metadata = { title: "Minha Lista" }

export default async function MyListPage() {
  const { profile } = await requireActiveProfile()
  const items = await getMyList(profile)

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Minha Lista"
        description={`Os favoritos de ${profile.name}: séries, músicas, desenhos e estudos guardados para depois.`}
      />
      {items.length ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-7 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((c) => (
            <ContentCard key={c.id} content={c} subtitle={contentTypeLabel[c.type]} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="A sua lista está vazia"
          description="Toque em “Minha lista” em qualquer título para guardá-lo aqui."
          action={
            <Link href="/browse" className={buttonVariants()}>
              Explorar o catálogo
            </Link>
          }
        />
      )}
    </PageContainer>
  )
}
