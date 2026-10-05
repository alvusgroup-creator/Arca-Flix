"use client"

import { useEffect } from "react"

/** Regista o service worker (só em produção, para não interferir no dev). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined)
  }, [])
  return null
}
