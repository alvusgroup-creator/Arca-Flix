"use client"

import { useTransition } from "react"
import { History, Trash } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { clearHistory, deleteAccount } from "../actions"
import { SettingsCard } from "./settings-card"

export function PrivacyActions() {
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Histórico de visualização"
        description="Apaga o progresso de todos os perfis. “Continuar assistindo” fica vazio."
      >
        <ConfirmDialog
          title="Apagar todo o histórico?"
          description="Esta ação não pode ser desfeita."
          confirmLabel="Apagar histórico"
          destructive
          onConfirm={() =>
            startTransition(async () => {
              const res = await clearHistory()
              if (res.success) toast.success(res.success)
            })
          }
          trigger={
            <Button variant="outline" disabled={pending}>
              <History /> Apagar histórico
            </Button>
          }
        />
      </SettingsCard>

      <SettingsCard
        title="Excluir conta"
        description="Remove a conta, os perfis e todos os dados. A assinatura ativa é cancelada."
        className="border-destructive/25"
      >
        <ConfirmDialog
          title="Excluir sua conta?"
          description="Todos os perfis, listas e históricos serão apagados definitivamente e a assinatura será cancelada."
          confirmLabel="Excluir definitivamente"
          destructive
          onConfirm={() =>
            startTransition(async () => {
              const res = await deleteAccount()
              if (res?.error) toast.error(res.error)
            })
          }
          trigger={
            <Button variant="destructive" disabled={pending}>
              <Trash /> Excluir conta
            </Button>
          }
        />
      </SettingsCard>
    </div>
  )
}
