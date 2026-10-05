import { isDemoMode } from "@/lib/env"

/** Aviso discreto quando a app corre sem Supabase (dados em cookies). */
export function DemoBanner() {
  if (!isDemoMode) return null
  return (
    <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold text-grape-600 shadow-soft">
      <span className="size-1.5 rounded-full bg-lilac-400" aria-hidden="true" />
      Modo demonstração — qualquer e-mail e senha (8+ caracteres) funcionam
    </p>
  )
}
