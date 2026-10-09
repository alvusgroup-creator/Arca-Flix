import {
  W, H, shape, line, circle, dot, ellipse, star, heart, cloud, sun, flower, rainbow, waves, grass, bird,
  hollowText, solidText, page, rng,
} from "./draw.mjs"

// ---------------------------------------------------------------- Cenas
function ark() {
  const hull = shape("M330 610 L1270 610 L1180 790 Q800 840 420 790 Z")
  const planks = line("M360 670 L1240 670 M395 730 L1205 730", true)
  const cabin = shape("M500 430 L1100 430 L1100 610 L500 610 Z")
  const roof = shape("M460 440 L800 290 L1140 440 Z")
  const windows = circle(600, 515, 58) + circle(800, 515, 58) + circle(1000, 515, 58)
  const lionHead = (cx, cy) => { let m = ""; for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i; m += circle(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30, 16, true) } return m + circle(cx, cy, 30, true) + dot(cx - 10, cy - 5, 4) + dot(cx + 10, cy - 5, 4) + line(`M${cx - 8} ${cy + 10} Q${cx} ${cy + 16} ${cx + 8} ${cy + 10}`, true) }
  const elephantHead = (cx, cy) => circle(cx - 32, cy - 4, 22, true) + circle(cx + 32, cy - 4, 22, true) + circle(cx, cy, 30, true) + line(`M${cx} ${cy + 18} Q${cx + 2} ${cy + 46} ${cx + 22} ${cy + 44}`) + dot(cx - 10, cy - 6, 4) + dot(cx + 10, cy - 6, 4)
  const giraffeHead = (cx, cy) => shape(`M${cx - 16} ${cy + 48} L${cx - 14} ${cy - 6} Q${cx - 20} ${cy - 36} ${cx + 2} ${cy - 40} Q${cx + 28} ${cy - 40} ${cx + 22} ${cy - 10} L${cx + 14} ${cy + 48} Z`, true) + line(`M${cx - 8} ${cy - 40} L${cx - 12} ${cy - 60} M${cx + 10} ${cy - 40} L${cx + 14} ${cy - 60}`, true) + circle(cx - 12, cy - 64, 6, true) + circle(cx + 14, cy - 64, 6, true) + dot(cx - 2, cy - 22, 4) + dot(cx + 12, cy - 22, 4) + circle(cx - 4, cy + 14, 6, true) + circle(cx + 6, cy + 32, 5, true)
  const giraffe = giraffeHead(600, 515)
  const elephant = elephantHead(1000, 510) + lionHead(800, 515)
  const sea = shape(`${waves(800, 0, W, 26, 140)} L${W} 870 L0 870 Z`) + line(waves(840, 0, W, 16, 110), true)
  const dove =
    shape("M1250 230 Q1300 200 1340 230 Q1370 215 1395 225 Q1375 245 1350 250 Q1320 275 1270 262 Q1245 255 1250 230 Z") +
    shape("M1290 238 Q1310 180 1350 175 Q1335 215 1318 245 Z", true) + dot(1376, 228, 5) +
    shape("M1395 232 q30 -6 40 10 q-24 8 -40 -10Z", true)
  return page(
    rainbow(800, 430, 700, 5, 40) + sun(220, 200, 70) + cloud(1180, 150, 70) + cloud(420, 140, 55) +
      roof + cabin + windows + giraffe + elephant + hull + planks + sea + dove +
      hollowText("A ARCA DE NOÉ", 800, 945, 62),
    { footer: false }
  )
}

