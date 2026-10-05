import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="page-x grid min-h-dvh place-items-center py-16 text-center">
      <div className="max-w-md space-y-6">
        <Logo variant="icon" iconClassName="mx-auto h-28" />
        <p className="font-heading text-7xl font-bold text-lilac-400">404</p>
        <h1 className="text-2xl font-semibold">Esta página navegou para longe</h1>
        <p className="text-muted-foreground">O conteúdo que procura não existe ou foi removido.</p>
        <Link href="/browse" className={buttonVariants({ size: "lg" })}>
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
