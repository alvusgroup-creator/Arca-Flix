"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Brush, Download, Eraser, Trash, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const COLORS = [
  "#e53935", "#fb8c00", "#fdd835", "#43a047", "#00acc1", "#1e88e5",
  "#7b2fbe", "#d81b60", "#ff8cc6", "#8d6e63", "#9e9e9e", "#212121",
]
const SIZES = [6, 14, 28]
const MAX_UNDO = 25
const WIDTH = 1600
const HEIGHT = 1000

/**
 * Pintura online. Duas camadas: a pintura (canvas) por baixo e o desenho por
 * cima com mix-blend "multiply" — as linhas pretas ficam sempre visíveis e a
 * borracha nunca apaga o desenho original.
 */
export function Painter({ imageUrl, title }: { imageUrl: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const history = useRef<ImageData[]>([])
  const drawing = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState(COLORS[6])
  const [size, setSize] = useState(SIZES[1])
  const [tool, setTool] = useState<"brush" | "eraser">("brush")
  const [canUndo, setCanUndo] = useState(false)

  const ctx = () => canvasRef.current?.getContext("2d", { willReadFrequently: true }) ?? null

  useEffect(() => {
    const c = ctx()
    if (!c) return
    c.fillStyle = "#ffffff"
    c.fillRect(0, 0, WIDTH, HEIGHT)
  }, [])

  const snapshot = useCallback(() => {
    const c = ctx()
    if (!c) return
    history.current.push(c.getImageData(0, 0, WIDTH, HEIGHT))
    if (history.current.length > MAX_UNDO) history.current.shift()
    setCanUndo(true)
  }, [])

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) / rect.width) * WIDTH, y: ((e.clientY - rect.top) / rect.height) * HEIGHT }
  }

  function stroke(from: { x: number; y: number }, to: { x: number; y: number }) {
    const c = ctx()
    if (!c) return
    c.strokeStyle = tool === "eraser" ? "#ffffff" : color
    c.lineWidth = size * (WIDTH / (canvasRef.current?.clientWidth || WIDTH))
    c.lineCap = "round"
    c.lineJoin = "round"
    c.beginPath()
    c.moveTo(from.x, from.y)
    c.lineTo(to.x, to.y)
    c.stroke()
  }

  function undo() {
    const c = ctx()
    const last = history.current.pop()
    if (c && last) c.putImageData(last, 0, 0)
    setCanUndo(history.current.length > 0)
  }

  function clear() {
    snapshot()
    const c = ctx()
    if (!c) return
    c.fillStyle = "#ffffff"
    c.fillRect(0, 0, WIDTH, HEIGHT)
  }

  function download() {
    const paint = canvasRef.current
    const img = imageRef.current
    if (!paint || !img) return
    const out = document.createElement("canvas")
    out.width = WIDTH
    out.height = HEIGHT
    const o = out.getContext("2d")
    if (!o) return
    o.drawImage(paint, 0, 0)
    o.globalCompositeOperation = "multiply"
    // Mesmo enquadramento do <img object-contain>
    const scale = Math.min(WIDTH / img.naturalWidth, HEIGHT / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    o.drawImage(img, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h)
    const a = document.createElement("a")
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-pintado.png`
    a.href = out.toDataURL("image/png")
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3 shadow-soft">
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cores">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c && tool === "brush"}
              aria-label={`Cor ${c}`}
              onClick={() => {
                setColor(c)
                setTool("brush")
              }}
              className={cn(
                "size-8 rounded-full ring-2 ring-offset-2 ring-offset-white transition-transform hover:scale-110",
                color === c && tool === "brush" ? "scale-110 ring-grape-600" : "ring-transparent"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span className="h-8 w-px bg-input" aria-hidden="true" />
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Tamanho do pincel">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={size === s}
              aria-label={`Pincel ${s === SIZES[0] ? "fino" : s === SIZES[1] ? "médio" : "grosso"}`}
              onClick={() => setSize(s)}
              className={cn("grid size-9 place-items-center rounded-full hover:bg-lilac-100", size === s && "bg-lilac-100")}
            >
              <span className="rounded-full bg-grape-700" style={{ width: Math.max(4, s / 2), height: Math.max(4, s / 2) }} />
            </button>
          ))}
        </div>
        <span className="h-8 w-px bg-input" aria-hidden="true" />
        <Button size="sm" variant={tool === "brush" ? "default" : "ghost"} onClick={() => setTool("brush")}>
          <Brush /> Pincel
        </Button>
        <Button size="sm" variant={tool === "eraser" ? "default" : "ghost"} onClick={() => setTool("eraser")}>
          <Eraser /> Borracha
        </Button>
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="ghost" onClick={undo} disabled={!canUndo}>
            <Undo2 /> Desfazer
          </Button>
          <Button size="sm" variant="ghost" onClick={clear}>
            <Trash /> Limpar
          </Button>
          <Button size="sm" onClick={download}>
            <Download /> Baixar desenho
          </Button>
        </div>
      </div>

      <div className="relative mx-auto aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-soft-lg">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-label={`Área de pintura: ${title}`}
          className={cn("absolute inset-0 size-full touch-none", tool === "eraser" ? "cursor-cell" : "cursor-crosshair")}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            snapshot()
            const p = point(e)
            drawing.current = p
            stroke(p, p)
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return
            const p = point(e)
            stroke(drawing.current, p)
            drawing.current = p
          }}
          onPointerUp={() => (drawing.current = null)}
          onPointerCancel={() => (drawing.current = null)}
        />
        {/* Desenho original por cima (multiply): as linhas ficam sempre visíveis */}
        {/* eslint-disable-next-line @next/next/no-img-element -- precisa do elemento cru para exportar no canvas */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt=""
          crossOrigin="anonymous"
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full object-contain mix-blend-multiply select-none"
        />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Dica: pinte por cima — as linhas do desenho nunca saem. Funciona com o dedo no tablet e no celular.
      </p>
    </div>
  )
}
