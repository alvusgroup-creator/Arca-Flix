// Importa os materiais para colorir (PNG + PDF gerados) e os estudos de scripts/studies-catalog.mts.
//   npm run db:materials -- <pasta-gerada>
// A pasta precisa de manifest.json, <slug>.png, <slug>.pdf e covers/<slug-do-estudo>.jpg.
// Prévia (bucket público "images"); arquivo para pintar/baixar (bucket privado "coloring").
import { readFile } from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"
import { studies } from "./studies-catalog.mts"

const dir = process.argv[2]
if (!dir) throw new Error("Informe a pasta com os arquivos gerados")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local")
const db = createClient(url, key, { auth: { persistSession: false } })

interface ColoringSeed {
  slug: string
  title: string
  category: string
  age: [number, number]
  description: string
}

/** Materiais de exemplo (fotos coloridas, sem desenho de traço): saem do catálogo. */
const HIDE_PLACEHOLDERS = [
  "arca-de-noe-para-colorir",
  "jesus-e-as-criancas",
  "daniel-e-os-leoes",
  "o-senhor-e-meu-pastor",
  "labirinto-de-moises",
]

const VERSION = Date.now().toString(36)

async function upload(bucket: string, file: string, dest: string, contentType: string) {
  const { error } = await db.storage.from(bucket).upload(dest, await readFile(path.join(dir, file)), { contentType, upsert: true })
  if (error) throw new Error(`${bucket}/${dest}: ${error.message}`)
  // "?v=" evita que o CDN e o next/image mostrem a versão antiga depois de reenviar.
  return bucket === "images" ? `${db.storage.from(bucket).getPublicUrl(dest).data.publicUrl}?v=${VERSION}` : dest
}

const { data: cats, error: catErr } = await db.from("categories").select("id, slug")
if (catErr) throw catErr
const catId = new Map(cats.map((c) => [c.slug, c.id]))

async function upsertContent(row: Record<string, unknown>, categories: string[]) {
  const { data, error } = await db.from("content").upsert(row, { onConflict: "slug" }).select("id").single()
  if (error) throw error
  await db.from("content_categories").delete().eq("content_id", data.id)
  const links = categories.filter((s) => catId.has(s)).map((s) => ({ content_id: data.id, category_id: catId.get(s) }))
  if (links.length) await db.from("content_categories").insert(links)
  return data.id as string
}

// O catálogo ordena por mais recente: o primeiro da lista fica no topo.
const base = Date.now()

// ---------------------------------------------------------------- Colorir
const coloring: ColoringSeed[] = JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8"))
for (const [index, item] of coloring.entries()) {
  const preview = await upload("images", `${item.slug}.png`, `coloring/${item.slug}.png`, "image/png")
  const image = await upload("coloring", `${item.slug}.png`, `${item.slug}.png`, "image/png")
  const pdf = await upload("coloring", `${item.slug}.pdf`, `${item.slug}.pdf`, "application/pdf")

  const id = await upsertContent(
    {
      slug: item.slug,
      title: item.title,
      description: item.description,
      short_description: item.description,
      type: "coloring",
      thumbnail_url: preview,
      banner_url: preview,
      age_rating: "L",
      genres: [],
      published: true,
      created_at: new Date(base - index * 60_000).toISOString(),
    },
    [item.category]
  )
  const { error } = await db.from("coloring_materials").upsert({
    content_id: id,
    category: item.category,
    age_min: item.age[0],
    age_max: item.age[1],
    image_url: image,
    pdf_url: pdf,
  })
  if (error) throw error
  console.log(`✓ colorir: ${item.title}`)
}
await db.from("content").update({ published: false }).in("slug", HIDE_PLACEHOLDERS)

// ---------------------------------------------------------------- Estudos
for (const [index, study] of studies.entries()) {
  const cover = await upload("images", `covers/${study.slug}.jpg`, `studies/${study.slug}.jpg`, "image/jpeg")
  const id = await upsertContent(
    {
      slug: study.slug,
      title: study.title,
      description: study.short,
      short_description: study.short,
      type: "study",
      thumbnail_url: cover,
      banner_url: cover,
      age_rating: "L",
      genres: [],
      published: true,
      created_at: new Date(base - index * 60_000).toISOString(),
    },
    study.categories
  )
  const { error } = await db.from("studies").upsert({
    content_id: id,
    kind: study.kind,
    body: study.body,
    reading_minutes: study.minutes,
    bible_reference: study.reference,
  })
  if (error) throw error
  console.log(`✓ estudo: ${study.title}`)
}

console.log(`\n${coloring.length} materiais para colorir e ${studies.length} estudos importados.`)
