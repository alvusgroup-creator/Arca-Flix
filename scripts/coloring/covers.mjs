import { chromium } from "playwright-core"
import fs from "node:fs"
import { star, heart, sun, circle, ellipse, dot, shape, line, cloud, waves, flower } from "./draw.mjs"
const { studies } = await import("../studies-catalog.mts")
const tint = (svg, color) => svg.replaceAll('fill="#fff"', `fill="${color}"`)
const icons = {
  star: () => tint(star(0, 0, 170, 5, 0.5), "#fcd34d") + tint(star(190, -150, 50), "#fde68a") + tint(star(-190, 140, 40), "#fde68a"),
  heart: () => tint(heart(0, 20, 150), "#f9a8d4") + tint(heart(170, -140, 45), "#fbcfe8"),
  sun: () => tint(sun(0, 0, 120, 14), "#fcd34d"),
  lion: () => { let m = ""; for (let i = 0; i < 12; i++) { const a = (Math.PI / 6) * i; m += ellipse(Math.cos(a) * 125, Math.sin(a) * 125, 62, 46, (a * 180) / Math.PI) } return tint(m, "#f59e0b") + tint(circle(0, 0, 120), "#fcd34d") + ellipse(-42, -20, 16, 21) + ellipse(42, -20, 16, 21) + dot(-40, -16, 8) + dot(44, -16, 8) + tint(shape("M-18 20 L18 20 L0 42 Z"), "#92400e") + line("M0 42 L0 58 M0 58 Q-20 78 -38 64 M0 58 Q20 78 38 64", true) },
  wave: () => tint(shape(`${waves(40, -260, 260, 40, 130)} L260 220 L-260 220 Z`), "#60a5fa") + tint(shape(`${waves(-60, -260, 260, 34, 110)} L260 40 L-260 40 Z`), "#93c5fd") + tint(cloud(60, -160, 55), "#fff") ,
  sheep: () => tint(cloud(0, 20, 120), "#fff") + tint(ellipse(150, -40, 55, 66), "#fde4cf") + dot(135, -48, 6) + dot(165, -48, 6),
  crown: () => tint(shape("M-180 100 L-180 -60 L-90 20 L0 -110 L90 20 L180 -60 L180 100 Z"), "#fcd34d") + tint(circle(0, 50, 26), "#f472b6") + tint(circle(-110, 60, 18), "#a78bfa") + tint(circle(110, 60, 18), "#60a5fa"),
  tree: () => tint(shape("M-26 200 L-26 40 L26 40 L26 200 Z"), "#b45309") + tint(cloud(0, 10, 130), "#86efac") + tint(circle(-70, -60, 22), "#f87171") + tint(circle(60, -20, 22), "#f87171") + tint(circle(10, -110, 22), "#f87171"),
  cross: () => tint(sun(0, 0, 130, 16), "#fde68a") + tint(shape("M-22 140 L22 140 L22 -20 L80 -20 L80 -60 L22 -60 L22 -140 L-22 -140 L-22 -60 L-80 -60 L-80 -20 L-22 -20 Z"), "#fff"),
  dove: () => tint(shape("M-180 30 Q-60 -60 60 0 Q120 -40 190 -20 Q150 30 90 40 Q20 110 -120 80 Q-200 70 -180 30 Z"), "#fff") + tint(shape("M-40 0 Q0 -170 120 -190 Q70 -70 30 20 Z", true), "#e9d5ff") + dot(150, -16, 7) + tint(flower(-190, -150, 30), "#f9a8d4"),
}
const kindLabel = { devocional: "Devocional", historia: "História", estudo: "Estudo", atividade: "Atividade", versiculo: "Versículo" }
const out = new URL("./covers/", import.meta.url); fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ channel: "chrome" })
const pg = await browser.newPage({ viewport: { width: 1280, height: 720 } })
const deco = `<svg width="1280" height="720" style="left:0;top:0" viewBox="0 0 1280 720">${star(150, 140, 30).replaceAll("fill=\"#fff\"","fill=\"#ffffffcc\"")}${star(1120, 580, 36).replaceAll("fill=\"#fff\"","fill=\"#ffffffcc\"")}${heart(1130, 150, 26).replaceAll("fill=\"#fff\"","fill=\"#ffffffcc\"")}${heart(160, 590, 22).replaceAll("fill=\"#fff\"","fill=\"#ffffffcc\"")}</svg>`
for (const s of studies) {
  const html = `<html><head><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@700;800&display=block" rel="stylesheet"><style>
  body{margin:0;width:1280px;height:720px;background:${s.cover.bg};font-family:Nunito;position:relative;overflow:hidden}
  .txt{position:absolute;left:80px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center}
  .pill{align-self:flex-start;background:#fff;color:#6b21a8;font-weight:800;font-size:26px;padding:10px 22px;border-radius:999px;letter-spacing:2px;text-transform:uppercase}
  h1{font-family:Fredoka;font-weight:700;color:#2e1065;font-size:${s.title.length > 34 ? 64 : 74}px;line-height:1.02;margin:26px 0 18px}
  p{margin:0;color:#4c1d95;font-size:30px;font-weight:800;opacity:.75}
  svg{position:absolute;left:390px;top:110px}</style></head><body>
  
  <svg width="500" height="500" viewBox="-260 -260 520 520">${icons[s.cover.icon]()}</svg>${deco}</body></html>`
  await pg.setContent(html, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready)
  await pg.screenshot({ path: new URL(`${s.slug}.jpg`, out).pathname.slice(1), type: "jpeg", quality: 88 })
}
await browser.close(); console.log("ok", studies.length)
