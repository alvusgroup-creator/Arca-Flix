"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Abre o arquivo numa janela própria e chama a impressão do navegador. */
export function PrintButton({ href, title }: { href: string; title: string }) {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => {
        const win = window.open("", "_blank", "noopener=no")
        if (!win) return
        win.document.title = title
        win.document.body.style.margin = "0"
        const img = win.document.createElement("img")
        img.src = new URL(`${href}?format=image`, window.location.origin).toString()
        img.alt = title
        img.style.cssText = "width:100%;height:auto;display:block"
        img.onload = () => {
          win.focus()
          win.print()
        }
        win.document.body.appendChild(img)
      }}
    >
      <Printer /> Imprimir
    </Button>
  )
}
