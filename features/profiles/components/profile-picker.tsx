"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ViewerProfile } from "@/types"
import { deleteProfile, selectProfile } from "../actions"
import { PinDialog } from "./pin-dialog"
import { ProfileCard } from "./profile-card"
import { ProfileForm } from "./profile-form"

type DialogState = { mode: "create" } | { mode: "edit"; profile: ViewerProfile } | null

export function ProfilePicker({
  profiles,
  maxProfiles,
  unlockId,
}: {
  profiles: ViewerProfile[]
  maxProfiles: number
  unlockId?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [pinFor, setPinFor] = useState<ViewerProfile | null>(
    () => profiles.find((p) => p.id === unlockId && p.hasPin) ?? null
  )
  const [pinError, setPinError] = useState<string>()

  function enter(profile: ViewerProfile, pin?: string) {
    startTransition(async () => {
      const res = await selectProfile(profile.id, pin)
      if (res.error === "PIN_REQUIRED") {
        setPinError(undefined)
        return setPinFor(profile)
      }
      if (res.error) {
        if (pin) return setPinError(res.error)
        return void toast.error(res.error)
      }
      router.push("/browse")
    })
  }

  function onCardClick(profile: ViewerProfile) {
    if (editing) return setDialog({ mode: "edit", profile })
    enter(profile)
  }

  function remove(profile: ViewerProfile) {
    startTransition(async () => {
      const res = await deleteProfile(profile.id)
      if (res.error) return void toast.error(res.error)
      toast.success(`Perfil ${profile.name} excluído`)
      setDialog(null)
      router.refresh()
    })
  }

  const canAdd = profiles.length < maxProfiles

  return (
    <>
      <ul className="mx-auto grid max-w-4xl grid-cols-2 justify-center gap-4 sm:grid-cols-3 sm:gap-6 md:flex md:flex-wrap">
        {profiles.map((p, i) => (
          <li key={p.id} className="animate-fade-up md:w-40 lg:w-44" style={{ animationDelay: `${i * 60}ms` }}>
            <ProfileCard profile={p} editing={editing} onClick={() => onCardClick(p)} disabled={pending} />
          </li>
        ))}
        {canAdd && (
          <li className="animate-fade-up md:w-40 lg:w-44" style={{ animationDelay: `${profiles.length * 60}ms` }}>
            <button
              type="button"
              onClick={() => setDialog({ mode: "create" })}
              className="group/add flex w-full flex-col items-center gap-3 rounded-3xl p-2 outline-none"
            >
              <span className="grid aspect-square w-full place-items-center rounded-2xl border-2 border-dashed border-grape-600/20 text-foreground/60 transition-all duration-300 group-hover/add:-translate-y-1 group-hover/add:border-lilac-400 group-hover/add:text-lilac-400 group-focus-visible/add:border-lilac-400">
                <Plus className="size-10" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold text-foreground/70 md:text-lg">Adicionar perfil</span>
            </button>
          </li>
        )}
      </ul>

      {profiles.length > 0 && (
        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg" onClick={() => setEditing((v) => !v)} className="min-w-52">
            {editing ? "Concluído" : "Gerenciar perfis"}
          </Button>
        </div>
      )}

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto p-6 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{dialog?.mode === "edit" ? "Editar perfil" : "Novo perfil"}</DialogTitle>
          </DialogHeader>
          {dialog && (
            <ProfileForm
              key={dialog.mode === "edit" ? dialog.profile.id : "new"}
              profile={dialog.mode === "edit" ? dialog.profile : undefined}
              onDone={() => {
                toast.success(dialog.mode === "edit" ? "Perfil atualizado" : "Perfil criado")
                setDialog(null)
                router.refresh()
              }}
              footer={
                dialog.mode === "edit" && profiles.length > 1 ? (
                  <ConfirmDialog
                    title={`Excluir o perfil ${dialog.profile.name}?`}
                    description="O histórico, a Minha Lista e as preferências deste perfil serão apagados."
                    confirmLabel="Excluir"
                    destructive
                    onConfirm={() => remove(dialog.profile)}
                    trigger={
                      <Button type="button" variant="destructive" size="lg">
                        <Trash /> Excluir perfil
                      </Button>
                    }
                  />
                ) : undefined
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <PinDialog
        open={pinFor !== null}
        profileName={pinFor?.name ?? ""}
        error={pinError}
        pending={pending}
        onOpenChange={(open) => !open && setPinFor(null)}
        onSubmit={(pin) => pinFor && enter(pinFor, pin)}
      />
    </>
  )
}
