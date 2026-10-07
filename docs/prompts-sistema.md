# Prompts das imagens de dentro da plataforma — Arca Flix

Complementa `docs/prompts-imagens.md` (landing). Aqui estão as capas, banners,
miniaturas e avatares que aparecem **depois do login**.

## Regras

1. **Nenhum texto dentro da imagem** — nem título, nem letreiro, nem logo. A plataforma escreve o nome do título por cima/abaixo.
2. **Mesmo estilo em tudo.** Cole o estilo base no fim de cada prompt.
3. **Mesmos personagens em todas as imagens de um título.** Gere primeiro a capa, depois use-a como *referência de personagem* (Midjourney `--cref`, "character reference" no Leonardo/Ideogram, ou anexe a imagem no ChatGPT/Gemini) para banner e episódios.
4. Deixe o **espaço calmo** indicado em cada formato — é onde entra o texto.

**Estilo base (cole no fim):**
> 3D animated feature film style, soft rounded characters, expressive big eyes, warm golden-hour lighting with gentle lilac and soft purple accents, cozy and joyful mood, rich but soft colors, cinematic depth of field, high detail, family friendly, no text, no letters, no words, no logo, no watermark

## Formatos (o que cada imagem é no sistema)

| Tipo | Onde aparece | Tamanho | Espaço calmo |
|---|---|---|---|
| **Banner** | destaque da Início e topo da página do título | 1920×1080 (16:9) | **metade esquerda** (título, descrição e botões ficam lá); personagens à direita |
| **Miniatura** | cartões das fileiras, busca, Minha Lista | 1280×720 (16:9) | nenhum — personagem grande e centralizado, lê bem em tamanho pequeno |
| **Capa vertical** | fileira de Filmes e lateral da página do título | 1000×1500 (2:3) | **terço de baixo** mais simples |
| **Capa quadrada** | álbuns e playlists de música | 1400×1400 (1:1) | nenhum |
| **Episódio** | lista de episódios | 1280×720 (16:9) | nenhum — uma cena do episódio |

Sufixos sugeridos para os arquivos: `-banner`, `-thumb`, `-poster`, `-cover`, `-ep01`… (ex.: `arca-de-noe-banner.jpg`). Envie pelo **Admin › Conteúdos** (campos Thumbnail, Banner e Capa vertical; miniatura de cada episódio dentro da temporada).

### Como adaptar um prompt a cada formato
Escreva a **cena** (tabela abaixo) e acrescente a frase de composição do formato:

- **Banner:** `Wide cinematic composition: main characters on the RIGHT half of the frame; the LEFT half calm, softly blurred background (sky, landscape) with no important details.`
- **Miniatura:** `Close and simple composition, the main character large and centered, clear silhouette, bold readable at small size, uncluttered background.`
- **Capa vertical:** `Vertical poster composition, main character centered in the upper two thirds looking heroic and friendly, the lower third calmer (ground, water, grass).`
- **Capa quadrada:** `Square album cover composition, characters centered, joyful, simple background.`

---

## 1. Séries

### A Arca de Noé
**Personagens fixos:** Noah — kind old man with a long white beard, warm brown robe, wooden staff, big smile; his wife — gentle grey-haired woman with a lilac headscarf; animals: a giraffe, an elephant, a lion, a little lamb and two white doves.

| Formato | Cena |
|---|---|
| Banner | Noah smiling up at the sky beside a giant wooden ark on a green hill, pairs of animals walking up the ramp, a rainbow and white doves in a golden sunset sky |
| Miniatura | Noah close-up hugging a little lamb, the ark softly blurred behind |
| Capa vertical | Noah standing proudly in front of the ark holding his staff, giraffe and elephant peeking from the ark windows, rainbow above |

