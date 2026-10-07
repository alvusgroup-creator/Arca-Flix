// Dados de DEMONSTRAÇÃO. Usados apenas quando o Supabase não está configurado
// (e espelhados em supabase/seed.sql). Nenhuma regra de negócio depende deles.

import type {
  Category,
  ColoringMaterial,
  Content,
  ContentType,
  MusicCollection,
  NotificationItem,
  Season,
  Study,
  SubscriptionPlan,
} from "@/types"

const img = (name: string) => `/demo/${name}.jpg`

export const demoCategories: Category[] = [
  { id: "cat-antigo", slug: "antigo-testamento", name: "Antigo Testamento" },
  { id: "cat-novo", slug: "novo-testamento", name: "Novo Testamento" },
  { id: "cat-arca", slug: "arca-de-noe", name: "Arca de Noé" },
  { id: "cat-jesus", slug: "jesus", name: "Jesus" },
  { id: "cat-daniel", slug: "daniel", name: "Daniel" },
  { id: "cat-moises", slug: "moises", name: "Moisés" },
  { id: "cat-animais", slug: "animais", name: "Animais da Bíblia" },
  { id: "cat-versiculos", slug: "versiculos", name: "Versículos" },
  { id: "cat-atividades", slug: "atividades", name: "Atividades" },
  { id: "cat-louvor", slug: "louvor", name: "Louvor infantil" },
  { id: "cat-dormir", slug: "dormir", name: "Para dormir" },
]

const cat = (...slugs: string[]) =>
  demoCategories.filter((c) => slugs.includes(c.slug))

/** Primeira frase, sempre terminada em ponto. */
const firstSentence = (text: string) => {
  const first = text.split(". ")[0].trim()
  return /[.!?]$/.test(first) ? first : `${first}.`
}

let seq = 0
function make(
  type: ContentType,
  data: Partial<Content> & Pick<Content, "slug" | "title" | "description" | "thumbnailUrl">
): Content {
  seq += 1
  return {
    id: `demo-${data.slug}`,
    type,
    shortDescription: firstSentence(data.description),
    bannerUrl: data.thumbnailUrl,
    posterUrl: null,
    ageRating: "L",
    releaseYear: 2026,
    featured: false,
    genres: [],
    categories: [],
    seasonsCount: null,
    durationSeconds: null,
    // Filmes de demonstração usam o stream público de teste (lib/bunny.ts).
    videoId: type === "movie" ? "demo" : null,
    trailerVideoId: null,
    createdAt: new Date(Date.UTC(2026, 0, seq)).toISOString(),
    ...data,
  }
}

