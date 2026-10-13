"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "../actions"
import { registerSchema, type RegisterInput } from "../schemas"
import { FieldError, FormMessage } from "./auth-card"
import { publicEnv } from "@/lib/env"
import { GoogleButton } from "./google-button"
import { PasswordInput } from "./password-input"

export function RegisterForm({ plan }: { plan?: { slug: string; label: string } }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string }>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", plan: plan?.slug },
  })

  const onSubmit = handleSubmit((values) => {
    setMessage(undefined)
    startTransition(async () => {
      const res = await signUp(values)
      if (res?.error) setMessage({ tone: "error", text: res.error })
      if (res?.success) setMessage({ tone: "success", text: res.success })
    })
  })

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {plan && (
          <p className="flex items-center justify-between gap-3 rounded-xl border border-grape-500/30 bg-lilac-100 px-4 py-3 text-sm">
            <span>
              <span className="block text-xs font-semibold tracking-wide text-grape-600 uppercase">Plano escolhido</span>
              <span className="font-semibold text-grape-900">{plan.label}</span>
            </span>
            <Link href="/plans" className="shrink-0 font-semibold text-grape-600 underline">
              Trocar
            </Link>
          </p>
        )}
        {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}

        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Como devemos chamar você?"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <FieldError id="password-error" message={errors.password?.message} />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending && <LoaderCircle className="animate-spin" />}
          Continuar
        </Button>
        <p className="text-center text-xs text-foreground/45">
          Ao continuar, você concorda com os{" "}
          <Link href="/termos" className="underline hover:text-grape-600">Termos de Uso</Link> e a{" "}
          <Link href="/privacidade" className="underline hover:text-grape-600">Política de Privacidade</Link>.
        </p>
      </form>

      {publicEnv.googleLogin && (
        <>
          <div className="flex items-center gap-3 text-xs text-foreground/40" aria-hidden="true">
            <span className="h-px flex-1 bg-grape-600/10" /> ou <span className="h-px flex-1 bg-grape-600/10" />
          </div>
          <GoogleButton next="/plans?step=2" />
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href={plan ? `/login?next=${encodeURIComponent(`/checkout?plan=${plan.slug}`)}` : "/login"}
          className="font-semibold text-foreground hover:text-lilac-400">
          Entrar
        </Link>
      </p>
    </div>
  )
}
