import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  BadgeCheck,
  BookOpen,
  Check,
  Clapperboard,
  Lock,
  MonitorSmartphone,
  Music,
  Palette,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { PublicHeader } from "@/components/layout/public-header"
import { buttonVariants } from "@/components/ui/button"
import { Faq } from "@/features/landing/components/faq"
import { HeroMedia } from "@/features/landing/components/hero-media"
import { Highlight } from "@/features/landing/components/highlight"
import { MobileCtaBar } from "@/features/landing/components/mobile-cta-bar"
import { SectionHeader } from "@/features/landing/components/section-header"
import { landingMedia } from "@/features/landing/media"
import { PlanCard } from "@/features/subscriptions/components/plan-card"
import { isDemoMode } from "@/lib/env"
import { cn } from "@/lib/utils"
import { getCurrentAccount } from "@/services/auth"
import { getCatalog } from "@/services/content"
import { listPlans } from "@/services/subscriptions"
import { contentMeta } from "@/utils/content"

export const metadata: Metadata = {
  title: { absolute: "Arca Flix — Desenhos e histórias cristãs para crianças, sem anúncios" },
  description:
    "Desenhos bíblicos, louvores infantis, estudos e desenhos para colorir. Streaming cristão seguro para a família, com controle parental e sem anúncios.",
  alternates: { canonical: "/" },
}

const IMG = landingMedia

const benefits = [
  { icon: ShieldCheck, title: "Sem anúncios", text: "Nada de propaganda no meio do desenho." },
  { icon: Lock, title: "Controle parental", text: "Idade máxima, temas e PIN por perfil." },
  { icon: Users, title: "Perfil para cada filho", text: "Histórico e lista separados." },
  { icon: MonitorSmartphone, title: "Em qualquer tela", text: "Celular, tablet e computador." },
]

const moments = [
  { icon: Clapperboard, label: "Assistir", title: "Séries e filmes bíblicos", text: "Noé, Daniel, Ester, José e muito mais, contados com carinho.", image: IMG.moments.watch },
  { icon: Music, label: "Cantar", title: "Louvor infantil", text: "Músicas para pular de alegria e salmos calminhos para dormir.", image: IMG.moments.sing },
  { icon: Palette, label: "Colorir", title: "Desenhos para imprimir", text: "Atividades para baixar, imprimir ou pintar direto na tela.", image: IMG.moments.color },
  { icon: BookOpen, label: "Aprender", title: "Estudos para a família", text: "Devocionais curtos e versículos para conversar juntos.", image: IMG.moments.learn },
]

const parentPoints = [
  "Perfis infantis só mostram conteúdo da idade que você escolher",
  "Bloqueie temas específicos com um toque",
  "PIN para o perfil dos adultos não ser aberto pelas crianças",
  "Histórico e “continuar assistindo” separados por filho",
]

const steps = [
  { title: "Crie sua conta", text: "Só nome, e-mail e senha. Leva menos de um minuto." },
  { title: "Escolha o plano", text: "Pagamento seguro. Cancele quando quiser." },
  { title: "Dê o play", text: "Monte o perfil de cada filho e comece a assistir." },
]

function cheapestMonthly(plans: { billingInterval: string; priceCents: number }[]) {
  const min = Math.min(...plans.filter((p) => p.billingInterval === "month").map((p) => p.priceCents))
  return Number.isFinite(min) ? min : undefined
}

