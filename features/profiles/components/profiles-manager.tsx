"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Lock, Pencil, Plus, Trash } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ageRatingLabel, profileKindLabel } from "@/utils/age-rating"
import type { ViewerProfile } from "@/types"
import { deleteProfile } from "../actions"
import { avatarSrc } from "../avatars"
import { ProfileForm } from "./profile-form"

export function ProfilesManager({ profiles, maxProfiles }: { profiles: ViewerProfile[]; maxProfiles: number }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editing, setEditing] = useState<ViewerProfile | "new" | null>(null)

  function remove(p: ViewerProfile) {
    startTransition(async () => {
      const res = await deleteProfile(p.id)
      if (res.error) return void toast.error(res.error)
      toast.success(`Perfil ${p.name} excluído`)
      router.refresh()
    })
  }

  return (
    <>
      <ul className="divide-y divide-grape-600/[0.06] overflow-hidden rounded-3xl border border-grape-600/[0.07] bg-surface-1">
        {profiles.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-4">
            <Image src={avatarSrc(p.avatar)} alt="" width={52} height={52} className="size-13 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-semibold">
                {p.name}
                {p.hasPin && <Lock className="size-3.5 text-foreground/50" aria-label="Protegido por PIN" />}
              </p>
              <p className="text-sm text-muted-foreground">
                {profileKindLabel[p.kind]} · até {ageRatingLabel[p.maxAgeRating].toLowerCase()}
              </p>
            </div>
            <Button variant="ghost" size="icon" aria-label={`Editar ${p.name}`} onClick={() => setEditing(p)}>
              <Pencil />
            </Button>
            {profiles.length > 1 && (
              <ConfirmDialog
                title={`Excluir o perfil ${p.name}?`}
                description="O histórico, a Minha Lista e as preferências deste perfil serão apagados."
                confirmLabel="Excluir"
                destructive
                onConfirm={() => remove(p)}
                trigger={
                  <Button variant="ghost" size="icon" aria-label={`Excluir ${p.name}`}>
                    <Trash />
                  </Button>
                }
              />
            )}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {profiles.length} de {maxProfiles} perfis usados
        </p>
        <Button onClick={() => setEditing("new")} disabled={profiles.length >= maxProfiles}>
          <Plus /> Novo perfil
        </Button>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto p-6 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{editing === "new" ? "Novo perfil" : "Editar perfil"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProfileForm
              key={editing === "new" ? "new" : editing.id}
              profile={editing === "new" ? undefined : editing}
              usedAvatars={profiles.map((p) => p.avatar)}
              onDone={() => {
                toast.success(editing === "new" ? "Perfil criado" : "Perfil atualizado")
                setEditing(null)
                router.refresh()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
