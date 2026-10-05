"use client"

import { useActionState } from "react"
import type { AdminContentDetail } from "@/services/admin-content"
import type { ColoringCategory, StudyKind } from "@/types"
import { saveColoring, saveStudy } from "../actions"
import { AdminCard, Field, SubmitButton, inputClass, textareaClass, useActionToast } from "./form-kit"
import { UploadField } from "./upload-field"

const COLORING_CATEGORIES: { value: ColoringCategory; label: string }[] = [
  { value: "arca-de-noe", label: "Arca de Noé" },
  { value: "jesus", label: "Jesus" },
  { value: "daniel", label: "Daniel" },
  { value: "moises", label: "Moisés" },
  { value: "animais", label: "Animais da Bíblia" },
  { value: "versiculos", label: "Versículos" },
  { value: "atividades", label: "Atividades" },
]

const STUDY_KINDS: { value: StudyKind; label: string }[] = [
  { value: "devocional", label: "Devocional" },
  { value: "historia", label: "História" },
  { value: "estudo", label: "Estudo" },
  { value: "atividade", label: "Atividade" },
  { value: "versiculo", label: "Versículo" },
]

export function ColoringForm({ contentId, coloring }: { contentId: string; coloring: AdminContentDetail["coloring"] }) {
  const [state, action] = useActionState(saveColoring, null)
  useActionToast(state)
  return (
    <AdminCard title="Material para colorir" description="A imagem em alta é usada para imprimir; o PDF (opcional) para baixar.">
      <form action={action} className="grid gap-4 md:grid-cols-4">
        <input type="hidden" name="contentId" value={contentId} />
        <Field label="Categoria" htmlFor="col-cat" className="md:col-span-2">
          <select id="col-cat" name="category" defaultValue={coloring?.category ?? "atividades"} className={inputClass}>
            {COLORING_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Idade mínima" htmlFor="col-min">
          <input id="col-min" name="ageMin" type="number" min={1} max={18} defaultValue={coloring?.ageMin ?? 3} className={inputClass} />
        </Field>
        <Field label="Idade máxima" htmlFor="col-max">
          <input id="col-max" name="ageMax" type="number" min={1} max={18} defaultValue={coloring?.ageMax ?? 10} className={inputClass} />
        </Field>
        <Field label="Imagem em alta resolução" htmlFor="col-img" className="md:col-span-4">
          <UploadField id="col-img" name="imageUrl" bucket="coloring" accept="image/*" defaultValue={coloring?.imageUrl} />
        </Field>
        <Field label="PDF (opcional)" htmlFor="col-pdf" className="md:col-span-4">
          <UploadField id="col-pdf" name="pdfUrl" bucket="coloring" accept="application/pdf" defaultValue={coloring?.pdfUrl} />
        </Field>
        <div className="flex justify-end md:col-span-4">
          <SubmitButton>Salvar material</SubmitButton>
        </div>
      </form>
    </AdminCard>
  )
}

export function StudyForm({ contentId, study }: { contentId: string; study: AdminContentDetail["study"] }) {
  const [state, action] = useActionState(saveStudy, null)
  useActionToast(state)
  return (
    <AdminCard
      title="Texto do estudo"
      description="Formatação: “## ” para subtítulo, “> ” para citação, “- ” ou “1. ” para listas. Linha em branco separa parágrafos."
    >
      <form action={action} className="grid gap-4 md:grid-cols-3">
        <input type="hidden" name="contentId" value={contentId} />
        <Field label="Tipo" htmlFor="st-kind">
          <select id="st-kind" name="kind" defaultValue={study?.kind ?? "estudo"} className={inputClass}>
            {STUDY_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Minutos de leitura" htmlFor="st-min">
          <input id="st-min" name="readingMinutes" type="number" min={1} defaultValue={study?.readingMinutes ?? 5} className={inputClass} />
        </Field>
        <Field label="Referência bíblica" htmlFor="st-ref">
          <input id="st-ref" name="bibleReference" placeholder="Ex.: Salmo 23" defaultValue={study?.bibleReference ?? ""} className={inputClass} />
        </Field>
        <Field label="Texto" htmlFor="st-body" className="md:col-span-3">
          <textarea id="st-body" name="body" defaultValue={study?.body} className={`${textareaClass} min-h-80 font-mono text-[0.85rem]`} />
        </Field>
        <div className="flex justify-end md:col-span-3">
          <SubmitButton>Salvar estudo</SubmitButton>
        </div>
      </form>
    </AdminCard>
  )
}
