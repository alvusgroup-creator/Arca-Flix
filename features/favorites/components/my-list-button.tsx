"use client"

import { useOptimistic, useTransition } from "react"
import { Check, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toggleMyList } from "../actions"

export function MyListButton({
  contentId,
  saved,
  variant = "full",
  onDark = false,
  className,
}: {
  contentId: string
  saved: boolean
  variant?: "full" | "icon"
  /** Sobre foto com véu escuro */
  onDark?: boolean
  className?: string
}) {
  const [optimistic, setOptimistic] = useOptimistic(saved)
  const [, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      setOptimistic(!optimistic)
      const res = await toggleMyList(contentId)
      if (res.error) toast.error(res.error)
      else toast.success(res.saved ? "Adicionado à Minha Lista" : "Removido da Minha Lista")
    })
  }

  const Icon = optimistic ? Check : Plus
  const label = optimistic ? "Remover da Minha Lista" : "Adicionar à Minha Lista"

  if (variant === "icon") {
    return (
      <Button
        variant={onDark ? "onDark" : "outline"}
        size="icon-lg"
        onClick={onClick}
        aria-label={label}
        aria-pressed={optimistic}
        className={className}
      >
        <Icon className={cn("transition-transform duration-200", optimistic && (onDark ? "text-lilac-200" : "text-lilac-400"))} />
      </Button>
    )
  }

  return (
    <Button variant={onDark ? "onDark" : "outline"} size="lg" onClick={onClick} aria-pressed={optimistic} className={className}>
      <Icon className={cn(optimistic && (onDark ? "text-lilac-200" : "text-lilac-400"))} />
      Minha lista
    </Button>
  )
}
