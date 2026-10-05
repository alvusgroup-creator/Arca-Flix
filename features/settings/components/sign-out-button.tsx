"use client"

import { useTransition } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/features/auth/actions"

export function SignOutButton() {
  const [pending, startTransition] = useTransition()
  return (
    <Button variant="outline" size="lg" disabled={pending} onClick={() => startTransition(() => signOut())} className="w-full sm:w-auto">
      <LogOut /> Sair da conta
    </Button>
  )
}
