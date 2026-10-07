import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { DemoBanner } from "@/components/shared/demo-banner"

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <Image
        src="/landing/hero.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover object-right"
      />
      <div className="veil absolute inset-0 -z-10 lg:hidden" />
      {/* No desktop a família fica à direita; o formulário vai à esquerda, sobre a parede */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-grape-900/70 via-grape-900/30 to-transparent max-lg:hidden" />

      <header className="page-x flex h-20 items-center justify-center lg:justify-start">
        <Link href="/" aria-label="Arca Flix — página inicial">
          <Logo tone="onDark" className="text-xl" iconClassName="h-10" />
        </Link>
      </header>

      <main className="page-x flex flex-1 items-center justify-center py-8 lg:justify-start lg:pl-[6vw]">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>

      <footer className="page-x flex flex-col items-center gap-1 py-6 text-xs text-white/60 lg:items-start">
        <DemoBanner />
        <p>© {new Date().getFullYear()} Arca Flix · Entretenimento cristão para a família</p>
      </footer>
    </div>
  )
}
