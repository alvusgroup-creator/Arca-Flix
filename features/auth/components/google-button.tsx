"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "../actions"

export function GoogleButton({ next }: { next?: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await signInWithGoogle(next)
          if (res?.error) toast.error(res.error)
        })
      }
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.8 3.4 14.6 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c5.3 0 8.8-3.73 8.8-8.98 0-.6-.07-1.06-.15-1.52H12z" />
      </svg>
      Continuar com Google
    </Button>
  )
}