export const demoContent: Content[] = [
  make("series", {
    slug: "a-arca-de-noe",
    title: "A Arca de Noé",
    description:
      "Noé ouve a voz de Deus e constrói uma arca enorme para salvar sua família e os animais. Uma aventura sobre fé, obediência e a promessa do arco-íris.",
    thumbnailUrl: "/catalog/arca-de-noe/thumb.jpg",
    bannerUrl: "/catalog/arca-de-noe/banner.jpg",
    posterUrl: "/catalog/arca-de-noe/poster.jpg",
    featured: true,
    genres: ["Aventura", "Animais", "Família"],
    categories: cat("antigo-testamento", "arca-de-noe", "animais"),
    seasonsCount: 2,
  }),
  make("series", {
    slug: "amigos-de-jesus",
    title: "Amigos de Jesus",
    description:
      "Um grupo de crianças acompanha Jesus pela Galileia e aprende, em cada episódio, o que significa amar o próximo.",
    thumbnailUrl: img("jesus-kids"),
    featured: true,
    genres: ["Amizade", "Valores", "Família"],
    categories: cat("novo-testamento", "jesus"),
    seasonsCount: 1,
  }),
  make("series", {
    slug: "historias-da-biblia",
    title: "Histórias da Bíblia",
    description:
      "De Moisés a Davi, as grandes histórias da Bíblia contadas com carinho para os pequenos. Cada episódio termina com uma lição para a vida.",
    thumbnailUrl: img("bible-stories"),
    genres: ["Histórias", "Aventura"],
    categories: cat("antigo-testamento", "moises"),
    seasonsCount: 2,
  }),
  make("movie", {
    slug: "daniel-na-cova-dos-leoes",
    title: "Daniel na Cova dos Leões",
    description:
      "Daniel continua a orar mesmo quando isso é proibido. Lançado na cova dos leões, descobre que Deus está com ele em todo lugar.",
    thumbnailUrl: img("daniel-lions"),
    featured: true,
    genres: ["Coragem", "Fé"],
    categories: cat("antigo-testamento", "daniel", "animais"),
    durationSeconds: 48 * 60,
    ageRating: "L",
  }),
  make("movie", {
    slug: "ester",
    title: "Ester",
    description:
      "Uma jovem corajosa se torna rainha da Pérsia e arrisca tudo para salvar seu povo. Uma história sobre propósito e coragem.",
    thumbnailUrl: img("esther"),
    genres: ["Coragem", "Realeza"],
    categories: cat("antigo-testamento"),
    durationSeconds: 62 * 60,
    ageRating: "10",
  }),
  make("movie", {
    slug: "jose-sonhos-de-deus",
    title: "José: Sonhos de Deus",
    description:
      "Do poço ao palácio do Egito: José enfrenta a inveja dos irmãos, mas nunca deixa de confiar nos planos de Deus.",
    thumbnailUrl: img("jose"),
    featured: true,
    genres: ["Aventura", "Perdão"],
    categories: cat("antigo-testamento"),
    durationSeconds: 71 * 60,
  }),
  make("music", {
    slug: "louvor-kids",
    title: "Louvor Kids",
    description: "Músicas alegres para cantar, pular e louvar a Deus em família.",
    thumbnailUrl: img("louvor-kids"),
    genres: ["Louvor", "Animado"],
    categories: cat("louvor"),
  }),
  make("music", {
    slug: "cancoes-biblicas",
    title: "Canções Bíblicas",
    description: "As histórias da Bíblia em canções fáceis de aprender e cantar juntos.",
    thumbnailUrl: img("cancoes-biblicas"),
    genres: ["Louvor", "Histórias"],
    categories: cat("louvor", "animais"),
  }),
  make("music", {
    slug: "salmos-para-criancas",
    title: "Salmos para Crianças",
    description: "Salmos cantados com calma, ideais para a hora de dormir.",
    thumbnailUrl: img("salmos-criancas"),
    genres: ["Calmo", "Dormir"],
    categories: cat("dormir", "versiculos"),
  }),
  make("coloring", {
    slug: "arca-de-noe-para-colorir",
    title: "A Arca de Noé para colorir",
    description: "Desenhos da arca e dos animais entrando de dois em dois.",
    thumbnailUrl: img("coloring"),
    categories: cat("arca-de-noe", "animais"),
  }),
  make("coloring", {
    slug: "jesus-e-as-criancas",
    title: "Jesus e as crianças",
    description: "\"Deixai vir a mim as criancinhas\" em um desenho para colorir.",
    thumbnailUrl: img("jesus-kids"),
    categories: cat("jesus"),
  }),
  make("coloring", {
    slug: "daniel-e-os-leoes",
    title: "Daniel e os leões",
    description: "Daniel orando tranquilo ao lado dos leões.",
    thumbnailUrl: img("daniel-lions"),
    categories: cat("daniel", "animais"),
  }),
  make("coloring", {
    slug: "o-senhor-e-meu-pastor",
    title: "O Senhor é meu pastor",
    description: "Versículo do Salmo 23 com ilustração para colorir.",
    thumbnailUrl: img("salmos-criancas"),
    categories: cat("versiculos"),
  }),
  make("coloring", {
    slug: "labirinto-de-moises",
    title: "Labirinto de Moisés",
    description: "Ajude o povo a atravessar o mar aberto neste labirinto.",
    thumbnailUrl: img("bible-stories"),
    categories: cat("moises", "atividades"),
  }),
  make("study", {
    slug: "deus-cuida-de-mim",
    title: "Deus cuida de mim",
    description: "Devocional curto sobre o Salmo 23 para ler antes de dormir.",
    thumbnailUrl: img("salmos-criancas"),
    categories: cat("versiculos"),
  }),
  make("study", {
    slug: "noe-confiou-em-deus",
    title: "Noé confiou em Deus",
    description: "A história de Noé com perguntas para conversar em família.",
    thumbnailUrl: img("noah-hero"),
    categories: cat("arca-de-noe", "antigo-testamento"),
  }),
  make("study", {
    slug: "coragem-como-a-de-daniel",
    title: "Coragem como a de Daniel",
    description: "Estudo para crianças sobre oração e coragem.",
    thumbnailUrl: img("daniel-lions"),
    categories: cat("daniel"),
  }),
  make("study", {
    slug: "versiculo-joao-3-16",
    title: "Versículo da semana: João 3:16",
    description: "Um versículo para memorizar e uma atividade para fixar.",
    thumbnailUrl: img("jesus-kids"),
    categories: cat("versiculos", "novo-testamento"),
  }),
]

// --------------------------------------------------------------------------
// Temporadas e episódios

