import { z } from "zod"

// Validação dos formulários do admin (FormData → objetos tipados).

const text = (max = 500) => z.string().trim().max(max)
const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null)
const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined(), z.null()])
  .transform((v) => v === "on" || v === "true")
const int = (min = 0, max = 1_000_000) => z.coerce.number().int().min(min).max(max)
const optionalInt = (min = 0, max = 1_000_000) =>
  z
    .union([z.literal(""), z.coerce.number().int().min(min).max(max)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v))

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Slug muito curto.")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens.")

export const contentSchema = z.object({
  id: optionalText(64),
  title: text(160).min(2, "Informe o título."),
  slug: slugSchema,
  type: z.enum(["series", "movie", "music", "coloring", "study"]),
  description: text(4000),
  shortDescription: text(300),
  ageRating: z.enum(["L", "10", "12", "14", "16", "18"]),
  releaseYear: optionalInt(1900, 2100),
  genres: text(300).transform((v) => v.split(",").map((g) => g.trim()).filter(Boolean)),
  categoryIds: z.array(z.string()).default([]),
  thumbnailUrl: text(1000).min(1, "Envie ou informe a thumbnail."),
  bannerUrl: text(1000),
  posterUrl: optionalText(1000),
  videoId: optionalText(120),
  trailerVideoId: optionalText(120),
  durationSeconds: optionalInt(0, 60 * 60 * 12),
  published: checkbox,
  featured: checkbox,
})

export const seasonSchema = z.object({
  contentId: z.string().min(1),
  number: int(1, 999),
  title: text(120),
})

export const episodeSchema = z.object({
  id: optionalText(64),
  seasonId: z.string().min(1),
  number: int(1, 9999),
  title: text(160).min(1, "Informe o título do episódio."),
  description: text(2000),
  thumbnailUrl: text(1000),
  videoId: optionalText(120),
  durationSeconds: int(0, 60 * 60 * 12),
})

export const musicMetaSchema = z.object({
  contentId: z.string().min(1),
  kind: z.enum(["album", "playlist"]),
  artist: text(120),
})

export const trackSchema = z.object({
  id: optionalText(64),
  contentId: z.string().min(1),
  title: text(160).min(1, "Informe o título da música."),
  audioUrl: text(1000).min(1, "Envie o arquivo de áudio."),
  coverUrl: optionalText(1000),
  durationSeconds: int(0, 60 * 60 * 3),
  trackNumber: int(1, 999),
})

export const coloringSchema = z.object({
  contentId: z.string().min(1),
  category: z.enum(["arca-de-noe", "jesus", "daniel", "moises", "animais", "versiculos", "atividades"]),
  ageMin: int(1, 18),
  ageMax: int(1, 18),
  imageUrl: text(1000).min(1, "Envie a imagem em alta resolução."),
  pdfUrl: optionalText(1000),
})

export const studySchema = z.object({
  contentId: z.string().min(1),
  kind: z.enum(["devocional", "historia", "estudo", "atividade", "versiculo"]),
  readingMinutes: int(1, 240),
  bibleReference: optionalText(120),
  body: text(50_000),
})

export const planSchema = z.object({
  id: optionalText(64),
  name: text(80).min(2, "Informe o nome do plano."),
  slug: slugSchema,
  description: text(300),
  priceCents: z
    .string()
    .trim()
    .transform((v) => Math.round(Number(v.replace(/\./g, "").replace(",", ".")) * 100))
    .pipe(z.number().int().min(0, "Preço inválido.")),
  billingInterval: z.enum(["month", "year"]),
  maxProfiles: int(1, 20),
  maxDevices: int(1, 20),
  features: text(3000).transform((v) => v.split("\n").map((f) => f.trim()).filter(Boolean)),
  stripePriceId: optionalText(120),
  highlighted: checkbox,
  active: checkbox,
  sortOrder: int(0, 999),
})

export const categorySchema = z.object({
  name: text(60).min(2, "Informe o nome."),
  slug: slugSchema,
})

export type FormState = { error?: string; success?: string; id?: string } | null

/** FormData → objeto simples (campos repetidos viram arrays). */
export function formToObject(fd: FormData, arrays: string[] = []) {
  const out: Record<string, unknown> = {}
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$")) continue
    const values = fd.getAll(key).map((v) => (typeof v === "string" ? v : ""))
    out[key] = arrays.includes(key) ? values : values[0]
  }
  for (const key of arrays) out[key] ??= []
  return out
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
}