export default async function LandingPage() {
  if (await getCurrentAccount()) redirect("/profiles")
  const [plans, catalog] = await Promise.all([listPlans(), getCatalog(null)])
  // Prova do produto: títulos reais do catálogo (séries e filmes primeiro).
  const showcase = [...catalog]
    .sort((a, b) => Number(b.type === "series" || b.type === "movie") - Number(a.type === "series" || a.type === "movie"))
    .slice(0, 8)

  return (
    <div className="bg-surface-0 pb-20 md:pb-0">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate flex min-h-[92svh] flex-col bg-grape-900 md:min-h-[min(92svh,820px)]">
        <HeroMedia {...IMG.hero} />
        <div className="veil absolute inset-0 -z-10 md:hidden" />
        <div className="veil-side absolute inset-0 -z-10 max-md:hidden" />

        <PublicHeader signedIn={false} tone="onDark" />

        <div className="page-x flex flex-1 items-end pt-[38svh] pb-24 md:items-center md:pt-10 md:pb-32">
          <div className="mx-auto w-full max-w-xl text-center md:mx-0 md:max-w-2xl md:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-[0.72rem] font-bold tracking-[0.14em] text-white uppercase backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-sun-400" aria-hidden="true" />
              Streaming cristão para a família
            </p>
            <h1 className="mt-5 text-[2.5rem] leading-[1.04] font-bold text-white sm:text-6xl lg:text-[4.25rem]">
              Desenhos que as crianças amam e os pais <Highlight>confiam</Highlight>.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/85 md:mx-0 md:max-w-lg md:text-lg">
              Histórias da Bíblia, louvores, estudos e desenhos para colorir. Sem anúncios e com controle parental de
              verdade.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "h-13 px-8 text-base")}>
                Começar agora
              </Link>
              <Link href="#planos" className={cn(buttonVariants({ variant: "onDark", size: "lg" }), "h-13 px-8 text-base")}>
                Ver planos
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/70">Cancele quando quiser · Sem fidelidade</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- Faixa de benefícios (sobreposta) */}
      <div className="page-x relative z-10 -mt-16 md:-mt-14">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-grape-900/10 shadow-soft-lg lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-2 bg-white p-4 sm:flex-row sm:items-start sm:gap-3 sm:p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-lilac-100 text-grape-600">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-heading text-[0.98rem] font-semibold text-grape-900">{title}</span>
                <span className="block text-sm leading-snug text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* --------------------------------------------- Um momento para cada hora */}
      <section className="pt-20 pb-14 md:pt-28 md:pb-20" aria-labelledby="momentos">
        <div className="page-x">
          <SectionHeader
            pill="O que tem no Arca Flix"
            title={
              <span id="momentos">
                Um momento especial para <Highlight>cada hora</Highlight> do dia
              </span>
            }
            text="Do desenho depois da escola ao salmo antes de dormir — tudo num só lugar."
          />
        </div>
        <ul className="scrollbar-none mt-12 flex snap-x snap-mandatory scroll-px-(--page-x) gap-4 overflow-x-auto px-(--page-x) pb-2 md:mx-auto md:grid md:max-w-6xl md:grid-cols-2 md:gap-x-6 md:gap-y-10 md:overflow-visible lg:grid-cols-4 lg:gap-5">
          {moments.map(({ icon: Icon, label, title, text, image }) => (
            <li key={title} className="reveal w-[78vw] shrink-0 snap-start sm:w-[46vw] md:w-auto">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-grape-900 md:aspect-[16/11] lg:aspect-[4/5]">
                <Image src={image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 78vw" className="object-cover" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs font-bold text-grape-700">
                  <Icon className="size-3.5" aria-hidden="true" /> {label}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-grape-900">{title}</h3>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------ Já no catálogo */}
      {showcase.length > 0 && (
        <section className="pb-16 md:pb-20" aria-labelledby="catalogo">
          <div className="page-x">
            <SectionHeader
              pill="Já no catálogo"
              title={<span id="catalogo">Algumas histórias que esperam por vocês</span>}
              text="Tudo com classificação indicativa — e novos títulos chegando sempre."
            />
          </div>
          <ul className="scrollbar-none mt-10 flex snap-x snap-mandatory scroll-px-(--page-x) gap-4 overflow-x-auto px-(--page-x) pb-2 lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-4 lg:gap-5 lg:overflow-visible">
            {showcase.map((item) => (
              <li key={item.id} className="w-[62vw] shrink-0 snap-start sm:w-[38vw] lg:w-auto">
                <Link href="/register" className="group block">
                  <span className="relative block aspect-video overflow-hidden rounded-xl bg-grape-900 ring-1 ring-grape-900/5 transition-shadow group-hover:ring-2 group-hover:ring-grape-500">
                    <Image src={item.thumbnailUrl} alt="" fill sizes="(min-width: 1024px) 25vw, 62vw" className="object-cover" />
                  </span>
                  <span className="mt-2 block font-heading text-[0.98rem] font-semibold text-grape-900">{item.title}</span>
                  <span className="block text-sm text-muted-foreground">{contentMeta(item)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ------------------------------------------------------- Pais no controle */}
      <section className="bg-white py-20 md:py-28" aria-labelledby="pais">
        <div className="page-x mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="reveal relative aspect-[4/3] overflow-hidden rounded-2xl bg-grape-900 md:aspect-[5/6]">
            <Image src={IMG.parents} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div className="reveal text-center md:text-left">
            <p className="inline-flex rounded-full bg-lilac-100 px-3 py-1 text-[0.72rem] font-bold tracking-[0.14em] text-grape-600 uppercase">
              Para mães e pais
            </p>
            <h2 id="pais" className="mt-4 text-[2rem] leading-[1.1] font-bold text-grape-900 sm:text-[2.5rem]">
              Você decide o que seu filho <Highlight>assiste</Highlight>
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
              Nada de vídeo estranho aparecendo na sequência. O Arca Flix só tem conteúdo cristão escolhido para a
              família — e as regras de cada perfil ficam nas suas mãos.
            </p>
            <ul className="mt-7 space-y-3.5 text-left">
              {parentPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-grape-600 text-white">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-[1rem] leading-relaxed text-grape-900">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Como funciona */}
      <section className="py-20 md:py-28" aria-labelledby="como">
        <div className="page-x mx-auto max-w-6xl">
          <SectionHeader
            pill="Como funciona"
            title={<span id="como">Pronto em três passos</span>}
            text="Sem instalar nada: funciona direto no navegador do celular ou do computador."
          />
          <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <li key={step.title} className="reveal flex gap-4 rounded-2xl border border-grape-900/10 bg-white p-6 md:flex-col">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-grape-600 font-heading text-xl font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-lg font-semibold text-grape-900">{step.title}</span>
                  <span className="mt-1 block leading-relaxed text-muted-foreground">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Planos */}
      {plans.length > 0 && (
        <section id="planos" className="scroll-mt-6 bg-white py-20 md:py-28" aria-labelledby="planos-titulo">
          <div className="page-x mx-auto max-w-6xl">
            <SectionHeader
              pill="Planos"
              title={<span id="planos-titulo">Escolha o plano da sua família</span>}
              text="Todos os planos têm o catálogo completo, sem anúncios. Cancele quando quiser."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  monthlyReferenceCents={cheapestMonthly(plans)}
                  key={plan.id}
                  plan={plan}
                  example={isDemoMode || !plan.stripePriceId}
                  href={`/register?plan=${plan.slug}`}
                  cta="Começar agora"
                />
              ))}
            </div>
            <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="size-4 text-grape-500" aria-hidden="true" />
              Pagamento seguro processado pelo Stripe
            </p>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------- FAQ */}
      <section className="py-20 md:py-28" aria-labelledby="faq">
        <div className="page-x">
          <SectionHeader pill="Dúvidas" title={<span id="faq">Perguntas frequentes</span>} />
          <div className="mt-10">
            <Faq profilesByPlan={plans.map((p) => `${p.name}: até ${p.maxProfiles}`).join(" · ")} />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA final */}
      <section className="page-x pb-20 md:pb-28">
        <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-2xl bg-grape-900">
          <Image src={IMG.cta} alt="" fill sizes="(min-width: 1152px) 1152px, 100vw" className="-z-20 object-cover" />
          <div className="veil absolute inset-0 -z-10" />
          <div className="mx-auto max-w-xl px-6 py-16 text-center md:py-24">
            <h2 className="text-[2rem] leading-[1.1] font-bold text-white sm:text-[2.75rem]">
              Conteúdo com valores que você aprova
            </h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-white/85">
              Crie sua conta e monte o perfil das crianças em poucos minutos.
            </p>
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "mt-8 h-13 px-8 text-base")}>
              Começar agora
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- Rodapé */}
      <footer className="border-t border-grape-900/10 bg-white">
        <div className="page-x mx-auto flex max-w-6xl flex-col items-center gap-5 py-10 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
          <Logo className="text-base" iconClassName="h-8" />
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="#planos" className="hover:text-grape-700">Planos</Link>
            <Link href="/login" className="hover:text-grape-700">Entrar</Link>
            <Link href="/termos" className="hover:text-grape-700">Termos</Link>
            <Link href="/privacidade" className="hover:text-grape-700">Privacidade</Link>
          </nav>
          <p>© {new Date().getFullYear()} Arca Flix</p>
        </div>
      </footer>

      <MobileCtaBar />
    </div>
  )
}
