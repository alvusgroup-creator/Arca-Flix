// Primitivas de desenho para páginas de colorir (traço preto, preenchimento branco).
export const W = 1600
export const H = 1000
const S = 'stroke="#1b1b1b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"'
const THIN = 'stroke="#1b1b1b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"'
export const shape = (d, thin = false) => `<path d="${d}" fill="#fff" ${thin ? THIN : S}/>`
export const line = (d, thin = false) => `<path d="${d}" fill="none" ${thin ? THIN : S}/>`
export const circle = (cx, cy, r, thin = false) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" ${thin ? THIN : S}/>`
export const dot = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1b1b1b"/>`
export const ellipse = (cx, cy, rx, ry, rot = 0) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#fff" ${S}/>`

export function star(cx, cy, r, points = 5, inner = 0.45) {
  let d = ""
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 ? r * inner : r
    const a = (Math.PI / points) * i - Math.PI / 2
    d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`
  }
  return shape(d + "Z")
}

export function heart(cx, cy, s) {
  return shape(
    `M${cx} ${cy + s * 0.9} C${cx - s * 1.5} ${cy - s * 0.1} ${cx - s * 0.9} ${cy - s * 1.25} ${cx} ${cy - s * 0.45} C${cx + s * 0.9} ${cy - s * 1.25} ${cx + s * 1.5} ${cy - s * 0.1} ${cx} ${cy + s * 0.9}Z`
  )
}

export function cloud(cx, cy, s) {
  return shape(
    `M${cx - s * 1.6} ${cy + s * 0.5} a${s * 0.55} ${s * 0.55} 0 0 1 ${s * 0.2} -${s * 1.05} a${s * 0.75} ${s * 0.75} 0 0 1 ${s * 1.35} -${s * 0.45} a${s * 0.7} ${s * 0.7} 0 0 1 ${s * 1.3} ${s * 0.35} a${s * 0.55} ${s * 0.55} 0 0 1 ${s * 0.35} ${s * 1.15}Z`
  )
}

export function sun(cx, cy, r, rays = 12) {
  let out = ""
  for (let i = 0; i < rays; i++) {
    const a = ((Math.PI * 2) / rays) * i
    out += line(
      `M${cx + Math.cos(a) * (r + 18)} ${cy + Math.sin(a) * (r + 18)} L${cx + Math.cos(a) * (r + 48)} ${cy + Math.sin(a) * (r + 48)}`
    )
  }
  return out + circle(cx, cy, r) + dot(cx - r * 0.3, cy - r * 0.1, 6) + dot(cx + r * 0.3, cy - r * 0.1, 6) + line(`M${cx - r * 0.35} ${cy + r * 0.25} Q${cx} ${cy + r * 0.55} ${cx + r * 0.35} ${cy + r * 0.25}`, true)
}

export function flower(cx, cy, r) {
  let out = ""
  for (let i = 0; i < 6; i++) out += ellipse(cx + Math.cos((Math.PI / 3) * i) * r * 0.75, cy + Math.sin((Math.PI / 3) * i) * r * 0.75, r * 0.55, r * 0.38, i * 60)
  return line(`M${cx} ${cy + r * 0.6} L${cx} ${cy + r * 2.6}`) + shape(`M${cx} ${cy + r * 1.9} q${r * 0.9} -${r * 0.6} ${r * 1.2} 0 q-${r * 0.5} ${r * 0.5} -${r * 1.2} 0Z`) + out + circle(cx, cy, r * 0.45)
}

export function rainbow(cx, cy, r, bands = 4, band = 34) {
  let out = ""
  for (let i = 0; i < bands; i++) {
    const ro = r - i * band
    const ri = ro - band
    out += shape(`M${cx - ro} ${cy} A${ro} ${ro} 0 0 1 ${cx + ro} ${cy} L${cx + ri} ${cy} A${ri} ${ri} 0 0 0 ${cx - ri} ${cy}Z`)
  }
  return out
}

export function waves(y, from = 0, to = W, amp = 22, len = 120) {
  let d = `M${from} ${y}`
  for (let x = from; x < to; x += len) d += ` q${len / 4} -${amp} ${len / 2} 0 t${len / 2} 0`
  return d
}

export function grass(y, from = 40, to = W - 40) {
  let d = ""
  for (let x = from; x < to; x += 46) d += `M${x} ${y} l10 -26 M${x + 18} ${y} l-6 -34 M${x + 30} ${y} l12 -22 `
  return line(d, true)
}

export function bird(cx, cy, s) {
  return line(`M${cx - s} ${cy} q${s / 2} -${s * 0.7} ${s} 0 q${s / 2} -${s * 0.7} ${s} 0`, true)
}

/** Texto vazado (letras para colorir). */
export function hollowText(text, x, y, size, { anchor = "middle", family = "Fredoka", weight = 700, spacing = 2 } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-weight="${weight}" font-size="${size}" letter-spacing="${spacing}" fill="#fff" stroke="#1b1b1b" stroke-width="${Math.max(6, size / 11)}" paint-order="stroke" stroke-linejoin="round">${text}</text>`
}

export function solidText(text, x, y, size, { anchor = "middle", weight = 700, color = "#1b1b1b", family = "Nunito" } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-weight="${weight}" font-size="${size}" fill="${color}">${text}</text>`
}

export function page(body, { footer = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#fff"/>
  <defs><clipPath id="frame"><rect x="25" y="25" width="${W - 50}" height="${H - 50}" rx="34"/></clipPath></defs>
  <g clip-path="url(#frame)">${body}</g>
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="36" fill="none" stroke="#1b1b1b" stroke-width="6"/>
  ${footer ? solidText("arcaflix · para colorir", W - 60, H - 40, 22, { anchor: "end", weight: 600, color: "#9a9a9a" }) : ""}
</svg>`
}

/** Gerador pseudoaleatório com semente (resultados estáveis entre execuções). */
export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
