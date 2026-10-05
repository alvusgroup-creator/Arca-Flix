import type { MetadataRoute } from "next"
import { publicEnv } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/plans", "/termos", "/privacidade"],
      disallow: ["/browse", "/profiles", "/settings", "/admin", "/watch", "/content", "/api", "/checkout", "/success"],
    },
    sitemap: `${publicEnv.appUrl}/sitemap.xml`,
  }
}