function lion() {
  let mane = ""
  for (let i = 0; i < 14; i++) {
    const a = ((Math.PI * 2) / 14) * i
    mane += ellipse(800 + Math.cos(a) * 205, 470 + Math.sin(a) * 205, 95, 70, (a * 180) / Math.PI)
  }
  const face =
    circle(800, 470, 200) + ellipse(650, 330, 48, 48) + ellipse(950, 330, 48, 48) + circle(650, 330, 22, true) + circle(950, 330, 22, true) +
    ellipse(725, 430, 26, 34) + ellipse(875, 430, 26, 34) + dot(728, 438, 13) + dot(878, 438, 13) +
    shape("M770 500 L830 500 L800 535 Z") + line("M800 535 L800 565 M800 565 Q770 595 740 575 M800 565 Q830 595 860 575") +
    line("M700 530 L610 515 M700 550 L612 560 M900 530 L990 515 M900 550 L988 560", true) +
    dot(745, 545, 4) + dot(760, 560, 4) + dot(840, 545, 4) + dot(855, 560, 4)
  return page(
    sun(1380, 190, 60) + cloud(240, 170, 60) + star(1360, 520, 34) + star(250, 520, 28) + flower(200, 760, 34) + flower(1400, 760, 34) +
      mane + face +
      hollowText("DEUS FECHOU A BOCA DOS LEÕES", 800, 860, 60) + solidText("Daniel 6.22", 800, 920, 34, { weight: 700 }),
    { footer: false }
  )
}

function jonah() {
  const body = shape("M260 520 Q300 330 620 330 Q960 330 1080 470 Q1160 450 1230 380 Q1260 470 1210 540 Q1260 610 1240 690 Q1170 630 1080 610 Q960 760 620 760 Q300 760 260 520 Z")
  const belly = line("M330 600 Q600 700 960 640 M360 650 Q600 735 900 690", true)
  const eye = circle(420, 470, 38) + dot(428, 476, 18)
  const smile = line("M285 560 Q340 600 400 585")
  const spout = line("M560 320 Q540 230 500 200 M560 320 Q560 220 560 180 M560 320 Q580 230 620 200") + circle(495, 190, 14, true) + circle(560, 168, 14, true) + circle(625, 190, 14, true)
  const jonas =
    circle(740, 230, 42) + dot(728, 225, 5) + dot(752, 225, 5) + line("M726 248 Q740 260 754 248", true) +
    shape("M700 270 L780 270 L795 330 L685 330 Z") + line("M700 285 L655 250 M780 285 L825 250")
  const sea = shape(`${waves(800, 0, W, 24, 130)} L${W} 875 L0 875 Z`)
  const bubbles = ""
  return page(
    sun(1400, 150, 55) + cloud(250, 150, 55) + cloud(950, 140, 48) + bird(1150, 200, 26) + bird(1220, 170, 20) +
      body + belly + eye + smile + spout + jonas + bubbles + sea + line(waves(845, 0, W, 14, 100), true) +
      hollowText("JONAS E O GRANDE PEIXE", 800, 948, 58),
    { footer: false }
  )
}

function sheep() {
  const pts = 16, cx0 = 760, cy0 = 560, rx = 250, ry = 150
  const px = (a, k = 1) => (cx0 + Math.cos(a) * rx * k).toFixed(1), py = (a, k = 1) => (cy0 + Math.sin(a) * ry * k).toFixed(1)
  let wool = `M${px(0)} ${py(0)}`
  for (let i = 0; i < pts; i++) {
    const a = ((Math.PI * 2) / pts) * i, b = ((Math.PI * 2) / pts) * (i + 1), m = (a + b) / 2
    wool += ` Q${px(m, 1.28)} ${py(m, 1.28)} ${px(b)} ${py(b)}`
  }
  const legs = shape("M600 660 L600 790 L645 790 L645 670 Z") + shape("M690 680 L690 800 L735 800 L735 680 Z") + shape("M800 680 L800 800 L845 800 L845 680 Z") + shape("M880 660 L880 790 L925 790 L925 670 Z")
  const head = ellipse(970, 400, 55, 26, -35) + ellipse(1150, 390, 55, 26, 25) + ellipse(1060, 450, 95, 115, -10) + ellipse(1030, 440, 15, 20) + ellipse(1090, 440, 15, 20) + dot(1032, 446, 8) + dot(1092, 446, 8) + line("M1040 510 Q1062 530 1084 510", true)
  const curls = circle(1035, 340, 26, true) + circle(1080, 332, 26, true)
  return page(
    sun(220, 180, 65) + cloud(1350, 160, 65) + cloud(800, 140, 45) + bird(560, 200, 26) +
      legs + shape(wool + "Z") + head + curls + flower(240, 620, 38) + flower(1400, 620, 34) + flower(1260, 700, 28) + grass(810) +
      hollowText("A OVELHA PERDIDA", 800, 905, 62) + solidText("Lucas 15", 800, 955, 32),
    { footer: false }
  )
}