const episodeTitles: Record<string, string[][]> = {
  "a-arca-de-noe": [
    ["O chamado de Noé", "Madeira, piche e paciência", "Os animais chegam", "Quarenta dias de chuva", "A pomba e o ramo"],
    ["O arco-íris da promessa", "Uma nova terra", "Plantar e esperar", "A família cresce"],
  ],
  "amigos-de-jesus": [
    ["Pescadores de gente", "O menino dos pães", "A tempestade no lago", "Zaqueu sobe na árvore", "O bom samaritano", "O filho que voltou"],
  ],
  "historias-da-biblia": [
    ["Moisés no rio", "O mar se abre", "Davi e o gigante", "Rute e Noemi"],
    ["Jonas e o grande peixe", "Samuel ouve a voz", "Elias e os corvos"],
  ],
}

// Arte própria de cada episódio (quando existe); senão usa a miniatura da série.
const episodeArt: Record<string, string> = Object.fromEntries(
  ["t1e1", "t1e2", "t1e3", "t1e4", "t1e5", "t2e1", "t2e2"].map((k) => [`a-arca-de-noe/${k}`, `/catalog/arca-de-noe/${k}.jpg`])
)

export const demoSeasons: Season[] = Object.entries(episodeTitles).flatMap(
  ([slug, seasons]) => {
    const content = demoContent.find((c) => c.slug === slug)!
    return seasons.map((titles, s) => {
      const seasonId = `${content.id}-s${s + 1}`
      return {
        id: seasonId,
        contentId: content.id,
        number: s + 1,
        title: `Temporada ${s + 1}`,
        episodes: titles.map((title, e) => ({
          id: `${seasonId}-e${e + 1}`,
          contentId: content.id,
          seasonId,
          seasonNumber: s + 1,
          number: e + 1,
          title,
          description: `${title}. Um episódio para assistir em família e conversar sobre o que aprendemos.`,
          durationSeconds: (9 + ((e * 3 + s) % 5)) * 60,
          thumbnailUrl: episodeArt[`${slug}/t${s + 1}e${e + 1}`] ?? content.thumbnailUrl,
          videoId: "demo",
        })),
      }
    })
  }
)

// --------------------------------------------------------------------------
// Música

const trackList: Record<string, [string, number][]> = {
  "louvor-kids": [
    ["Pula, pula, louvor", 142],
    ["Deus é tão bom", 168],
    ["Minha alegria", 131],
    ["Bate palmas", 155],
    ["Obrigado, Senhor", 176],
  ],
  "cancoes-biblicas": [
    ["Dois a dois na arca", 150],
    ["Davi tinha uma funda", 139],
    ["Jonas no peixão", 147],
    ["As muralhas de Jericó", 161],
  ],
  "salmos-para-criancas": [
    ["Salmo 23", 204],
    ["Salmo 121", 188],
    ["Salmo 4 — Em paz me deito", 215],
    ["Salmo 91", 230],
  ],
}

export const demoMusic: MusicCollection[] = Object.entries(trackList).map(
  ([slug, tracks]) => {
    const content = demoContent.find((c) => c.slug === slug)!
    return {
      content,
      kind: slug === "salmos-para-criancas" ? "playlist" : "album",
      artist: "Coral Arca Flix",
      tracks: tracks.map(([title, duration], i) => ({
        id: `${content.id}-t${i + 1}`,
        title,
        artist: "Coral Arca Flix",
        audioUrl: null,
        coverUrl: content.thumbnailUrl,
        durationSeconds: duration,
        trackNumber: i + 1,
      })),
    }
  }
)

// --------------------------------------------------------------------------
// Para colorir

const coloringMeta: Record<string, Pick<ColoringMaterial, "category" | "ageMin" | "ageMax">> = {
  "arca-de-noe-para-colorir": { category: "arca-de-noe", ageMin: 3, ageMax: 8 },
  "jesus-e-as-criancas": { category: "jesus", ageMin: 3, ageMax: 8 },
  "daniel-e-os-leoes": { category: "daniel", ageMin: 4, ageMax: 10 },
  "o-senhor-e-meu-pastor": { category: "versiculos", ageMin: 5, ageMax: 12 },
  "labirinto-de-moises": { category: "atividades", ageMin: 5, ageMax: 10 },
}

export const demoColoring: ColoringMaterial[] = demoContent
  .filter((c) => c.type === "coloring")
  .map((content) => ({
    content,
    ...coloringMeta[content.slug],
    imageUrl: content.thumbnailUrl,
    pdfUrl: null,
  }))

// --------------------------------------------------------------------------
// Estudos

