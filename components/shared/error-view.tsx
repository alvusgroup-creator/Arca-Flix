"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RotateCw } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"

/** Mensagem amigável para error boundaries — nunca mostra stack trace. */
export function ErrorView({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="page-x grid min-h-[70dvh] place-items-center py-16 text-center">
      <div className="max-w-md space-y-5">
        <p className="font-heading text-6xl font-bold text-lilac-400">Ops!</p>
        <h1 className="text-2xl font-semibold">Algo não saiu como esperado</h1>
        <p className="text-muted-foreground">
          Tivemos um problema ao carregar esta página. Tente novamente — se continuar, volte ao início.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => retry()}>
            <RotateCw /> Tentar novamente
          </Button>
          <Link href="/browse" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Ir para o início
          </Link>
        </div>
        {error.digest && <p className="text-xs text-foreground/30">Código: {error.digest}</p>}
      </div>
    </div>
  )
}