function nativity() {
  const bigStar = star(800, 200, 110, 5, 0.5) + line("M800 310 L800 380 M720 280 L660 340 M880 280 L940 340", true)
  const hill = shape("M40 860 Q400 700 800 760 Q1200 700 1560 860 L1560 930 L40 930 Z")
  const crib = shape("M610 640 L990 640 L940 760 L660 760 Z") + line("M640 780 L700 640 M960 780 L900 640") + line("M640 620 L680 640 M700 615 L720 640 M760 612 L770 640 M840 612 L830 640 M900 615 L880 640 M960 620 L920 640", true)
  const baby = ellipse(800, 610, 150, 55) + circle(700, 585, 48) + dot(686, 582, 5) + dot(712, 582, 5) + line("M690 602 Q700 612 712 602", true) + line("M760 590 Q800 630 860 590 M800 575 L800 655", true)
  let smallStars = ""
  for (const [x, y, r] of [[230, 160, 30], [380, 280, 22], [1220, 180, 32], [1380, 320, 24], [260, 420, 20], [1340, 470, 22]]) smallStars += star(x, y, r)
  const animals = ellipse(380, 700, 110, 70) + ellipse(300, 620, 50, 60, -20) + dot(290, 615, 6) + line("M250 590 L225 560 M325 575 L340 545", true) + ellipse(1220, 700, 120, 75) + circle(1330, 640, 55) + dot(1342, 632, 6) + ellipse(1320, 600, 30, 16, -30) + ellipse(1375, 610, 30, 16, 30)
  return page(
    bigStar + smallStars + hill + animals + crib + baby + hollowText("NASCEU JESUS!", 800, 900, 72),
    { footer: false }
  )
}

function creation() {
  const moon = shape("M1380 140 A90 90 0 1 0 1440 300 A70 70 0 1 1 1380 140 Z")
  const tree = shape("M380 760 L380 560 L430 560 L430 760 Z") + cloud(405, 520, 95) + circle(350, 470, 18, true) + circle(450, 500, 18, true) + circle(400, 440, 18, true)
  const fish = shape("M1000 790 Q1060 740 1130 790 Q1060 840 1000 790 Z") + shape("M1000 790 L960 760 L960 820 Z") + dot(1100, 785, 5) + shape("M1180 840 Q1230 805 1280 840 Q1230 875 1180 840 Z", true) + shape("M1180 840 L1150 818 L1150 862 Z", true)
  const sea = shape("M880 760 Q1100 720 1560 760 L1560 930 L880 930 Z") + line(waves(880, 900, 1540, 14, 90), true)
  const land = shape("M40 930 L40 760 Q300 690 600 740 Q760 760 880 760 L880 930 Z")
  const bunny = ellipse(690, 700, 55, 42) + ellipse(735, 650, 30, 32) + ellipse(725, 600, 12, 38, -10) + ellipse(750, 602, 12, 38, 15) + dot(742, 648, 5) + circle(640, 700, 16, true)
  return page(
    sun(260, 190, 70) + moon + star(1180, 140, 26) + star(1260, 260, 20) + star(1500, 380, 22) + cloud(820, 150, 55) + bird(560, 230, 28) + bird(630, 200, 20) +
      land + sea + tree + flower(180, 690, 30) + flower(560, 680, 26) + bunny + fish +
      hollowText("NO PRINCÍPIO, DEUS CRIOU", 800, 365, 70) + solidText("Gênesis 1.1", 800, 415, 34),
    { footer: false }
  )
}

