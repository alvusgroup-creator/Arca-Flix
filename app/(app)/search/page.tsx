import type { Metadata } from "next"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { PageContainer } from "@/components/shared/page-header"
import { GridSkeleton } from "@/components/shared/loading-skeleton"
import { SearchBar } from "@/features/search/components/search-bar"
import { SearchResults } from "@/features/search/components/search-results"
import { listCategories, searchCatalog } from "@/services/content"
import { requireActiveProfile } from "@/services/profiles"

export const metadata: Metadata = { title: "Buscar" }

const areas = [
  { href: "/series", label: "Séries", image: "/demo/noah-hero.jpg" },
  { href: "/movies", label: "Filmes", image: "/demo/daniel-lions.jpg" },
  { href: "/music", label: "Músicas", image: "/demo/louvor-kids.jpg" },
  { href: "/colorir", label: "Para colorir", image: "/demo/coloring.jpg" },
  { href: "/estudos", label: "Estudos", image: "/demo/bible-stories.jpg" },
]

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  await requireActiveProfile()
  const { q } = await searchParams
  const query = typeof q === "string" ? q.trim() : ""

  return (
    <PageContainer className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold md:text-4xl">{query ? "Buscar" : "Explorar"}</h1>
        <Suspense>
          <SearchBar className="md:max-w-xl" autoFocus={!query} />
        </Suspense>
      </div>

      {query.length >= 2 ? (
        <Suspense key={query} fallback={<GridSkeleton count={6} />}>
          <Results query={query} />
        </Suspense>
      ) : (
        <Explore />
      )}
    </PageContainer>
  )
}

async function Results({ query }: { query: string }) {
  const { profile } = await requireActiveProfile()
  const results = await searchCatalog(query, profile)
  return <SearchResults query={query} results={results} />
}

async function Explore() {
  const categories = await listCategories()
  return (
    <div className="space-y-10">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {areas.map((a) => (
          <li key={a.href}>
            <Link href={a.href} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-grape-600/10">
              <Image src={a.image} alt="" fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-linear-to-t from-grape-800/85 via-grape-800/10 to-transparent" />
              <span className="absolute bottom-3 left-4 font-heading text-lg font-bold text-white">{a.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      {categories.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Temas</h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/search?q=${encodeURIComponent(c.name)}`}
                  className="inline-flex h-10 items-center rounded-full border border-grape-600/10 bg-grape-600/5 px-4 text-sm font-medium transition-colors hover:border-lilac-400/40 hover:text-lilac-400"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
