import { cn } from "@/lib/utils"

export function SkeletonBlock({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton-shimmer rounded-xl", className)} />
}

export function CarouselSkeleton({ poster = false }: { poster?: boolean }) {
  return (
    <div className="page-x space-y-3">
      <SkeletonBlock className="h-6 w-48" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock
            key={i}
            className={cn("shrink-0", poster ? "aspect-[2/3] w-36 md:w-44" : "aspect-video w-64 md:w-72")}
          />
        ))}
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[70svh] min-h-[420px] w-full">
      <SkeletonBlock className="absolute inset-0 rounded-none" />
      <div className="page-x absolute bottom-16 space-y-4">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-12 w-80 max-w-[80vw]" />
        <SkeletonBlock className="h-4 w-96 max-w-[80vw]" />
        <div className="flex gap-3">
          <SkeletonBlock className="h-12 w-40" />
          <SkeletonBlock className="h-12 w-36" />
        </div>
      </div>
    </div>
  )
}

export function GridSkeleton({ count = 12, poster = false }: { count?: number; poster?: boolean }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        poster
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className={poster ? "aspect-[2/3]" : "aspect-video"} />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="page-x space-y-8 pt-8 pb-12">
      <SkeletonBlock className="h-9 w-56" />
      <GridSkeleton />
    </div>
  )
}
