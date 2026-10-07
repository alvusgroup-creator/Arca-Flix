"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { selectProfile } from "../actions"
import { ProfileForm } from "./profile-form"

/** Etapa 4 do cadastro: o primeiro perfil é o do responsável (adulto); os das crianças vêm depois. */
export function FirstProfile({ name }: { name: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  return (
    <ProfileForm
      submitLabel="Criar meu perfil"
      defaults={{ name: name.split(" ")[0], kind: "adult" }}
      usedAvatars={["lamb"]}
      onDone={(id) =>
        startTransition(async () => {
          await selectProfile(id)
          // Em seguida: adicionar o perfil de cada filho.
          router.push("/profiles?criado=1")
        })
      }
    />
  )
}
