import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arca Flix",
    short_name: "Arca Flix",
    description: "Streaming cristão para crianças e famílias.",
    start_url: "/browse",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0E0A1A",
    theme_color: "#0E0A1A",
    lang: "pt-BR",
    categories: ["entertainment", "education", "kids"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
