"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/features/auth/components/password-input"
import { resetSchema, type ResetInput } from "@/features/auth/schemas"
import { changeEmail, changePassword, updateName } from "../actions"
import { SettingsCard } from "./settings-card"

const nameSchema = z.object({ fullName: z.string().trim().min(2, "Informe seu nome.").max(60) })
const emailSchema = z.object({ email: z.string().trim().email("E-mail inválido.") })

function notify(res: { error?: string; success?: string }) {
  if (res.error) toast.error(res.error)
  else if (res.success) toast.success(res.success)
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <LoaderCircle className="animate-spin" />}
      {children}
    </Button>
  )
}

export function AccountForms({ fullName, email }: { fullName: string; email: string }) {
  const [pending, startTransition] = useTransition()

  const nameForm = useForm<z.infer<typeof nameSchema>>({ resolver: zodResolver(nameSchema), defaultValues: { fullName } })
  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema), defaultValues: { email } })
  const passwordForm = useForm<ResetInput>({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirm: "" } })

  return (
    <div className="space-y-5">
      <SettingsCard title="Nome" description="Como você aparece nos e-mails e na conta.">
        <form
          noValidate
          onSubmit={nameForm.handleSubmit((v) => startTransition(async () => notify(await updateName(v))))}
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="fullName" className="sr-only">Nome</Label>
            <Input id="fullName" autoComplete="name" aria-invalid={Boolean(nameForm.formState.errors.fullName)} {...nameForm.register("fullName")} />
            {nameForm.formState.errors.fullName && <p className="text-xs text-red-700">{nameForm.formState.errors.fullName.message}</p>}
          </div>
          <Submit pending={pending}>Salvar</Submit>
        </form>
      </SettingsCard>

      <SettingsCard title="E-mail" description="Usado para entrar e receber recibos.">
        <form
          noValidate
          onSubmit={emailForm.handleSubmit((v) => startTransition(async () => notify(await changeEmail(v))))}
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="account-email" className="sr-only">E-mail</Label>
            <Input id="account-email" type="email" autoComplete="email" aria-invalid={Boolean(emailForm.formState.errors.email)} {...emailForm.register("email")} />
            {emailForm.formState.errors.email && <p className="text-xs text-red-700">{emailForm.formState.errors.email.message}</p>}
          </div>
          <Submit pending={pending}>Alterar e-mail</Submit>
        </form>
      </SettingsCard>

      <SettingsCard title="Senha" description="Use pelo menos 8 caracteres.">
        <form
          noValidate
          onSubmit={passwordForm.handleSubmit((v) =>
            startTransition(async () => {
              const res = await changePassword(v)
              notify(res)
              if (res.success) passwordForm.reset()
            })
          )}
          className="grid gap-3 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nova senha</Label>
            <PasswordInput id="new-password" autoComplete="new-password" {...passwordForm.register("password")} />
            {passwordForm.formState.errors.password && <p className="text-xs text-red-700">{passwordForm.formState.errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmar</Label>
            <PasswordInput id="confirm-password" autoComplete="new-password" {...passwordForm.register("confirm")} />
            {passwordForm.formState.errors.confirm && <p className="text-xs text-red-700">{passwordForm.formState.errors.confirm.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Submit pending={pending}>Alterar senha</Submit>
          </div>
        </form>
      </SettingsCard>
    </div>
  )
}