function easter() {
  const hill = shape("M40 900 Q500 470 1000 560 Q1350 620 1560 760 L1560 930 L40 930 Z")
  const tomb = shape("M560 860 L560 700 A150 150 0 0 1 860 700 L860 860 Z")
  const stone = circle(1010, 800, 105) + line("M960 760 Q1000 740 1040 770 M970 840 Q1010 860 1050 830", true)
  const crosses = [[1250, 470, 1], [1340, 520, 0.7], [1170, 530, 0.7]].map(([x, y, s]) => shape(`M${x - 10 * s} ${y} L${x + 10 * s} ${y} L${x + 10 * s} ${y - 60 * s} L${x + 40 * s} ${y - 60 * s} L${x + 40 * s} ${y - 80 * s} L${x + 10 * s} ${y - 80 * s} L${x + 10 * s} ${y - 120 * s} L${x - 10 * s} ${y - 120 * s} L${x - 10 * s} ${y - 80 * s} L${x - 40 * s} ${y - 80 * s} L${x - 40 * s} ${y - 60 * s} L${x - 10 * s} ${y - 60 * s} Z`)).join("")
  return page(
    sun(300, 260, 90, 16) + cloud(1300, 170, 60) + bird(800, 220, 30) + bird(880, 190, 22) +
      hill + crosses + tomb + stone + flower(300, 780, 36) + flower(440, 820, 28) + flower(1250, 800, 32) + flower(1420, 830, 28) +
      hollowText("ELE VIVE!", 800, 160, 110),
    { footer: false }
  )
}

// ---------------------------------------------------------------- Versículos
function verse(lines, ref, deco) {
  const size = lines.length > 2 ? 110 : 130
  const top = H / 2 - ((lines.length - 1) * size * 1.05) / 2 + size * 0.35
  const text = lines.map((l, i) => hollowText(l, 800, top + i * size * 1.05, size)).join("")
  return page(deco + text + solidText(ref, 800, top + lines.length * size * 1.05 + 10, 40), { footer: true })
}
const decoA = sun(170, 170, 55) + cloud(1400, 150, 60) + heart(170, 830, 50) + heart(1430, 830, 50) + star(1430, 420, 30) + star(170, 450, 26) + flower(320, 820, 30) + flower(1280, 820, 30)
const decoB = star(170, 160, 46) + star(1430, 160, 46) + star(320, 110, 24) + star(1280, 110, 24) + flower(170, 760, 40) + flower(1430, 760, 40) + heart(800, 880, 40)
const decoC = cloud(260, 150, 60) + cloud(1340, 150, 60) + rainbow(800, 220, 170, 3, 30) + heart(160, 800, 46) + heart(1440, 800, 46) + grass(910, 60, 1540)
const decoD = sun(1420, 170, 55) + bird(220, 160, 30) + bird(300, 120, 22) + flower(170, 760, 38) + flower(300, 820, 28) + flower(1300, 820, 28) + flower(1430, 760, 38) + star(170, 420, 26)

// ---------------------------------------------------------------- Caça-palavras
function wordSearch(title, words, seed) {
  const N = 12
  const rand = rng(seed)
  const grid = Array.from({ length: N }, () => Array(N).fill(""))
  for (const w of words) {
    for (let tries = 0; tries < 500; tries++) {
      const vertical = rand() < 0.5
      const r = Math.floor(rand() * (vertical ? N - w.length + 1 : N))
      const c = Math.floor(rand() * (vertical ? N : N - w.length + 1))
      const fits = [...w].every((ch, i) => {
        const cell = vertical ? grid[r + i][c] : grid[r][c + i]
        return cell === "" || cell === ch
      })
      if (!fits) continue
      ;[...w].forEach((ch, i) => (vertical ? (grid[r + i][c] = ch) : (grid[r][c + i] = ch)))
      break
    }
  }
  const ABC = "ABCDEFGHIJLMNOPRSTUV"
  const cell = 58, gx = 120, gy = 200
  let out = `<rect x="${gx - 14}" y="${gy - 14}" width="${N * cell + 28}" height="${N * cell + 28}" rx="24" fill="#fff" stroke="#1b1b1b" stroke-width="6"/>`
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const ch = grid[r][c] || ABC[Math.floor(rand() * ABC.length)]
      out += solidText(ch, gx + c * cell + cell / 2, gy + r * cell + cell * 0.72, 38, { weight: 800 })
    }
  const lx = 1000
  out += solidText("Encontre as palavras:", lx, 240, 40, { anchor: "start", weight: 800 })
  words.forEach((w, i) => {
    const y = 310 + i * 64
    out += `<rect x="${lx}" y="${y - 32}" width="36" height="36" rx="8" fill="#fff" stroke="#1b1b1b" stroke-width="5"/>`
    out += solidText(w, lx + 56, y - 2, 38, { anchor: "start", weight: 700 })
  })
  return page(hollowText(title, 800, 140, 74) + out + star(1460, 860, 40) + heart(1340, 880, 34))
}

