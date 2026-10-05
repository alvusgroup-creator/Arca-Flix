import { ChevronDown } from "lucide-react"

const ITEMS = [
  {
    q: "O conteúdo é seguro para crianças pequenas?",
    a: "Sim. Todo o catálogo é cristão e pensado para a família. Cada título tem classificação indicativa e os perfis infantis só mostram o que é adequado à idade que você escolher.",
  },
  {
    q: "Tem anúncios?",
    a: "Não. Nenhum anúncio, nem antes, nem durante os vídeos.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Pode. Você cancela em Configurações › Assinatura, sem ligação e sem multa. O acesso continua até o fim do período já pago.",
  },
  {
    q: "Em quais aparelhos funciona?",
    a: "No celular, no tablet e no computador, direto pelo navegador. Também dá para instalar como aplicativo na tela inicial do celular.",
  },
  {
    q: "Quantos filhos podem usar?",
    a: "Cada plano permite vários perfis — um para cada pessoa da casa, com histórico, lista e controle parental separados. Veja o limite de cada plano acima.",
  },
  {
    q: "Os desenhos para colorir podem ser impressos?",
    a: "Sim. Você baixa, imprime em casa e pode usar com os filhos, na escola dominical ou no ministério infantil.",
  },
]

export function Faq() {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-grape-900/10 border-y border-grape-900/10">
      {ITEMS.map(({ q, a }) => (
        <details key={q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-heading text-[1.05rem] font-semibold text-grape-900 [&::-webkit-details-marker]:hidden">
            {q}
            <ChevronDown className="size-5 shrink-0 text-grape-500 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="pb-5 leading-relaxed text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  )
}
