"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { profileKindLabel } from "@/utils/age-rating"
import type { ProfileKind, ViewerProfile } from "@/types"
import { createProfile, updateProfile } from "../actions"
import { AVATARS, avatarSrc } from "../avatars"
import { profileSchema, type ProfileFormValues } from "../schemas"

const KINDS: { value: ProfileKind; hint: string }[] = [
  { value: "kids", hint: "Até 10 anos" },
  { value: "teen", hint: "Até 14 anos" },
  { value: "adult", hint: "Sem restrição" },
]

export function ProfileForm({
  profile,
  onDone,
  submitLabel,
  footer,
}: {
  profile?: ViewerProfile
  onDone: (id: string) => void
  submitLabel?: string
  footer?: React.ReactNode
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? "",
      avatar: profile?.avatar ?? "lamb",
      kind: profile?.kind ?? "kids",
    },
  })

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      setError(undefined)
      if (profile) {
        const res = await updateProfile(profile.id, values)
        if (res.error) return setError(res.error)
        return onDone(profile.id)
      }
      const res = await createProfile(values)
      if (res.error || !res.id) return setError(res.error ?? "Não foi possível criar o perfil.")
      onDone(res.id)
    })
  )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Controller
        control={control}
        name="avatar"
        render={({ field }) => (
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-medium">Escolha um avatar</legend>
            <div className="grid grid-cols-5 gap-2.5" role="radiogroup">
              {AVATARS.map((a) => {
                const checked = field.value === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={a.label}
                    onClick={() => field.onChange(a.id)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-2xl ring-2 transition-all duration-200 outline-none focus-visible:ring-lilac-400",
                      checked ? "scale-[1.04] ring-lilac-400" : "ring-transparent opacity-75 hover:opacity-100"
                    )}
                  >
                    <Image src={avatarSrc(a.id)} alt="" fill sizes="72px" className="object-cover" />
                    {checked && (
                      <span className="absolute right-1 bottom-1 grid size-5 place-items-center rounded-full bg-lilac-400 text-ink">
                        <Check className="size-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}
      />

      <div className="space-y-1.5">
        <Label htmlFor="profile-name">Nome</Label>
        <Input
          id="profile-name"
          placeholder="Ex.: Ana, Kids, Família"
          maxLength={30}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && <p className="text-xs text-red-300">{errors.name.message}</p>}
      </div>

      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Tipo de perfil</legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {KINDS.map((k) => {
                const checked = field.value === k.value
                return (
                  <button
                    key={k.value}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => field.onChange(k.value)}
                    className={cn(
                      "rounded-xl border px-2 py-2.5 text-center transition-colors duration-200",
                      checked ? "border-grape-500 bg-grape-600/25" : "border-grape-600/10 bg-grape-600/[0.03] hover:border-grape-600/25"
                    )}
                  >
                    <span className="block text-sm font-semibold">{profileKindLabel[k.value]}</span>
                    <span className="block text-[0.7rem] text-foreground/50">{k.hint}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}
      />

      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        {footer ?? <span />}
        <Button type="submit" size="lg" disabled={pending} className="sm:min-w-40">
          {pending && <LoaderCircle className="animate-spin" />}
          {submitLabel ?? (profile ? "Salvar" : "Criar perfil")}
        </Button>
      </div>
    </form>
  )
}