// ---------------------------------------------------------------- Labirinto
function maze(title, startLabel, endLabel, seed) {
  const cols = 18, rows = 10, cell = 66, ox = 206, oy = 230
  const rand = rng(seed)
  const walls = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ n: true, s: true, e: true, w: true })))
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false))
  const stack = [[0, 0]]
  seen[0][0] = true
  while (stack.length) {
    const [r, c] = stack[stack.length - 1]
    const opts = [[r - 1, c, "n", "s"], [r + 1, c, "s", "n"], [r, c + 1, "e", "w"], [r, c - 1, "w", "e"]].filter(([rr, cc]) => rr >= 0 && rr < rows && cc >= 0 && cc < cols && !seen[rr][cc])
    if (!opts.length) { stack.pop(); continue }
    const [rr, cc, a, b] = opts[Math.floor(rand() * opts.length)]
    walls[r][c][a] = false
    walls[rr][cc][b] = false
    seen[rr][cc] = true
    stack.push([rr, cc])
  }
  walls[0][0].w = false
  walls[rows - 1][cols - 1].e = false
  let d = ""
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = ox + c * cell, y = oy + r * cell, w = walls[r][c]
      if (w.n) d += `M${x} ${y} L${x + cell} ${y} `
      if (w.w) d += `M${x} ${y} L${x} ${y + cell} `
      if (r === rows - 1 && w.s) d += `M${x} ${y + cell} L${x + cell} ${y + cell} `
      if (c === cols - 1 && w.e) d += `M${x + cell} ${y} L${x + cell} ${y + cell} `
    }
  const mx = ox + cols * cell
  return page(
    hollowText(title, 800, 150, 70) + line(d) +
      star(ox - 90, oy + cell / 2, 42) + solidText(startLabel, ox - 90, oy + cell + 70, 30, { weight: 800 }) +
      heart(mx + 90, oy + (rows - 1) * cell + cell / 2, 44) + solidText(endLabel, mx + 90, oy + rows * cell + 50, 30, { weight: 800 })
  )
}

