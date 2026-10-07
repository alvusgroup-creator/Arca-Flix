# Prompts das imagens e do vídeo — Arca Flix

Regras para TUDO:

- **Nenhum texto, letra, título ou logo dentro da imagem/vídeo.** O site escreve os títulos por cima; texto "queimado" na arte briga com o layout.
- Deixe **espaço calmo** onde o texto vai entrar (indicado em cada prompt).
- Mesmo estilo em tudo, para parecer uma marca só.

**Estilo base (cole no fim de cada prompt):**

> 3D animated feature film style, soft rounded characters, expressive big eyes, warm golden-hour lighting with gentle lilac and soft purple accents in the sky and shadows, cozy and joyful mood, rich but soft colors, cinematic depth of field, high detail, family friendly, no text, no letters, no words, no logo, no watermark

---

## Landing (página de vendas)

Salve tudo em `public/landing/` com os nomes abaixo e troque os caminhos em
`features/landing/media.ts` (ou me avise que eu troco e reviso o enquadramento).

| Arquivo | Onde aparece | Tamanho |
|---|---|---|
| `hero.mp4` | vídeo do topo (computador) | 1920×1080, 8 s, loop |
| `hero-mobile.mp4` | vídeo do topo (celular) | 1080×1920, 8 s, loop |
| `hero.jpg` | capa do vídeo / imagem do topo | 1920×1080 |
| `hero-mobile.jpg` | capa vertical (celular) | 1080×1920 |
| `momento-assistir.jpg`, `momento-cantar.jpg`, `momento-colorir.jpg`, `momento-aprender.jpg` | 4 cartões "Um momento para cada hora do dia" | 1080×1350 (4:5) |
| `pais-controle.jpg` | secção "Você decide o que seu filho assiste" | 1080×1300 (5:6) |
| `cta-familia.jpg` | faixa final "Tela com valores que você aprova" | 1920×900 |
| `og.jpg` | prévia ao partilhar o link (WhatsApp, Instagram, Facebook) | 1200×630 |

### 1. Hero — `hero.jpg` (16:9) e `hero-mobile.jpg` (9:16)

Gere **primeiro a imagem** e depois **anime essa mesma imagem** (image-to-video). Assim a capa e o primeiro quadro do vídeo são iguais e não há "salto" quando o vídeo começa.

**Prompt (16:9):**
> A cheerful Brazilian family on a cozy living room sofa at golden hour: a young mother and father with two kids — a curly-haired girl about 6 and a boy about 4 — watching a tablet together, the kids laughing with delight, the mother smiling relaxed with an arm around them, soft glow from the screen on their faces, a plush lamb toy and a wooden toy Noah's ark on the coffee table, warm window light, plants. **Composition: the family on the RIGHT 55% of the frame; the LEFT 45% calm, softly blurred and slightly darker (wall, curtain, plant) to hold headline text; faces in the center-right.** + estilo base

**Versão vertical (9:16):** mesmo prompt, trocando a composição por:
> **Vertical composition: the family in the UPPER half, faces around the top third; the LOWER 45% calm and softly darker (sofa cushions, blanket, rug) to hold text and buttons.**

### 2. Vídeo do hero — `hero.mp4` e `hero-mobile.mp4`

Ferramentas boas: **Google Veo**, **Kling**, **Runway Gen-4**, **Hailuo** ou **Sora** — modo **image-to-video**, usando a imagem do passo 1.

**Prompt de movimento:**
> Gentle, slow cinematic push-in on the family on the sofa. The kids laugh and lean toward the tablet, the little boy points at the screen, the mother softly strokes the girl's hair, the father smiles at them. Subtle floating dust specks glowing in the warm window light, curtains moving slightly in a soft breeze, the screen light flickers gently on their faces. Calm, cozy, joyful mood. Very slow, smooth camera movement, no cuts, no zoom jumps, the left side of the frame stays calm. Seamless loop: the last frame matches the first frame. 8 seconds, 24 fps. No text, no subtitles, no logos, no watermark.

**Prompt negativo (se a ferramenta tiver o campo):**
> text, letters, subtitles, logo, watermark, distorted hands, extra fingers, deformed faces, flicker, sudden camera movement, scene cut, dark or scary mood

**Dicas:**
- Peça **8 segundos** e **loop perfeito**. Se o loop não ficar perfeito, eu faço um "vai-e-volta" suave.
- Sem áudio — o vídeo toca sem som de qualquer jeito.
- Me mande o arquivo gerado: eu comprimo (H.264, ~2–4 MB) para carregar rápido no 4G.
- Gere a **versão vertical** a partir de `hero-mobile.jpg`, para o celular não cortar as crianças.

### 3. Cartão "Assistir" — `momento-assistir.jpg` (4:5)
> Two children sitting on a rug in pajamas, faces lit by a TV showing a glowing Noah's ark scene with animals, a popcorn bowl, a soft lamb plush beside them, seen slightly from behind and to the side so their amazed expressions show. **Top-left corner simple (a small label sits there).** + estilo base

