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
        src="/demo/noah-hero.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover object-[70%_center]"
      />
      <div className="veil absolute inset-0 -z-10" />

      <header className="page-x flex h-20 items-center justify-center lg:justify-start">
        <Link href="/" aria-label="Arca Flix — página inicial">
          <Logo tone="onDark" className="text-xl" iconClassName="h-10" />
        </Link>
      </header>

      <main className="page-x flex flex-1 items-center justify-center py-8 lg:justify-end lg:pr-[8vw]">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>

      <footer className="page-x flex flex-col items-center gap-1 py-6 text-xs text-white/60 lg:items-start">
        <DemoBanner />
        <p>© {new Date().getFullYear()} Arca Flix · Entretenimento cristão para a família</p>
      </footer>
    </div>
  )
}
