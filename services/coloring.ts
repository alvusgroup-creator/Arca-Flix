import "server-only"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { demoColoring } from "@/lib/demo/data"
import { getCatalog, getContentBySlug } from "@/services/content"
import type { ColoringCategory, ColoringMaterial, Content, ViewerProfile } from "@/types"

export const coloringCategories: { slug: ColoringCategory; name: string }[] = [
  { slug: "arca-de-noe", name: "Arca de Noé" },
  { slug: "jesus", name: "Jesus" },
  { slug: "daniel", name: "Daniel" },
  { slug: "moises", name: "Moisés" },
  { slug: "animais", name: "Animais da Bíblia" },
  { slug: "versiculos", name: "Versículos" },
  { slug: "atividades", name: "Atividades" },
]

interface ColoringRowDb {
  content_id: string
  category: ColoringCategory
  age_min: number
  age_max: number
  image_url: string
  pdf_url: string | null
}

const COLUMNS = "content_id, category, age_min, age_max, image_url, pdf_url"

function mapMaterial(content: Content, row: ColoringRowDb): ColoringMaterial {
  return {
    content,
    category: row.category,
    ageMin: row.age_min,
    ageMax: row.age_max,
    imageUrl: row.image_url,
    pdfUrl: row.pdf_url,
  }
}

export async function listColoring(profile: ViewerProfile | null): Promise<ColoringMaterial[]> {
  const items = await getCatalog(profile, "coloring")
  if (isDemoMode) return demoColoring.filter((m) => items.some((c) => c.id === m.content.id))
  if (!items.length) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("coloring_materials")
    .select(COLUMNS)
    .in("content_id", items.map((c) => c.id))
  return ((data ?? []) as ColoringRowDb[]).flatMap((row) => {
    const content = items.find((c) => c.id === row.content_id)
    return content ? [mapMaterial(content, row)] : []
  })
}

export async function getColoringMaterial(slug: string): Promise<ColoringMaterial | null> {
  if (isDemoMode) return demoColoring.find((m) => m.content.slug === slug) ?? null

  const content = await getContentBySlug(slug)
  if (!content || content.type !== "coloring") return null
  const supabase = await createClient()
  const { data } = await supabase
    .from("coloring_materials")
    .select(COLUMNS)
    .eq("content_id", content.id)
    .maybeSingle()
  return data ? mapMaterial(content, data as ColoringRowDb) : null
}