### 4. Cartão "Cantar" — `momento-cantar.jpg` (4:5)
> A group of joyful children singing and clapping in a sunny flower meadow, one boy playing a small acoustic guitar, a happy puppy and a little lamb jumping, floating musical notes made of soft light. **Top-left corner simple.** + estilo base

### 5. Cartão "Colorir" — `momento-colorir.jpg` (4:5)
> Close, warm scene of a little girl at a wooden kitchen table coloring a black-and-white line drawing of Noah's ark with chunky colored pencils, tongue out in concentration, pencils scattered, a mug of milk and cookies, morning window light. **Top-left corner simple.** + estilo base

### 6. Cartão "Aprender" — `momento-aprender.jpg` (4:5)
> Bedtime: a mother sitting on the edge of a child's bed reading an illustrated children's Bible to a sleepy boy hugging a lamb plush, warm bedside lamp, starry night through the window, calm and tender. **Top-left corner simple.** + estilo base

### 7. "Para mães e pais" — `pais-controle.jpg` (5:6)
> A calm, confident mother on a sofa holding a smartphone, smiling as she chooses settings, while her young daughter beside her happily watches a tablet with headphones; a feeling of safety and trust; soft afternoon light, tidy cozy home. **Both faces in the center so a 4:3 crop on mobile still works.** + estilo base

### 8. CTA final — `cta-familia.jpg` (≈2:1)
> Evening scene seen from behind: a family of four sitting together inside a cozy blanket fort in the living room, wrapped in a blanket, looking at a glowing screen, warm string lights, magical and peaceful. **The CENTER of the image calm and slightly darker — headline and button sit there; people toward the bottom and the sides.** + estilo base

### 9. Imagem de partilha — `og.jpg` (1200×630)
> Same family and style as the hero, sofa scene, the family on the RIGHT half; the LEFT half a soft, plain lilac-and-purple wall with gentle light. + estilo base

Depois, no Canva, coloque a logo e a frase "Desenhos que as crianças amam e os pais confiam" no lado esquerdo.

---

## Catálogo (banners 16:9 + capas 2:3)

Para cada título gere **duas versões**: banner 16:9 (personagens à DIREITA, lado esquerdo calmo para o texto) e capa 2:3 (personagem centralizado, terço de baixo calmo).

| Arquivo | Prompt (+ estilo base) |
|---|---|
| `noah-hero.jpg` | Old Noah with a white beard and staff smiling at the sky, a giant wooden ark on a green hill behind, pairs of animals (giraffes, elephants, lions, zebras, sheep) walking up the ramp, a rainbow and white doves in a golden sunset sky |
| `jesus-kids.jpg` | Jesus sitting under an olive tree by the Sea of Galilee, warmly hugging and laughing with a group of diverse children, a small fishing boat on the water, flowers in the foreground, a white dove in the sky |
| `bible-stories.jpg` | A collage-like adventurous scene: young David with a sling, Moses with a staff by a parted sea in the distance, a girl with a water jar, a smiling lamb, ancient city and palm trees, sunrise |
| `daniel-lions.jpg` | Young Daniel kneeling and praying peacefully in a rocky cave, two big gentle lions lying calmly beside him, beams of heavenly light coming from an opening above |
| `esther.jpg` | Young Queen Esther in a purple and gold gown and crown walking confidently in a marble Persian palace hall with purple banners, the king on a golden throne in the background, warm sunlight |
| `jose.jpg` | Teenage Joseph wearing a vibrant many-colored striped coat, looking up at a dreamy sky with sheaves of wheat, the sun, the moon and eleven stars, Egyptian palace and pyramids on the horizon |
| `louvor-kids.jpg` | Joyful children singing with arms raised in a sunny meadow, a boy with a guitar, colorful floating music notes, a puppy and a lamb |
| `cancoes-biblicas.jpg` | Children singing and playing a small harp and a tambourine with friendly animals (lion, giraffe, elephant, lamb, parrot), Noah's ark and a rainbow in the background, glowing musical staff lines in the air |
| `salmos-criancas.jpg` | A boy sitting on a rock reading a leather Bible at sunset, a fawn and a lamb resting beside him, a small bluebird singing, a waterfall and soft golden music notes |
| `coloring.jpg` | Jesus and four children at a rustic table happily coloring Bible line drawings with colored pencils, toy ark and animals on a shelf, sunny window |

---

## Desenhos para colorir (para imprimir e para a pintura online)

Use este estilo (diferente do resto — é **traço**):

> clean black outline coloring page for kids, thick smooth lines, no shading, no gray, no color fill, pure white background, simple shapes, large areas to color, centered composition, printable A4 portrait, no text, no letters, no border frame

Ideias:

- Noah's ark on calm waves with a giraffe, an elephant and two doves peeking out, a big rainbow above
- Jesus sitting with three children and a lamb under a tree
- Daniel kneeling between two friendly lions in a cave
- Baby Moses in a basket floating among reeds with a little frog
- Little David with a sling and a sheep on a hill
- Jonah inside a smiling big fish
- Psalm 23 scene: a shepherd boy with sheep by still waters (leave the top 25% empty to add the verse text later in Canva)
