"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, Lock, LockOpen } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AgeRatingBadge } from "@/components/content/age-rating-badge"
import { SettingsCard } from "@/features/settings/components/settings-card"
import { cn } from "@/lib/utils"
import { AGE_RATINGS, ageRatingLabel } from "@/utils/age-rating"
import type { Category, ViewerProfile } from "@/types"
import { updateParentalControls } from "../actions"
import { avatarSrc } from "../avatars"
import { parentalSchema, type ParentalFormValues } from "../schemas"

export function ParentalControls({ profiles, categories }: { profiles: ViewerProfile[]; categories: Category[] }) {
  const [selectedId, setSelectedId] = useState(profiles.find((p) => p.kind === "kids")?.id ?? profiles[0]?.id)
  const profile = profiles.find((p) => p.id === selectedId)

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Perfil" className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {profiles.map((p) => (
          <button
            key={p.id}
            role="tab"
            type="button"
            aria-selected={p.id === selectedId}
            onClick={() => setSelectedId(p.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border py-1 pr-4 pl-1 text-sm font-medium transition-colors",
              p.id === selectedId ? "border-grape-500 bg-grape-600/25 text-foreground" : "border-grape-600/10 text-foreground/70 hover:border-grape-600/25"
            )}
          >
            <Image src={avatarSrc(p.avatar)} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
            {p.name}
          </button>
        ))}
      </div>
      {profile && <ParentalForm key={profile.id} profile={profile} categories={categories} />}
    </div>
  )
}

function ParentalForm({ profile, categories }: { profile: ViewerProfile; categories: Category[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const { control, register, handleSubmit, setValue, formState } = useForm<ParentalFormValues>({
    resolver: zodResolver(parentalSchema),
    defaultValues: {
      maxAgeRating: profile.maxAgeRating,
      blockedCategoryIds: profile.blockedCategoryIds,
      pin: undefined,
    },
  })
  const pin = useWatch({ control, name: "pin" })

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const res = await updateParentalControls(profile.id, values)
      if (res.error) return void toast.error(res.error)
      toast.success("Controle parental salvo")
      setValue("pin", undefined)
      router.refresh()
    })
  )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <SettingsCard title="Classificação máxima" description="Conteúdos acima desta classificação ficam ocultos neste perfil.">
        <Controller
          control={control}
          name="maxAgeRating"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Classificação máxima" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {AGE_RATINGS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={field.value === r}
                  onClick={() => field.onChange(r)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition-colors",
                    field.value === r ? "border-grape-500 bg-grape-600/25" : "border-grape-600/10 hover:border-grape-600/25"
                  )}
                >
                  <AgeRatingBadge rating={r} />
                  {ageRatingLabel[r]}
                </button>
              ))}
            </div>
          )}
        />
      </SettingsCard>

      <SettingsCard title="Categorias bloqueadas" description="Marque os temas que este perfil não deve ver.">
        <Controller
          control={control}
          name="blockedCategoryIds"
          render={({ field }) => (
            <ul className="grid gap-2 sm:grid-cols-2">
              {categories.map((c) => {
                const checked = field.value.includes(c.id)
                return (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-grape-600/[0.07] px-3 py-2.5 hover:bg-grape-600/[0.03]">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          field.onChange(v ? [...field.value, c.id] : field.value.filter((id) => id !== c.id))
                        }
                      />
                      <span className="text-sm">{c.name}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        />
      </SettingsCard>

      <SettingsCard
        title="PIN do perfil"
        description={profile.hasPin ? "Este perfil está protegido. Defina um novo PIN ou remova a proteção." : "Peça um PIN de 4 números para entrar neste perfil."}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="pin">{profile.hasPin ? "Novo PIN" : "PIN"}</Label>
            <Input
              id="pin"
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              placeholder="••••"
              className="w-32 text-center tracking-[0.5em]"
              aria-invalid={Boolean(formState.errors.pin)}
              {...register("pin", { setValueAs: (v: string) => (v === "" ? undefined : v) })}
            />
          </div>
          {profile.hasPin && (
            <Button type="button" variant="outline" onClick={() => setValue("pin", "", { shouldDirty: true })} disabled={pin === ""}>
              <LockOpen /> {pin === "" ? "PIN será removido" : "Remover PIN"}
            </Button>
          )}
        </div>
        {formState.errors.pin && <p className="mt-2 text-xs text-red-300">{formState.errors.pin.message}</p>}
      </SettingsCard>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" /> : <Lock />}
          Salvar controle parental
        </Button>
      </div>
    </form>
  )
}
