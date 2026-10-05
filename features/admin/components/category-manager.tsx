"use client"

import { useActionState, useState, useTransition } from "react"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import type { Category } from "@/types"
import { deleteCategory, saveCategory } from "../actions"
import { slugify } from "../schemas"
import { AdminCard, Field, SubmitButton, inputClass, useActionToast } from "./form-kit"

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, action] = useActionState(saveCategory, null)
  useActionToast(state)
  const [name, setName] = useState("")
  const [, startTransition] = useTransition()

  return (
    <div className="space-y-6">
      <AdminCard title="Nova categoria" description="Categorias organizam o catálogo, os filtros e o controle parental.">
        <form
          action={(fd) => {
            action(fd)
            setName("")
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <Field label="Nome" htmlFor="cat-name" className="min-w-56 flex-1">
            <input id="cat-name" name="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Slug" htmlFor="cat-slug" className="min-w-56 flex-1">
            <input id="cat-slug" name="slug" required readOnly value={slugify(name)} className={inputClass} />
          </Field>
          <SubmitButton>
            <Plus /> Criar
          </SubmitButton>
        </form>
      </AdminCard>

      <AdminCard title={`Categorias (${categories.length})`}>
        <ul className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-1 rounded-full border border-input bg-white py-1 pr-1 pl-4 text-sm font-medium">
              {c.name}
              <ConfirmDialog
                title={`Excluir a categoria "${c.name}"?`}
                description="Os conteúdos deixam de estar nesta categoria."
                confirmLabel="Excluir"
                destructive
                onConfirm={() =>
                  startTransition(async () => {
                    const res = await deleteCategory(c.id)
                    if (res?.error) toast.error(res.error)
                    else toast.success("Categoria excluída")
                  })
                }
                trigger={
                  <button type="button" aria-label={`Excluir ${c.name}`} className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-lilac-100 hover:text-grape-700">
                    <X className="size-3.5" />
                  </button>
                }
              />
            </li>
          ))}
        </ul>
      </AdminCard>
    </div>
  )
}
