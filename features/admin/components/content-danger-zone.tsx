"use client"

import { useTransition } from "react"
import { Eye, EyeOff, Trash } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { deleteContent, setPublished } from "../actions"

export function PublishToggle({ contentId, published }: { contentId: string; published: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant={published ? "outline" : "default"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await setPublished(contentId, !published)
          if (res?.error) toast.error(res.error)
          else if (res?.success) toast.success(res.success)
        })
      }
    >
      {published ? <EyeOff /> : <Eye />}
      {published ? "Despublicar" : "Publicar"}
    </Button>
  )
}

export function DeleteContentButton({ contentId, title }: { contentId: string; title: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <ConfirmDialog
      title={`Excluir "${title}"?`}
      description="Remove o conteúdo, episódios, músicas e o histórico ligado a ele. Não pode ser desfeito."
      confirmLabel="Excluir definitivamente"
      destructive
      onConfirm={() =>
        startTransition(async () => {
          const res = await deleteContent(contentId)
          if (res?.error) toast.error(res.error)
        })
      }
      trigger={
        <Button variant="destructive" disabled={pending}>
          <Trash /> Excluir
        </Button>
      }
    />
  )
}
