"use client"

import { useActionState, useState } from "react"
import { contentTypeLabel } from "@/utils/content"
import { AGE_RATINGS, ageRatingLabel } from "@/utils/age-rating"
import type { Category, ContentType } from "@/types"
import type { AdminContent } from "@/services/admin-content"
import { saveContent } from "../actions"
import { slugify } from "../schemas"
import { AdminCard, Field, SubmitButton, Toggle, inputClass, textareaClass, useActionToast } from "./form-kit"
import { UploadField } from "./upload-field"

export function ContentForm({
  type,
  content,
  categories,
}: {
  type: ContentType
  content?: AdminContent
  categories: Category[]
}) {
  const [state, action] = useActionState(saveContent, null)
  useActionToast(state)
  const [slug, setSlug] = useState(content?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(content))
  const selected = new Set(content?.categories.map((c) => c.id))

  return (
    <form action={action} className="space-y-6">
      {content && <input type="hidden" name="id" value={content.id} />}
      <input type="hidden" name="type" value={type} />

      <AdminCard title="Informações" description={`Tipo: ${contentTypeLabel[type]}`}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              defaultValue={content?.title}
              onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Slug (endereço)" htmlFor="slug" hint="Ex.: a-arca-de-noe — aparece na URL.">
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Descrição" htmlFor="description" className="md:col-span-2">
            <textarea id="description" name="description" defaultValue={content?.description} className={textareaClass} />
          </Field>
          <Field label="Descrição curta" htmlFor="shortDescription" hint="Usada em cartões e resultados de busca." className="md:col-span-2">
            <input id="shortDescription" name="shortDescription" maxLength={300} defaultValue={content?.shortDescription} className={inputClass} />
          </Field>
          <Field label="Classificação" htmlFor="ageRating">
            <select id="ageRating" name="ageRating" defaultValue={content?.ageRating ?? "L"} className={inputClass}>
              {AGE_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {ageRatingLabel[r]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ano" htmlFor="releaseYear">
            <input id="releaseYear" name="releaseYear" type="number" min={1900} max={2100} defaultValue={content?.releaseYear ?? ""} className={inputClass} />
          </Field>
          <Field label="Gêneros" htmlFor="genres" hint="Separados por vírgula: Aventura, Família" className="md:col-span-2">
            <input id="genres" name="genres" defaultValue={content?.genres.join(", ")} className={inputClass} />
          </Field>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-semibold text-grape-900">Categorias</legend>
          {categories.length ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-full border border-input bg-white px-3 py-1.5 text-sm has-checked:border-grape-500 has-checked:bg-lilac-100">
                  <input type="checkbox" name="categoryIds" value={c.id} defaultChecked={selected.has(c.id)} className="accent-grape-600" />
                  {c.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Crie categorias em Admin › Categorias.</p>
          )}
        </fieldset>
      </AdminCard>

      <AdminCard title="Imagens" description="Thumbnail 16:9 (cartões), banner 16:9 grande (destaques) e capa 2:3 opcional.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Thumbnail" htmlFor="thumbnailUrl">
            <UploadField id="thumbnailUrl" name="thumbnailUrl" bucket="images" accept="image/*" defaultValue={content?.thumbnailUrl} preview />
          </Field>
          <Field label="Banner" htmlFor="bannerUrl" hint="Vazio = usa a thumbnail.">
            <UploadField id="bannerUrl" name="bannerUrl" bucket="images" accept="image/*" defaultValue={content?.bannerUrl} preview />
          </Field>
          <Field label="Capa vertical" htmlFor="posterUrl">
            <UploadField id="posterUrl" name="posterUrl" bucket="images" accept="image/*" defaultValue={content?.posterUrl} preview />
          </Field>
        </div>
      </AdminCard>

      {(type === "movie" || type === "series") && (
        <AdminCard title="Vídeo" description="IDs (GUID) da biblioteca do Bunny Stream.">
          <div className="grid gap-4 md:grid-cols-3">
            {type === "movie" && (
              <>
                <Field label="ID do vídeo do filme" htmlFor="videoId">
                  <input id="videoId" name="videoId" defaultValue={content?.videoId ?? ""} className={inputClass} />
                </Field>
                <Field label="Duração (segundos)" htmlFor="durationSeconds">
                  <input id="durationSeconds" name="durationSeconds" type="number" min={0} defaultValue={content?.durationSeconds ?? ""} className={inputClass} />
                </Field>
              </>
            )}
            <Field label="ID do trailer" htmlFor="trailerVideoId">
              <input id="trailerVideoId" name="trailerVideoId" defaultValue={content?.trailerVideoId ?? ""} className={inputClass} />
            </Field>
          </div>
        </AdminCard>
      )}

      <AdminCard title="Publicação">
        <div className="flex flex-wrap gap-3">
          <Toggle name="published" label="Publicado (visível no catálogo)" defaultChecked={content?.published ?? false} />
          <Toggle name="featured" label="Destaque no banner da Home" defaultChecked={content?.featured ?? false} />
        </div>
      </AdminCard>

      <div className="flex justify-end">
        <SubmitButton className="h-12 px-8">{content ? "Salvar alterações" : "Criar conteúdo"}</SubmitButton>
      </div>
    </form>
  )
}