// ---------------------------------------------------------------- Catálogo
export const pages = [
  { slug: "colorir-arca-de-noe", title: "A Arca de Noé", category: "arca-de-noe", age: [3, 8], svg: ark(), description: "Noé, a arca, os animais e o arco-íris da promessa de Deus para colorir." },
  { slug: "colorir-daniel-e-o-leao", title: "Daniel e o Leão", category: "daniel", age: [3, 9], svg: lion(), description: "Um leão bem manso — Deus fechou a boca dos leões para proteger Daniel." },
  { slug: "colorir-jonas-e-o-grande-peixe", title: "Jonas e o Grande Peixe", category: "animais", age: [3, 9], svg: jonah(), description: "Jonas, o grande peixe e o mar para pintar." },
  { slug: "colorir-a-ovelha-perdida", title: "A Ovelha Perdida", category: "animais", age: [3, 8], svg: sheep(), description: "A ovelhinha que o pastor foi buscar — Jesus cuida de cada um de nós." },
  { slug: "colorir-nasceu-jesus", title: "Nasceu Jesus!", category: "jesus", age: [3, 9], svg: nativity(), description: "A estrela, a manjedoura e o menino Jesus para colorir no Natal." },
  { slug: "colorir-a-criacao", title: "No Princípio, Deus Criou", category: "animais", age: [3, 9], svg: creation(), description: "O sol, a lua, as estrelas, as plantas e os animais que Deus criou." },
  { slug: "colorir-ele-vive", title: "Ele Vive!", category: "jesus", age: [4, 10], svg: easter(), description: "O túmulo vazio e o sol da manhã de Páscoa." },
  { slug: "versiculo-deus-e-amor", title: "Versículo: Deus é Amor", category: "versiculos", age: [4, 12], svg: verse(["DEUS", "É AMOR"], "1 João 4.8", decoA), description: "Letras grandes para colorir e decorar o quarto." },
  { slug: "versiculo-o-senhor-e-meu-pastor", title: "Versículo: O Senhor é o Meu Pastor", category: "versiculos", age: [5, 12], svg: verse(["O SENHOR É", "O MEU PASTOR"], "Salmo 23.1", decoD), description: "O começo do Salmo 23 em letras para pintar." },
  { slug: "versiculo-seja-forte-e-corajoso", title: "Versículo: Seja Forte e Corajoso", category: "versiculos", age: [5, 12], svg: verse(["SEJA FORTE", "E CORAJOSO"], "Josué 1.9", decoB), description: "A promessa que Deus fez a Josué, para lembrar todo dia." },
  { slug: "versiculo-deus-cuida-de-mim", title: "Versículo: Deus Cuida de Mim", category: "versiculos", age: [4, 12], svg: verse(["DEUS", "CUIDA", "DE MIM"], "1 Pedro 5.7", decoC), description: "Para colorir e lembrar que Deus cuida de nós." },
  { slug: "versiculo-tudo-posso", title: "Versículo: Tudo Posso", category: "versiculos", age: [6, 12], svg: verse(["TUDO POSSO", "NAQUELE QUE", "ME FORTALECE"], "Filipenses 4.13", decoA), description: "Filipenses 4.13 em letras vazadas." },
  { slug: "versiculo-alegrem-se", title: "Versículo: Alegrem-se no Senhor", category: "versiculos", age: [5, 12], svg: verse(["ALEGREM-SE", "SEMPRE NO", "SENHOR!"], "Filipenses 4.4", decoD), description: "Um versículo bem alegre para colorir." },
  { slug: "versiculo-eu-e-minha-casa", title: "Versículo: Eu e Minha Casa", category: "versiculos", age: [6, 12], svg: verse(["EU E MINHA CASA", "SERVIREMOS", "AO SENHOR"], "Josué 24.15", decoB), description: "Para pintar em família e pendurar na porta de casa." },
  { slug: "caca-palavras-arca-de-noe", title: "Caça-palavras: Animais da Arca", category: "atividades", age: [6, 11], svg: wordSearch("ANIMAIS DA ARCA", ["LEAO", "ZEBRA", "GIRAFA", "POMBA", "OVELHA", "CAVALO", "URSO", "MACACO"], 7), description: "Encontre os animais que entraram na arca de Noé." },
  { slug: "caca-palavras-herois-da-biblia", title: "Caça-palavras: Heróis da Bíblia", category: "atividades", age: [6, 11], svg: wordSearch("HERÓIS DA BÍBLIA", ["DAVI", "DANIEL", "MOISES", "ESTER", "JONAS", "NOE", "RUTE", "JOSE"], 11), description: "Ache os nomes dos heróis da Bíblia escondidos nas letras." },
  { slug: "caca-palavras-fruto-do-espirito", title: "Caça-palavras: Fruto do Espírito", category: "atividades", age: [7, 12], svg: wordSearch("FRUTO DO ESPÍRITO", ["AMOR", "ALEGRIA", "PAZ", "PACIENCIA", "BONDADE", "FE", "MANSIDAO"], 23), description: "As qualidades do fruto do Espírito (Gálatas 5.22) para encontrar." },
  { slug: "caca-palavras-natal", title: "Caça-palavras: Natal de Jesus", category: "atividades", age: [6, 11], svg: wordSearch("NATAL DE JESUS", ["JESUS", "MARIA", "JOSE", "ESTRELA", "ANJO", "PASTOR", "MAGOS", "BELEM"], 31), description: "As palavras da história do nascimento de Jesus." },
  { slug: "labirinto-ovelhinha", title: "Labirinto: Ajude a Ovelhinha", category: "atividades", age: [4, 10], svg: maze("AJUDE A OVELHINHA", "Ovelha", "Pastor", 5), description: "Leve a ovelhinha perdida de volta ao pastor." },
  { slug: "labirinto-arca", title: "Labirinto: Caminho da Arca", category: "atividades", age: [5, 10], svg: maze("O CAMINHO DA ARCA", "Animais", "Arca", 19), description: "Ajude os animais a chegarem à arca antes da chuva." },
  { slug: "labirinto-mar-vermelho", title: "Labirinto: Mar Vermelho", category: "atividades", age: [6, 11], svg: maze("ATRAVESSE O MAR", "Egito", "Terra livre", 42), description: "Ajude o povo de Deus a atravessar o Mar Vermelho." },
]
