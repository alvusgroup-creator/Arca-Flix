import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PublicHeader({
  signedIn,
  tone = "onLight",
  className,
}: {
  signedIn: boolean
  /** onDark: sobre foto com véu (landing) */
  tone?: "onLight" | "onDark"
  className?: string
}) {
  const dark = tone === "onDark"
  return (
    <header className={cn("shell flex h-18 items-center justify-between gap-4", className)}>
      <Link href="/" aria-label="Arca Flix — página inicial">
        <Logo tone={tone} className="text-lg sm:text-xl" iconClassName="h-9 sm:h-10" />
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2">
        {signedIn ? (
          <Link href="/profiles" className={buttonVariants()}>
            Ir para o Arca Flix
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost" }), dark && "text-white hover:bg-white/10 hover:text-white")}
            >
              Entrar
            </Link>
            <Link href="/register" className={cn(buttonVariants(), "max-sm:hidden")}>
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