const studyMeta: Record<string, Omit<Study, "content">> = {
  "deus-cuida-de-mim": {
    kind: "devocional",
    readingMinutes: 4,
    bibleReference: "Salmo 23",
    body: `"O Senhor é o meu pastor; nada me faltará."

Um pastor conhece cada ovelha pelo nome. Ele sabe quando uma está com fome, quando está cansada e quando se perdeu. Davi, que foi pastor quando era menino, escreveu este salmo lembrando que Deus cuida de nós do mesmo jeito.

## Para conversar

- Quem cuida de você todos os dias?
- Em que momentos você sente medo? O que o Salmo 23 diz sobre isso?

## Oração

Senhor, obrigado por cuidar de mim de dia e de noite. Amém.`,
  },
  "noe-confiou-em-deus": {
    kind: "historia",
    readingMinutes: 6,
    bibleReference: "Gênesis 6–9",
    body: `Noé vivia em um tempo em que quase ninguém se lembrava de Deus. Mesmo assim, ele escolheu ouvir e obedecer.

Deus pediu que Noé construísse uma arca enorme, longe do mar. Os vizinhos riram, mas Noé continuou trabalhando, tábua por tábua.

## O que aprendemos

Confiar em Deus é continuar fazendo o que é certo, mesmo quando os outros não entendem.

> "Noé fez tudo exatamente como Deus lhe tinha ordenado." — Gênesis 6:22

## Atividade

Desenhe o arco-íris da promessa e escreva uma coisa pela qual você agradece a Deus.`,
  },
  "coragem-como-a-de-daniel": {
    kind: "estudo",
    readingMinutes: 7,
    bibleReference: "Daniel 6",
    body: `Daniel orava três vezes por dia, com a janela aberta. Quando o rei proibiu as orações, Daniel continuou orando.

## Três lições

1. Orar é conversar com Deus — em qualquer lugar.
2. Ter coragem não é não sentir medo, é confiar em Deus mesmo com medo.
3. Deus protege quem é fiel a Ele.

## Desafio da semana

Escolha três horários do dia para fazer uma oração curta, como Daniel.`,
  },
  "versiculo-joao-3-16": {
    kind: "versiculo",
    readingMinutes: 3,
    bibleReference: "João 3:16",
    body: `> "Porque Deus amou o mundo de tal maneira que deu seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."

## Como memorizar

Leia o versículo em voz alta três vezes. Depois, tente dizer sem olhar, uma parte de cada vez.

## Para colorir

Escreva a palavra AMOR com letras bem grandes e pinte cada letra de uma cor.`,
  },
}

export const demoStudies: Study[] = demoContent
  .filter((c) => c.type === "study")
  .map((content) => ({ content, ...studyMeta[content.slug] }))

// --------------------------------------------------------------------------
// Planos (valores fictícios — na interface aparecem com selo "Exemplo")

export const demoPlans: SubscriptionPlan[] = [
  {
    id: "plan-mensal",
    name: "Mensal",
    slug: "mensal",
    description: "Para começar a assistir hoje.",
    priceCents: 1990,
    currency: "BRL",
    billingInterval: "month",
    maxProfiles: 3,
    maxDevices: 2,
    features: ["Todo o catálogo: séries, filmes, músicas e estudos", "Desenhos para colorir e imprimir", "Até 3 perfis", "2 telas ao mesmo tempo"],
    stripePriceId: null,
    highlighted: false,
    active: true,
  },
  {
    id: "plan-anual",
    name: "Anual",
    slug: "anual",
    description: "O mesmo catálogo, pagando uma vez por ano.",
    priceCents: 17990,
    currency: "BRL",
    billingInterval: "year",
    maxProfiles: 4,
    maxDevices: 3,
    features: ["Tudo do plano Mensal", "Até 4 perfis", "3 telas ao mesmo tempo", "Uma cobrança por ano"],
    stripePriceId: null,
    highlighted: true,
    active: true,
  },
  {
    id: "plan-familia",
    name: "Família Premium",
    slug: "familia-premium",
    description: "Cobrança mensal, para famílias grandes e ministérios infantis.",
    priceCents: 2990,
    currency: "BRL",
    billingInterval: "month",
    maxProfiles: 6,
    maxDevices: 5,
    features: ["Todo o catálogo, igual aos outros planos", "Até 6 perfis", "5 telas ao mesmo tempo", "Ideal para escola dominical e ministério infantil"],
    stripePriceId: null,
    highlighted: false,
    active: true,
  },
]

export const demoNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Nova temporada",
    body: "A Arca de Noé ganhou a 2ª temporada.",
    href: "/content/a-arca-de-noe",
    read: false,
    createdAt: new Date(Date.UTC(2026, 8, 20)).toISOString(),
  },
  {
    id: "n2",
    title: "Novos desenhos para colorir",
    body: "Chegaram atividades de Moisés e Daniel.",
    href: "/colorir",
    read: true,
    createdAt: new Date(Date.UTC(2026, 8, 12)).toISOString(),
  },
]
