"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "../actions"
import { forgotSchema, type ForgotInput } from "../schemas"
import { FieldError, FormMessage } from "./auth-card"

export function ForgotForm() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string }>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } })

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const res = await requestPasswordReset(values)
      if (res?.error) setMessage({ tone: "error", text: res.error })
      if (res?.success) setMessage({ tone: "success", text: res.success })
    })
  )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@exemplo.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="animate-spin" />}
        Enviar link de recuperação
      </Button>
      <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar para o login
      </Link>
    </form>
  )
}
