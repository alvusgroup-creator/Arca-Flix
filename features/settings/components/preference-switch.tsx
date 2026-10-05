"use client"

import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import type { AccountPreferences } from "@/services/account"
import { updatePreferences } from "../actions"

type BoolPref = { [K in keyof AccountPreferences]: AccountPreferences[K] extends boolean ? K : never }[keyof AccountPreferences]

export function PreferenceSwitch({
  name,
  label,
  description,
  value,
}: {
  name: BoolPref
  label: string
  description: string
  value: boolean
}) {
  const [optimistic, setOptimistic] = useOptimistic(value)
  const [, startTransition] = useTransition()
  const id = `pref-${name}`

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </label>
      <Switch
        id={id}
        checked={optimistic}
        onCheckedChange={(checked) =>
          startTransition(async () => {
            setOptimistic(checked)
            const res = await updatePreferences({ [name]: checked })
            if (res.error) toast.error(res.error)
          })
        }
      />
    </div>
  )
}
