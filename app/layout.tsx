import type { Metadata, Viewport } from "next"
import { Fredoka, Nunito } from "next/font/google"
import { ServiceWorker } from "@/components/shared/service-worker"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { publicEnv } from "@/lib/env"
import "./globals.css"

// Fredoka (títulos) e Nunito (texto): formas arredondadas, alinhadas com a nova logo.
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], display: "swap" })
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.appUrl),
  title: {
    default: "Arca Flix — Streaming cristão para a família",
    template: "%s · Arca Flix",
  },
  description:
    "Séries, filmes, músicas, histórias bíblicas e atividades para colorir. Entretenimento cristão seguro para crianças e famílias.",
  applicationName: "Arca Flix",
  appleWebApp: { capable: true, title: "Arca Flix", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    siteName: "Arca Flix",
    locale: "pt_BR",
    images: [{ url: "/landing/og.jpg", width: 1200, height: 630, alt: "Arca Flix — streaming cristão para a família" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#0E0A1A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: extensões do navegador alteram atributos do body */}
      <body className="min-h-full" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <ServiceWorker />
      </body>
    </html>
  )
}
