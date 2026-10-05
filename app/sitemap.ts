import type { MetadataRoute } from "next"
import { publicEnv } from "@/lib/env"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${publicEnv.appUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${publicEnv.appUrl}/plans`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${publicEnv.appUrl}/termos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${publicEnv.appUrl}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
  ]
}
