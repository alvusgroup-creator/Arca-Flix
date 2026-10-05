"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { selectProfile } from "../actions"
import { ProfileForm } from "./profile-form"

/** Etapa 4 do cadastro: cria o primeiro perfil e entra direto no catálogo. */
export function FirstProfile() {
  const router = useRouter()
  const [, startTransition] = useTransition()

  return (
    <ProfileForm
      submitLabel="Criar e começar a assistir"
      onDone={(id) =>
        startTransition(async () => {
          await selectProfile(id)
          router.push("/browse")
        })
      }
    />
  )
}
