"use client"

import { useTransition } from "react"
import { Lock, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { startCheckout } from "../actions"

export function CheckoutButton({ planSlug, label }: { planSlug: string; label: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await startCheckout(planSlug)
          if (res?.error) toast.error(res.error)
        })
      }
    >
      {pending ? <LoaderCircle className="animate-spin" /> : <Lock />}
      {label}
    </Button>
  )
}
