import "server-only"
import { isDemoMode } from "@/lib/env"
import { serverEnv } from "@/lib/env.server"
import { createAdminClient } from "@/lib/supabase/admin"

const SIGNED_URL_TTL = 60 * 60 // 1h

/**
 * Converte um caminho de bucket privado (ex.: "audio/louvor/01.mp3") em URL
 * assinada temporária. URLs completas (CDN, R2 público) passam sem alteração.
 * Chamar apenas depois de verificar sessão e assinatura.
 */
export async function resolvePrivateMedia(bucket: "audio" | "coloring", pathOrUrl: string | null) {
  if (!pathOrUrl) return null
  if (/^https?:\/\//.test(pathOrUrl) || pathOrUrl.startsWith("/")) return pathOrUrl
  // Sem a service role (ainda não configurada) não há como assinar a URL.
  if (isDemoMode || !serverEnv.supabaseServiceRoleKey) return null

  const path = pathOrUrl.replace(new RegExp(`^${bucket}/`), "")
  const { data } = await createAdminClient().storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL)
  return data?.signedUrl ?? null
}
