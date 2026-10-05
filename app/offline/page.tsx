import type { Metadata } from "next"
import { WifiOff } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { RetryButton } from "@/components/shared/retry-button"

export const metadata: Metadata = { title: "Sem conexão", robots: { index: false, follow: false } }

/** Página estática servida pelo service worker quando não há internet. */
export default function OfflinePage() {
  return (
    <div className="page-x grid min-h-dvh place-items-center py-16 text-center">
      <div className="max-w-sm space-y-6">
        <Logo variant="icon" iconClassName="mx-auto h-24 animate-float" />
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-lilac-100 text-grape-600">
          <WifiOff className="size-7" aria-hidden="true" />
        </span>
        <h1 className="text-3xl font-bold">Sem internet por aqui</h1>
        <p className="text-muted-foreground">
          A arca está esperando a conexão voltar. Verifique o Wi-Fi ou os dados móveis e tente de novo.
        </p>
        <RetryButton />
      </div>
    </div>
  )
}