| Episódio | Cena |
|---|---|
| T1E1 O chamado de Noé | Noah in his field looking up in wonder at golden light breaking through the clouds |
| T1E2 Madeira, piche e paciência | Noah and his sons building the wooden frame of the ark with hammers, wood shavings, smiling |
| T1E3 Os animais chegam | Long line of animal pairs walking happily toward the ark ramp, Noah welcoming them |
| T1E4 Quarenta dias de chuva | Inside the cozy ark, lantern light, animals sleeping together while rain falls outside the window |
| T1E5 A pomba e o ramo | A white dove flying back to Noah carrying a green olive branch over calm water |
| T2E1 O arco-íris da promessa | Noah's family and the animals looking at a huge rainbow over a fresh green land |
| T2E2 Uma nova terra | Animals running out of the ark into a meadow full of flowers |
| T2E3 Plantar e esperar | Noah planting a small vine with his grandchildren, sunrise |
| T2E4 A família cresce | Noah's big family having a picnic under a tree, lots of children and animals |

### Amigos de Jesus
**Personagens fixos:** Jesus — warm smile, brown hair and beard, cream robe with a soft blue sash; four kids — Lia (curly-haired girl, lilac dress), Tomé (boy with a straw hat), Davi (small boy with a wooden toy boat), Ana (girl with braids and a yellow scarf).

| Formato | Cena |
|---|---|
| Banner | Jesus sitting under an olive tree by the Sea of Galilee laughing with the four kids, a small fishing boat on the water, a white dove in the sky |
| Miniatura | Jesus kneeling and hugging the four kids, big smiles |
| Capa vertical | Jesus walking on a flowery path with the kids around him, the sea behind |

| Episódio | Cena |
|---|---|
| E1 Pescadores de gente | Kids watching fishermen pull a net full of fish from a boat, Jesus smiling |
| E2 O menino dos pães | A boy offering a basket with five loaves and two fish to Jesus, crowd on a green hill |
| E3 A tempestade no lago | Boat on a calm lake right after a storm, clouds parting, the kids amazed |
| E4 Zaqueu sobe na árvore | A short man in a sycamore tree waving down at Jesus and the kids |
| E5 O bom samaritano | A kind traveler helping a hurt man onto a donkey, kids watching with care |
| E6 O filho que voltou | A father running with open arms toward his returning son at sunset |

### Histórias da Bíblia
Coleção — cada episódio tem um herói diferente; mantenha a mesma luz e paleta.

| Formato | Cena |
|---|---|
| Banner | Young David with a sling, Moses with a staff by a parted sea, a girl with a water jar and a smiling lamb, ancient city and palm trees, sunrise |
| Miniatura | Young David smiling holding his sling, a lamb beside him |
| Capa vertical | Moses raising his staff as the sea parts into two glowing walls of water |

| Episódio | Cena |
|---|---|
| T1E1 Moisés no rio | Baby Moses sleeping in a woven basket among reeds on the Nile, his sister peeking |
| T1E2 O mar se abre | People walking through the parted Red Sea between walls of blue water |
| T1E3 Davi e o gigante | Small brave David facing a big but not scary giant, valley at morning |
| T1E4 Rute e Noemi | Ruth gathering wheat in a golden field, Naomi smiling nearby |
| T2E1 Jonas e o grande peixe | Jonah sitting calmly inside a huge friendly fish, glowing light |
| T2E2 Samuel ouve a voz | Young Samuel waking up in a temple lit by a small oil lamp, listening |
| T2E3 Elias e os corvos | Elijah by a stream as ravens bring him bread |

---

## 2. Filmes

Cada filme precisa de **banner, miniatura e capa vertical** (a capa vertical é a principal nos filmes).

| Filme | Cena (adapte a cada formato) |
|---|---|
| **Daniel na Cova dos Leões** | Young Daniel kneeling and praying peacefully in a rocky cave, two big gentle lions lying calmly beside him, beams of heavenly light from an opening above |
| **Ester** | Young Queen Esther in a purple and gold gown and crown walking confidently in a marble Persian palace hall with purple banners, sunlight through tall windows |
| **José: Sonhos de Deus** | Teenage Joseph in a vibrant many-colored striped coat looking up at a dreamy sky with sheaves of wheat, the sun, the moon and eleven stars, Egyptian palace on the horizon |

---

## 3. Músicas (capas quadradas 1:1)

| Álbum/playlist | Cena |
|---|---|
| **Louvor Kids** | Joyful children singing and clapping in a sunny flower meadow, a boy with a small guitar, a puppy and a lamb jumping, floating music notes of soft light |
| **Canções Bíblicas** | Children singing with friendly animals (lion, giraffe, elephant, lamb, parrot), Noah's ark and a rainbow behind, glowing music staff lines in the air |
| **Salmos para Crianças** | Calm bedtime scene: a boy and a lamb asleep on a soft hill under a starry purple sky with a crescent moon, gentle glowing notes — soothing, darker tones |

