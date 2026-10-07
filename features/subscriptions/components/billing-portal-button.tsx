"use client"

import { useTransition } from "react"
import { CreditCard, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { openBillingPortal } from "../actions"

export function BillingPortalButton({
  label = "Gerenciar pagamento",
  variant = "outline",
  icon = true,
}: {
  label?: string
  variant?: "outline" | "ghost" | "destructive"
  icon?: boolean
}) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant={variant}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await openBillingPortal()
          if (res?.error) toast.error(res.error)
        })
      }
    >
      {pending ? <LoaderCircle className="animate-spin" /> : icon && <CreditCard />}
      {label}
    </Button>
  )
}
