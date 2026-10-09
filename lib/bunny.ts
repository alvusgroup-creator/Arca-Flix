import "server-only"
import { createHash } from "node:crypto"
import { isBunnyConfigured, serverEnv } from "@/lib/env.server"

export interface VideoSource {
  /** URL HLS (.m3u8) pronta para o player. */
  src: string
  /** Legendas WebVTT opcionais. */
  captions: { src: string; label: string; lang: string }[]
  /** Vídeo público do YouTube (catálogo provisório): o player usa o embed. */
  youtubeId?: string
}

const TOKEN_TTL_SECONDS = 60 * 60 * 4

/**
 * Assina um diretório inteiro da CDN do Bunny (token authentication), para que
 * a playlist HLS e todos os segmentos herdem o token.
 * Documentação: https://docs.bunny.net/docs/cdn-token-authentication
 */
function signDirectory(videoId: string) {
  const host = serverEnv.bunnyCdnHost
  const tokenPath = `/${videoId}/`
  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const hashable = `${serverEnv.bunnyTokenKey}${tokenPath}${expires}token_path=${tokenPath}`
  const token = createHash("sha256")
    .update(hashable)
    .digest("base64")
    .replace(/\n/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
  return `https://${host}/bcdn_token=${token}&expires=${expires}&token_path=${encodeURIComponent(tokenPath)}${tokenPath}`
}

/**
 * Resolve a fonte de reprodução de um vídeo do Bunny Stream.
 * Só deve ser chamada depois de verificar sessão e assinatura.
 */
export function getVideoSource(videoId: string | null): VideoSource | null {
  // video_id "yt:<id>": vídeo do YouTube (catálogo provisório para a campanha).
  if (videoId?.startsWith("yt:")) return { src: "", captions: [], youtubeId: videoId.slice(3) }
  // Fase de validação (sem provedor de vídeo ligado): todos os títulos tocam o
  // stream de teste, para a experiência ficar completa. Com o Bunny configurado,
  // só toca quem tem video_id real.
  if (!isBunnyConfigured) return { src: serverEnv.demoVideoUrl, captions: [] }
  if (!videoId) return null

  const base = serverEnv.bunnyTokenKey
    ? signDirectory(videoId)
    : `https://${serverEnv.bunnyCdnHost}/${videoId}/`

  return {
    src: `${base}playlist.m3u8`,
    captions: [{ src: `${base}captions/pt.vtt`, label: "Português", lang: "pt" }],
  }
}

/** Metadados de um vídeo na API do Bunny Stream (usado no admin). */
export async function fetchBunnyVideo(videoId: string) {
  if (!serverEnv.bunnyApiKey || !serverEnv.bunnyLibraryId) return null
  const res = await fetch(
    `https://video.bunnycdn.com/library/${serverEnv.bunnyLibraryId}/videos/${videoId}`,
    { headers: { AccessKey: serverEnv.bunnyApiKey, accept: "application/json" }, cache: "no-store" }
  )
  if (!res.ok) return null
  const data = (await res.json()) as { length: number; thumbnailFileName: string; title: string }
  return {
    title: data.title,
    durationSeconds: data.length,
    thumbnailUrl: `https://${serverEnv.bunnyCdnHost}/${videoId}/${data.thumbnailFileName}`,
  }
}
