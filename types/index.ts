// Tipos de domínio do Arca Flix. Independentes do banco: os services
// convertem linhas do Supabase (ou dados de demonstração) para estes formatos.

export type ContentType = "series" | "movie" | "music" | "coloring" | "study"

/** Classificação indicativa (padrão brasileiro). */
export type AgeRating = "L" | "10" | "12" | "14" | "16" | "18"

export interface Category {
  id: string
  slug: string
  name: string
}

export interface Content {
  id: string
  slug: string
  title: string
  type: ContentType
  description: string
  shortDescription: string
  thumbnailUrl: string
  bannerUrl: string
  posterUrl: string | null
  ageRating: AgeRating
  releaseYear: number | null
  featured: boolean
  genres: string[]
  categories: Category[]
  /** Séries */
  seasonsCount: number | null
  /** Filmes */
  durationSeconds: number | null
  videoId: string | null
  trailerVideoId: string | null
  createdAt: string
}

export interface Episode {
  id: string
  contentId: string
  seasonId: string
  seasonNumber: number
  number: number
  title: string
  description: string
  durationSeconds: number
  thumbnailUrl: string
  videoId: string | null
}

export interface Season {
  id: string
  contentId: string
  number: number
  title: string
  episodes: Episode[]
}

export interface ContentDetail extends Content {
  seasons: Season[]
}

export type ProfileKind = "kids" | "teen" | "adult"

export interface ViewerProfile {
  id: string
  userId: string
  name: string
  avatar: string
  kind: ProfileKind
  maxAgeRating: AgeRating
  hasPin: boolean
  blockedCategoryIds: string[]
  allowedCategoryIds: string[]
}

export interface Account {
  id: string
  email: string
  fullName: string
  role: "user" | "admin"
}

export type BillingInterval = "month" | "year"

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string
  /** Em centavos */
  priceCents: number
  currency: string
  billingInterval: BillingInterval
  maxProfiles: number
  maxDevices: number
  features: string[]
  stripePriceId: string | null
  highlighted: boolean
  active: boolean
}

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan | null
  status: SubscriptionStatus
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
}

export interface WatchProgress {
  contentId: string
  episodeId: string | null
  progressSeconds: number
  durationSeconds: number
  completed: boolean
  updatedAt: string
}

export interface ContinueWatchingItem {
  content: Content
  episode: Episode | null
  progress: WatchProgress
}

export interface ContentRow {
  id: string
  title: string
  items: Content[]
  variant?: "landscape" | "poster"
  href?: string
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  href: string | null
  read: boolean
  createdAt: string
}

export interface Device {
  id: string
  name: string
  lastSeenAt: string
  current: boolean
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  audioUrl: string | null
  coverUrl: string
  durationSeconds: number
  trackNumber: number
}

export interface MusicCollection {
  content: Content
  kind: "album" | "playlist"
  artist: string
  tracks: MusicTrack[]
}

export type ColoringCategory =
  | "arca-de-noe"
  | "jesus"
  | "daniel"
  | "moises"
  | "animais"
  | "versiculos"
  | "atividades"

export interface ColoringMaterial {
  content: Content
  category: ColoringCategory
  ageMin: number
  ageMax: number
  imageUrl: string
  pdfUrl: string | null
}

export type StudyKind = "devocional" | "historia" | "estudo" | "atividade" | "versiculo"

export interface Study {
  content: Content
  kind: StudyKind
  body: string
  readingMinutes: number
  bibleReference: string | null
}
