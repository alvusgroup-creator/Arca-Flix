"use client"

import { useRef, useState } from "react"
import { LoaderCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/** Pede o PIN de 4 dígitos. Submete automaticamente ao completar. */
export function PinDialog({
  open,
  profileName,
  error,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  profileName: string
  error?: string
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (pin: string) => void
}) {
  const [digits, setDigits] = useState(["", "", "", ""])
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function setDigit(i: number, value: string) {
    const v = value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 3) refs.current[i + 1]?.focus()
    if (next.every(Boolean)) {
      onSubmit(next.join(""))
      setDigits(["", "", "", ""])
      refs.current[0]?.focus()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-6 text-center sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-xl">Perfil protegido</DialogTitle>
          <DialogDescription>Digite o PIN de 4 números para entrar como {profileName}.</DialogDescription>
        </DialogHeader>
        <div className="my-4 flex justify-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              value={d}
              autoFocus={i === 0}
              inputMode="numeric"
              type="password"
              maxLength={1}
              aria-label={`Dígito ${i + 1} do PIN`}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus()
              }}
              className={cn(
                "size-14 rounded-2xl border border-grape-600/15 bg-grape-600/5 text-center text-2xl font-semibold outline-none focus:border-lilac-400",
                error && "border-destructive/60"
              )}
            />
          ))}
        </div>
        <p className="min-h-5 text-sm text-red-300" role="alert">
          {pending ? <LoaderCircle className="mx-auto size-5 animate-spin text-foreground/60" /> : error}
        </p>
      </DialogContent>
    </Dialog>
  )
}
