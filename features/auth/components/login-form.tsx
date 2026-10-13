"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "../actions"
import { loginSchema, type LoginInput } from "../schemas"
import { FieldError, FormMessage } from "./auth-card"
import { publicEnv } from "@/lib/env"
import { GoogleButton } from "./google-button"
import { PasswordInput } from "./password-input"

export function LoginForm({ next }: { next?: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", next } })

  const onSubmit = handleSubmit((values) => {
    setError(undefined)
    startTransition(async () => {
      const res = await signIn(values)
      if (res?.error) setError(res.error)
    })
  })

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error && <FormMessage tone="error">{error}</FormMessage>}

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-lilac-400 hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <FieldError id="password-error" message={errors.password?.message} />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending && <LoaderCircle className="animate-spin" />}
          Entrar
        </Button>
      </form>

      {publicEnv.googleLogin && (
        <>
          <div className="flex items-center gap-3 text-xs text-foreground/40" aria-hidden="true">
            <span className="h-px flex-1 bg-grape-600/10" /> ou <span className="h-px flex-1 bg-grape-600/10" />
          </div>
          <GoogleButton next={next} />
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/register" className="font-semibold text-foreground hover:text-lilac-400">
          Criar uma conta
        </Link>
      </p>
    </div>
  )
}
