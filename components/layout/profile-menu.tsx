"use client"

import { useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, CreditCard, LogOut, Pencil, Settings, Users } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/features/auth/actions"
import { avatarSrc } from "@/features/profiles/avatars"
import { selectProfile } from "@/features/profiles/actions"
import type { ViewerProfile } from "@/types"

export function ProfileMenu({ profile, profiles }: { profile: ViewerProfile; profiles: ViewerProfile[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const others = profiles.filter((p) => p.id !== profile.id)

  function switchTo(p: ViewerProfile) {
    // Perfis com PIN passam pela tela de seleção para pedir o código.
    if (p.hasPin) return router.push(`/profiles?unlock=${p.id}`)
    startTransition(async () => {
      const res = await selectProfile(p.id)
      if (res.error) return void toast.error(res.error)
      router.push("/browse")
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Perfil: ${profile.name}. Abrir menu`}
        disabled={pending}
        className="group flex items-center gap-1.5 rounded-xl p-1 outline-none hover:bg-grape-600/10 focus-visible:ring-2 focus-visible:ring-lilac-400"
      >
        <Image
          src={avatarSrc(profile.avatar)}
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-lg object-cover ring-1 ring-grape-600/15"
        />
        <ChevronDown className="hidden size-4 text-foreground/60 transition-transform group-data-popup-open:rotate-180 sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 pt-1 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Assistindo como <span className="text-foreground normal-case">{profile.name}</span>
          </DropdownMenuLabel>
          {others.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => switchTo(p)} className="gap-3 rounded-lg px-2 py-2">
              <Image src={avatarSrc(p.avatar)} alt="" width={28} height={28} className="size-7 rounded-md object-cover" />
              <span className="truncate">{p.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem render={<Link href="/profiles" />} className="gap-3 rounded-lg px-2 py-2">
          <Users className="size-4" /> Trocar perfil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings/profiles" />} className="gap-3 rounded-lg px-2 py-2">
          <Pencil className="size-4" /> Gerenciar perfis
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings/subscription" />} className="gap-3 rounded-lg px-2 py-2">
          <CreditCard className="size-4" /> Assinatura
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />} className="gap-3 rounded-lg px-2 py-2">
          <Settings className="size-4" /> Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          onClick={() => startTransition(() => signOut())}
          className="gap-3 rounded-lg px-2 py-2 text-foreground/80"
        >
          <LogOut className="size-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
