import type {
  AgeRating,
  Category,
  Content,
  Episode,
  Season,
  SubscriptionPlan,
  ViewerProfile,
} from "@/types"

// Linhas do banco (snake_case) → tipos de domínio (camelCase).

export const CONTENT_SELECT =
  "*, content_categories(categories(id, slug, name)), series(seasons(count))"

type One<T> = T | T[] | null | undefined
const one = <T,>(v: One<T>): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))

export interface ContentRowDb {
  id: string
  slug: string
  title: string
  type: Content["type"]
  description: string
  short_description: string
  thumbnail_url: string
  banner_url: string
  poster_url: string | null
  age_rating: AgeRating
  genres: string[] | null
  release_date: string | null
  featured: boolean
  video_id: string | null
  duration_seconds: number | null
  trailer_video_id: string | null
  created_at: string
  content_categories?: { categories: One<Category> }[]
  series?: One<{ seasons: { count: number }[] }>
}

export function mapContent(row: ContentRowDb): Content {
  const series = one(row.series)
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    description: row.description,
    shortDescription: row.short_description || row.description,
    thumbnailUrl: row.thumbnail_url,
    bannerUrl: row.banner_url || row.thumbnail_url,
    posterUrl: row.poster_url,
    ageRating: row.age_rating,
    // Lê o ano direto da string (new Date() aplicaria o fuso e "voltaria" para o ano anterior)
    releaseYear: row.release_date ? Number(row.release_date.slice(0, 4)) : null,
    featured: row.featured,
    genres: row.genres ?? [],
    categories: (row.content_categories ?? [])
      .map((cc) => one(cc.categories))
      .filter((c): c is Category => Boolean(c)),
    seasonsCount: series ? (series.seasons?.[0]?.count ?? 0) : null,
    durationSeconds: row.duration_seconds,
    videoId: row.video_id,
    trailerVideoId: row.trailer_video_id,
    createdAt: row.created_at,
  }
}

export interface SeasonRowDb {
  id: string
  series_id: string
  number: number
  title: string
  episodes: EpisodeRowDb[]
}

export interface EpisodeRowDb {
  id: string
  season_id: string
  number: number
  title: string
  description: string
  thumbnail_url: string
  video_id: string | null
  duration_seconds: number
  seasons?: One<{ number: number; series_id: string }>
}

export function mapEpisode(row: EpisodeRowDb, contentId: string, seasonNumber: number, fallbackThumb = ""): Episode {
  return {
    id: row.id,
    contentId,
    seasonId: row.season_id,
    seasonNumber,
    number: row.number,
    title: row.title,
    description: row.description,
    durationSeconds: row.duration_seconds,
    thumbnailUrl: row.thumbnail_url || fallbackThumb,
    videoId: row.video_id,
  }
}

export function mapSeason(row: SeasonRowDb, fallbackThumb: string): Season {
  return {
    id: row.id,
    contentId: row.series_id,
    number: row.number,
    title: row.title || `Temporada ${row.number}`,
    episodes: [...(row.episodes ?? [])]
      .sort((a, b) => a.number - b.number)
      .map((e) => mapEpisode(e, row.series_id, row.number, fallbackThumb)),
  }
}

export interface UserProfileRowDb {
  id: string
  user_id: string
  name: string
  avatar: string
  kind: ViewerProfile["kind"]
  max_age_rating: AgeRating
  pin_hash: string | null
  allowed_category_ids: string[] | null
  blocked_category_ids: string[] | null
}

export function mapProfile(row: UserProfileRowDb): ViewerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    avatar: row.avatar,
    kind: row.kind,
    maxAgeRating: row.max_age_rating,
    hasPin: Boolean(row.pin_hash),
    allowedCategoryIds: row.allowed_category_ids ?? [],
    blockedCategoryIds: row.blocked_category_ids ?? [],
  }
}

export interface PlanRowDb {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  billing_interval: SubscriptionPlan["billingInterval"]
  max_profiles: number
  max_devices: number
  features: string[] | null
  stripe_price_id: string | null
  highlighted: boolean
  active: boolean
}

export function mapPlan(row: PlanRowDb): SubscriptionPlan {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.price,
    currency: row.currency,
    billingInterval: row.billing_interval,
    maxProfiles: row.max_profiles,
    maxDevices: row.max_devices,
    features: row.features ?? [],
    stripePriceId: row.stripe_price_id,
    highlighted: row.highlighted,
    active: row.active,
  }
}
