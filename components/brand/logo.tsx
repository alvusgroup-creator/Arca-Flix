import Image from "next/image"
import { cn } from "@/lib/utils"

// Marca Arca Flix: arca com play, pomba e ondas (arte em /public/brand/).
// O ícone é a arte original com fundo transparente; o texto é renderizado em
// Fredoka para ficar nítido em qualquer tamanho.

type Tone = "onDark" | "onLight"

const textColors: Record<Tone, { arca: string; flix: string }> = {
  onDark: { arca: "text-white", flix: "text-lilac-200" },
  onLight: { arca: "text-grape-700", flix: "text-lilac-500" },
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-icon.png"
      alt=""
      width={906}
      height={677}
      sizes="96px"
      className={cn("h-9 w-auto shrink-0", className)}
    />
  )
}

export function Logo({
  className,
  iconClassName,
  tone = "onLight",
  variant = "horizontal",
}: {
  className?: string
  iconClassName?: string
  tone?: Tone
  variant?: "horizontal" | "stacked" | "icon"
}) {
  if (variant === "icon") {
    return (
      <span role="img" aria-label="Arca Flix" className={cn("inline-flex", className)}>
        <LogoIcon className={iconClassName} />
      </span>
    )
  }

  const c = textColors[tone]
  return (
    <span
      role="img"
      aria-label="Arca Flix"
      className={cn(
        "inline-flex items-center gap-2 font-heading leading-none select-none",
        variant === "stacked" && "flex-col gap-1",
        className
      )}
    >
      <LogoIcon className={cn(variant === "stacked" ? "h-24" : "h-9", iconClassName)} />
      <span aria-hidden="true" className="text-[1.4em] font-bold tracking-tight whitespace-nowrap">
        <span className={c.arca}>Arca</span>
        <span className={c.flix}>Flix</span>
      </span>
    </span>
  )
}
