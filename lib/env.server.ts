import "server-only"

// Segredos: nunca importar este arquivo em componentes de cliente.
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  bunnyApiKey: process.env.BUNNY_API_KEY ?? "",
  bunnyLibraryId: process.env.BUNNY_LIBRARY_ID ?? "",
  bunnyCdnHost: (process.env.BUNNY_CDN_HOST ?? "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
  bunnyTokenKey: process.env.BUNNY_TOKEN_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Arca Flix <no-reply@arcaflix.app>",
  demoAudioUrl: process.env.DEMO_AUDIO_URL ?? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  demoVideoUrl:
    process.env.DEMO_VIDEO_URL ?? "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
}

export const isStripeConfigured = Boolean(serverEnv.stripeSecretKey)
export const isBunnyConfigured = Boolean(serverEnv.bunnyCdnHost)
export const isResendConfigured = Boolean(serverEnv.resendApiKey)
