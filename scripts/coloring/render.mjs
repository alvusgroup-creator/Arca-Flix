// Gera os desenhos para colorir (PNG 1600×1000 para a pintura online + PDF A4 para imprimir).
// Requer o Chrome instalado e: npm i -D playwright-core
//   node scripts/coloring/render.mjs        → todos, em scripts/coloring/out/
//   node scripts/coloring/covers.mjs        → capas dos estudos, em scripts/coloring/covers/
// Depois: copie covers/ para out/covers e rode npm run db:materials -- scripts/coloring/out
// (o manifest.json é gerado junto).
import { chromium } from "playwright-core"
import fs from "node:fs"
import { pages } from "./pages.mjs"
const only = process.argv[2]
const out = new URL("./out/", import.meta.url)
fs.mkdirSync(out, { recursive: true })
const fonts = `<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@600;700;800&display=block" rel="stylesheet">`
const browser = await chromium.launch({ channel: "chrome" })
const pg = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
for (const p of pages.filter((p) => !only || only.split(",").includes(p.slug))) {
  await pg.setContent(`<html><head>${fonts}<style>@page{size:A4 landscape;margin:0}html,body{margin:0}svg{display:block;width:100%;height:auto}</style></head><body>${p.svg}</body></html>`, { waitUntil: "networkidle" })
  await pg.evaluate(() => document.fonts.ready)
  await pg.screenshot({ path: new URL(`${p.slug}.png`, out).pathname.slice(1), clip: { x: 0, y: 0, width: 1600, height: 1000 } })
  if (!only) await pg.pdf({ path: new URL(`${p.slug}.pdf`, out).pathname.slice(1), format: "A4", landscape: true, printBackground: true, pageRanges: "1" })
  console.log("ok", p.slug)
}
fs.writeFileSync(new URL("manifest.json", out), JSON.stringify(pages.map(({ svg, ...rest }) => rest), null, 1))
await browser.close()
