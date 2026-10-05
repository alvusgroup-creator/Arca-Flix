"use client"

import { useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FormState } from "../schemas"

/** Mostra toast quando o estado de uma server action muda. */
export function useActionToast(state: FormState) {
  const last = useRef<FormState>(null)
  useEffect(() => {
    if (!state || state === last.current) return
    last.current = state
    if (state.error) toast.error(state.error)
    else if (state.success) toast.success(state.success)
  }, [state])
}

export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending && <LoaderCircle className="animate-spin" />}
      {children}
    </Button>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-grape-900">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export const inputClass =
  "h-11 w-full rounded-2xl border border-input bg-white px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-grape-500 focus:ring-3 focus:ring-grape-500/15 disabled:opacity-60"

export const textareaClass =
  "min-h-28 w-full rounded-2xl border border-input bg-white px-3.5 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-grape-500 focus:ring-3 focus:ring-grape-500/15"

export function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-input bg-white px-4 py-3 text-sm font-semibold">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-grape-600" />
      {label}
    </label>
  )
}

export function AdminCard({
  title,
  description,
  children,
  className,
  actions,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}) {
  return (
    <section className={cn("rounded-3xl bg-white p-5 shadow-soft sm:p-6", className)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
