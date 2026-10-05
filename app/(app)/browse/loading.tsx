import { CarouselSkeleton, HeroSkeleton } from "@/components/shared/loading-skeleton"

export default function Loading() {
  return (
    <div className="space-y-10 pb-16" aria-busy="true" aria-label="Carregando">
      <HeroSkeleton />
      <CarouselSkeleton />
      <CarouselSkeleton poster />
    </div>
  )
}
