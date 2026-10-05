"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updatePassword } from "../actions"
import { resetSchema, type ResetInput } from "../schemas"
import { FieldError, FormMessage } from "./auth-card"
import { PasswordInput } from "./password-input"

export function ResetForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirm: "" } })

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const res = await updatePassword(values)
      if (res?.error) setError(res.error)
    })
  )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <div className="space-y-1.5">
        <Label htmlFor="password">Nova senha</Label>
        <PasswordInput id="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...register("password")} />
        <FieldError id="password-error" message={errors.password?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirmar senha</Label>
        <PasswordInput id="confirm" autoComplete="new-password" aria-invalid={Boolean(errors.confirm)} {...register("confirm")} />
        <FieldError id="confirm-error" message={errors.confirm?.message} />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="animate-spin" />}
        Salvar nova senha
      </Button>
    </form>
  )
}