Capa de cada faixa (opcional, 1:1): reuse a capa do álbum. Se quiser uma por música, descreva a letra em uma cena simples no mesmo estilo.

---

## 4. Para colorir

Cada material tem **duas imagens**:

1. **Miniatura colorida** (1280×720) — mostra o desenho já pintado, para o cartão ficar bonito no catálogo. Use o estilo base.
2. **Arte de traço** (A4 retrato, 2480×3508) — a que se imprime e se pinta online. Use o estilo de traço:
> clean black outline coloring page for kids, thick smooth lines, no shading, no gray, no color fill, pure white background, simple shapes, large areas to color, centered composition, printable A4 portrait, no text, no letters, no border frame

| Material | Cena |
|---|---|
| A Arca de Noé para colorir | Noah's ark on calm waves, a giraffe, an elephant and two doves peeking out, a big rainbow above |
| Jesus e as crianças | Jesus sitting under a tree with three children and a lamb |
| Daniel e os leões | Daniel kneeling between two friendly lions in a cave |
| O Senhor é meu pastor | A shepherd boy with sheep by still waters — **leave the top 25% empty** (o versículo é escrito depois no Canva) |
| Labirinto de Moisés | Top-down simple maze drawn as the parted sea, Moses at the start and a family at the end — thick paths, easy for ages 5–10 |

Dica: na arte de traço peça **"thick lines, large shapes"** — crianças pequenas pintam melhor e a pintura online preenche melhor.

---

## 5. Estudos bíblicos (banner 16:9 — usado no cartão e no topo da leitura)

| Estudo | Cena |
|---|---|
| Deus cuida de mim (Salmo 23) | A gentle shepherd carrying a lamb on his shoulders through a green valley, soft morning light |
| Noé confiou em Deus | Noah hammering the ark while neighbors watch from a distance, Noah calm and smiling |
| Coragem como a de Daniel | Daniel praying at an open window in a sunlit room, city rooftops outside |
| Versículo da semana: João 3:16 | A child looking up at a glowing sunrise over hills, arms open, warm and hopeful |

---

## 6. Avatares dos perfis (1:1, 512×512)

Os avatares atuais são recortes provisórios. Gere uma série completa, **todos com o mesmo enquadramento**:

> Cute 3D animated baby animal portrait, head and shoulders, centered, looking at the camera with a big friendly smile, soft lilac-to-peach gradient background, simple and clean, no props + estilo base

Animais (um por imagem, nome do arquivo entre parênteses): lion (`lion`), lamb (`lamb`), giraffe (`giraffe`), dove (`dove`), macaw parrot (`parrot`), puppy (`puppy`), zebra (`zebra`), elephant (`elephant`), fawn deer (`deer`), little bluebird (`bird`).

Salve em `public/avatars/` com esses nomes (jpg) — substituem automaticamente os atuais.

---

## 7. Busca — atalhos "Explorar" (4:3, 1200×900)

| Atalho | Cena |
|---|---|
| Séries | Several Bible story characters together in a friendly group shot (Noah, David with sling, Esther), sunset |
| Filmes | A family on a sofa with popcorn watching a glowing screen, seen from behind |
| Músicas | Kids singing with a guitar and floating music notes |
| Para colorir | Colored pencils and a half-colored ark drawing on a wooden table |
| Estudos | An open children's Bible with soft light rising from the pages, a small lamb toy beside it |

Me mande esses 5 que eu troco na página de busca (hoje usam as artes antigas).

---

## Ordem sugerida de produção

1. **Banners + miniaturas** dos 6 títulos de vídeo (são os mais vistos: Início, Séries, Filmes).
2. **Capas verticais** dos 3 filmes.
3. **Capas quadradas** das 3 músicas.
4. **Avatares** (aparecem logo no "Quem vai assistir?").
5. Miniaturas e traços **para colorir** + banners dos **estudos**.
6. Miniaturas de **episódios** (podem esperar — usam a miniatura da série enquanto não existirem).
