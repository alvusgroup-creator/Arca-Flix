// Mídia da landing num só lugar.
// Ao gerar as artes finais (prompts em docs/prompts-imagens.md), coloque os
// arquivos em public/landing/ e troque os caminhos abaixo.

export const landingMedia = {
  hero: {
    /** Capa do vídeo (e imagem usada quando o vídeo não toca). 16:9 */
    poster: "/landing/hero.jpg",
    /** Capa vertical para o celular. 9:16 — null = usa a horizontal */
    posterMobile: "/landing/hero-mobile.jpg" as string | null,
    /** Vídeo em loop do hero (MP4 H.264, sem áudio). null = só imagem */
    video: null as string | null,
    /** Versão vertical do vídeo para o celular (9:16). null = usa a horizontal */
    videoMobile: null as string | null,
  },
  moments: {
    watch: "/landing/momento-assistir.jpg",
    sing: "/landing/momento-cantar.jpg",
    color: "/landing/momento-colorir.jpg",
    learn: "/landing/momento-aprender.jpg",
  },
  parents: "/landing/pais-controle.jpg",
  cta: "/landing/cta-familia.jpg",
}
