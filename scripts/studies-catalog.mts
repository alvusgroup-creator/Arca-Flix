// Estudos bíblicos originais do Arca Flix (texto próprio; citações bíblicas curtas e parafraseadas).
// Importar com: npm run db:materials

export interface StudySeed {
  slug: string
  title: string
  kind: "devocional" | "historia" | "estudo" | "atividade" | "versiculo"
  reference: string
  minutes: number
  /** Categoria do catálogo (para filtros e recomendações). */
  categories: string[]
  /** Cor de fundo da capa gerada. */
  cover: { bg: string; icon: "star" | "heart" | "sun" | "lion" | "wave" | "sheep" | "crown" | "tree" | "cross" | "dove" }
  short: string
  body: string
}

export const studies: StudySeed[] = [
  {
    slug: "davi-e-golias-coragem-que-vem-de-deus",
    title: "Davi e Golias: a coragem que vem de Deus",
    kind: "historia",
    reference: "1 Samuel 17",
    minutes: 5,
    categories: ["antigo-testamento"],
    cover: { bg: "#ffe9b8", icon: "star" },
    short: "Um menino pastor, cinco pedrinhas e um Deus muito maior do que qualquer gigante.",
    body: `O exército de Israel estava com medo. Todos os dias, um gigante chamado Golias gritava do outro lado do vale: "Quem tem coragem de lutar comigo?". Ninguém respondia.

Até que chegou Davi, um menino que cuidava das ovelhas do pai. Ele tinha ido levar comida para os irmãos e ouviu o gigante. Davi não era o mais forte nem o mais alto, mas sabia uma coisa muito importante: Deus estava com ele.

Davi não quis usar a armadura pesada do rei. Pegou o cajado, escolheu cinco pedrinhas lisas no riacho e foi enfrentar Golias dizendo que ia lutar em nome do Senhor. Com uma pedrinha só, o gigante caiu!

## O que aprendemos

- A coragem de Davi não vinha do tamanho dele, e sim da confiança em Deus.
- Deus usa pessoas pequenas para fazer coisas grandes.
- Também temos "gigantes": medo do escuro, de uma prova, de fazer amigos. Deus está com a gente em todos eles.

## Para conversar

- Qual é um "gigante" que dá medo em você hoje?
- Por que Davi não quis usar a armadura do rei?
- Quem você conhece que foi corajoso por confiar em Deus?

## Desafio da semana

Escreva ou desenhe o seu "gigante" num papel. Depois, ore com alguém da sua família entregando esse medo a Deus.

## Oração

Senhor, às vezes eu me sinto pequeno. Obrigado porque o Senhor é muito maior que qualquer gigante. Me dá coragem para confiar em ti. Amém.

## Assista no Arca Flix

Veja a série **Davi e Golias** e o episódio "Uma Aventura Gigante" do **Superbook**.`,
  },
  {
    slug: "jonas-deus-da-uma-nova-chance",
    title: "Jonas: Deus dá uma nova chance",
    kind: "historia",
    reference: "Jonas 1 a 3",
    minutes: 5,
    categories: ["antigo-testamento", "animais"],
    cover: { bg: "#d6ecff", icon: "wave" },
    short: "Jonas fugiu, foi parar dentro de um grande peixe e descobriu o tamanho do amor de Deus.",
    body: `Deus pediu a Jonas que fosse até a cidade de Nínive avisar o povo para mudar de vida. Mas Jonas não quis ir! Ele entrou num barco que ia para o lado contrário.

No meio do mar veio uma tempestade enorme. Jonas sabia que estava fugindo de Deus e pediu aos marinheiros que o jogassem na água. Então Deus mandou um grande peixe, que engoliu Jonas. Lá dentro, durante três dias, Jonas orou e pediu perdão.

O peixe colocou Jonas na praia e Deus falou com ele outra vez. Desta vez, Jonas obedeceu. O povo de Nínive ouviu, se arrependeu, e Deus perdoou a cidade inteira.

## O que aprendemos

- Não dá para fugir de Deus: ele vê e ama a gente em qualquer lugar.
- Quando erramos, podemos pedir perdão. Deus dá uma nova chance.
- Deus ama todas as pessoas, até as que a gente acha que não merecem.

## Para conversar

- Por que você acha que Jonas não quis ir a Nínive?
- O que Jonas fez dentro do peixe?
- Você já precisou de uma segunda chance? Como foi?

## Desafio da semana

Pense em alguém que errou com você. Esta semana, dê uma nova chance a essa pessoa, assim como Deus deu a Jonas.

## Oração

Pai, obrigado por me dar novas chances quando eu erro. Me ajuda a obedecer logo da primeira vez. Amém.

## Assista no Arca Flix

**Histórias de Jonas**, **Jonas e o Grande Peixe** para colorir e o episódio "Jonas" do **Superbook**.`,
  },
  {
    slug: "jose-perdoar-quem-nos-magoou",
    title: "José: perdoar quem nos magoou",
    kind: "estudo",
    reference: "Gênesis 37 a 45",
    minutes: 6,
    categories: ["antigo-testamento"],
    cover: { bg: "#ffd9e4", icon: "heart" },
    short: "Os irmãos de José foram maus com ele. Anos depois, José escolheu perdoar.",
    body: `José ganhou do pai uma túnica muito colorida. Os irmãos ficaram com tanta inveja que o venderam como escravo para o Egito. Que tristeza!

No Egito, José passou por muitas coisas difíceis — até foi preso sem ter feito nada errado. Mas ele continuou confiando em Deus e fazendo o que era certo. Com o tempo, Deus deu a José sabedoria para explicar os sonhos do faraó, e José virou governador do Egito!

Anos depois veio uma grande fome, e os irmãos de José foram ao Egito comprar comida. Eles não o reconheceram. José podia se vingar... mas chorou, abraçou os irmãos e disse que Deus tinha transformado o mal em bem.

## O que aprendemos

- Perdoar não é fingir que nada aconteceu. É escolher não se vingar.
- Mesmo nos dias difíceis, Deus continua cuidando de nós.
- Deus consegue transformar uma situação ruim em algo bom.

## Para conversar

- Como você acha que José se sentiu quando os irmãos o venderam?
- O que ajudou José a não ficar com raiva para sempre?
- Tem alguém que você precisa perdoar?

## Desafio da semana

Faça um desenho ou um bilhete de carinho para alguém com quem você brigou recentemente.

## Oração

Senhor, quando alguém me magoar, me ajuda a perdoar como José perdoou. Amém.

## Assista no Arca Flix

**José do Egito**, o episódio "José" do **Superbook** e **Minha Primeira Bíblia**.`,
  },
  {
    slug: "moises-deus-abre-caminho",
    title: "Moisés e o Mar Vermelho: Deus abre caminho",
    kind: "historia",
    reference: "Êxodo 14",
    minutes: 5,
    categories: ["antigo-testamento", "moises"],
    cover: { bg: "#d4f1ec", icon: "wave" },
    short: "Na frente, o mar. Atrás, o exército do faraó. E Deus fez um caminho no meio das águas!",
    body: `O povo de Deus finalmente saiu do Egito, onde vivia como escravo. Mas logo o faraó mudou de ideia e mandou o exército ir atrás deles.

O povo chegou à beira do Mar Vermelho e ficou desesperado: não tinha para onde fugir! Moisés disse ao povo que não tivesse medo, porque Deus ia lutar por eles.

Deus mandou Moisés estender a mão sobre o mar. Um vento forte soprou a noite toda e as águas se abriram, formando duas paredes. O povo atravessou pelo chão seco! Quando todos chegaram do outro lado, as águas voltaram ao lugar.

## O que aprendemos

- Quando parece que não tem saída, Deus pode abrir um caminho.
- Ter medo é normal; o importante é confiar em Deus mesmo com medo.
- Deus cuida do seu povo e cumpre o que promete.

## Para conversar

- O que o povo sentiu quando viu o mar na frente e o exército atrás?
- O que Moisés falou para acalmar o povo?
- Lembre de uma vez em que Deus ajudou a sua família.

## Desafio da semana

Faça um "pote de lembranças": escreva num papel cada coisa boa que Deus fizer pela sua família esta semana.

## Oração

Deus, quando eu não souber o que fazer, me lembra que o Senhor abre caminhos. Amém.

## Assista no Arca Flix

**Moisés: A Libertação de Israel**, **Moisés e o Mar Vermelho** e o labirinto **Atravesse o Mar** para imprimir.`,
  },
  {
    slug: "ester-coragem-para-fazer-o-certo",
    title: "Ester: coragem para fazer o certo",
    kind: "historia",
    reference: "Ester 4 e 5",
    minutes: 5,
    categories: ["antigo-testamento"],
    cover: { bg: "#efe4fb", icon: "crown" },
    short: "A rainha Ester arriscou tudo para salvar o seu povo.",
    body: `Ester era uma jovem judia que se tornou rainha da Pérsia. Um dia, ela descobriu que um homem chamado Hamã tinha um plano terrível contra o povo dela.

Ester precisava falar com o rei, mas havia uma regra: quem entrasse sem ser chamado podia ser castigado. O primo dela, Mardoqueu, disse que talvez Deus a tivesse colocado como rainha justamente para aquele momento.

Ester pediu que todos orassem e jejuassem por três dias. Depois, cheia de coragem, foi até o rei. O rei a recebeu com carinho, ouviu o pedido dela e o povo foi salvo!

## O que aprendemos

- Deus coloca cada um de nós num lugar especial para fazer o bem.
- Antes das decisões difíceis, é bom orar e pedir ajuda.
- Fazer o certo às vezes dá medo, mas Deus vai com a gente.

## Para conversar

- Por que Ester pediu que todos orassem antes de ir falar com o rei?
- Onde Deus colocou você para ajudar outras pessoas (casa, escola, igreja)?
- Já defendeu alguém que estava sendo tratado mal?

## Desafio da semana

Esta semana, defenda ou ajude alguém que esteja sozinho ou sendo deixado de lado.

## Oração

Senhor, me dá coragem para fazer o que é certo, mesmo quando for difícil. Amém.

## Assista no Arca Flix

O episódio "Rainha Ester" de **Desenhos Bíblicos: Antigo Testamento** e "Ester" do **Superbook**.`,
  },
  {
    slug: "zaqueu-jesus-quer-ser-seu-amigo",
    title: "Zaqueu: Jesus quer ser seu amigo",
    kind: "historia",
    reference: "Lucas 19.1-10",
    minutes: 4,
    categories: ["novo-testamento", "jesus"],
    cover: { bg: "#e3f6d3", icon: "tree" },
    short: "Zaqueu era baixinho e não tinha amigos. Jesus parou embaixo da árvore e chamou o nome dele.",
    body: `Zaqueu era cobrador de impostos e muita gente não gostava dele, porque ele cobrava mais do que devia. Um dia, Jesus passou pela cidade de Jericó e Zaqueu queria muito vê-lo. Mas tinha um problema: ele era baixinho e a multidão era grande!

Zaqueu correu na frente e subiu numa árvore. Quando Jesus chegou ali, parou, olhou para cima e disse: "Zaqueu, desça depressa! Hoje vou ficar na sua casa."

Zaqueu desceu feliz. O encontro com Jesus mudou o coração dele: ele prometeu devolver tudo o que tinha cobrado a mais e ajudar os pobres.

## O que aprendemos

- Jesus conhece você pelo nome.
- Jesus quer ser amigo de todos, até de quem os outros deixam de lado.
- Quando a gente encontra Jesus, o coração muda.

## Para conversar

- O que Zaqueu fez para conseguir ver Jesus?
- Como você acha que Zaqueu se sentiu quando Jesus chamou o nome dele?
- O que mudou na vida de Zaqueu depois do encontro com Jesus?

## Desafio da semana

Convide para brincar alguém que costuma ficar sozinho no recreio.

## Oração

Jesus, obrigado por me conhecer pelo nome e querer ser meu amigo. Amém.

## Assista no Arca Flix

**Zaqueu**, **Midinho: Zaqueu, o Publicano** e a canção "Zaqueu" da **Turminha do Criador**.`,
  },
  {
    slug: "o-bom-samaritano-quem-e-o-meu-proximo",
    title: "O Bom Samaritano: quem é o meu próximo?",
    kind: "estudo",
    reference: "Lucas 10.25-37",
    minutes: 5,
    categories: ["novo-testamento", "jesus"],
    cover: { bg: "#ffe2cc", icon: "heart" },
    short: "Jesus contou uma história para mostrar que amar o próximo é ajudar quem precisa.",
    body: `Um homem perguntou a Jesus: "Quem é o meu próximo?". Jesus respondeu com uma história.

Um viajante foi atacado por ladrões na estrada e ficou caído, machucado. Passou um sacerdote... e foi embora. Passou outro homem importante do templo... e também foi embora. Então passou um samaritano — alguém de um povo que não se dava bem com o povo do viajante. Ele parou, cuidou das feridas, levou o homem até uma hospedaria e ainda pagou pela estadia.

Jesus perguntou: "Qual dos três foi o próximo do homem ferido?". A resposta era clara: aquele que teve compaixão.

## O que aprendemos

- O próximo é qualquer pessoa que precisa de ajuda, não só os nossos amigos.
- Amar é uma atitude: parar, cuidar e ajudar.
- Jesus quer que a gente trate todo mundo com bondade.

## Para conversar

- Por que você acha que os dois primeiros homens não pararam?
- O que o samaritano fez de especial?
- Quem perto de você está precisando de ajuda?

## Desafio da semana

Faça uma boa ação escondida por dia, sem esperar nada em troca. No fim da semana, conte para a família.

## Oração

Senhor, abre os meus olhos para ver quem precisa de ajuda e me dá um coração bondoso. Amém.

## Assista no Arca Flix

O episódio "O Bom Samaritano" do **Superbook** e de **Bibtoons**.`,
  },
  {
    slug: "o-filho-prodigo-o-abraco-do-pai",
    title: "O Filho Pródigo: o abraço do Pai",
    kind: "estudo",
    reference: "Lucas 15.11-32",
    minutes: 5,
    categories: ["novo-testamento", "jesus"],
    cover: { bg: "#ffeec2", icon: "sun" },
    short: "Um filho foi embora, gastou tudo e voltou com vergonha. O pai correu para abraçá-lo.",
    body: `Jesus contou a história de um pai que tinha dois filhos. O mais novo pediu a parte da herança e foi embora para longe. Lá, gastou tudo em festas e ficou sem nada — teve que cuidar de porcos e passava fome.

Então ele pensou: "Vou voltar para casa e pedir para ser empregado do meu pai". Mas, quando ainda estava longe, o pai o viu, correu, abraçou e beijou o filho! E mandou fazer uma grande festa, porque o filho que estava perdido tinha voltado.

## O que aprendemos

- Deus é como esse pai: ele espera por nós de braços abertos.
- Não existe erro grande demais para o perdão de Deus.
- Quando alguém volta atrás e pede desculpas, devemos receber com alegria.

## Para conversar

- O que o filho mais novo sentiu quando ficou sem nada?
- O que você achou da reação do pai?
- Como podemos receber bem quem pede desculpas para nós?

## Desafio da semana

Quando alguém pedir desculpas a você esta semana, responda com um abraço.

## Oração

Pai do céu, obrigado por sempre me receber de volta. Amém.

## Assista no Arca Flix

"O Filho Pródigo" no **Superbook** e em **Bibtoons**.`,
  },
  {
    slug: "a-criacao-deus-fez-tudo-bom",
    title: "A Criação: Deus fez tudo muito bom",
    kind: "devocional",
    reference: "Gênesis 1",
    minutes: 4,
    categories: ["antigo-testamento", "animais"],
    cover: { bg: "#d9f2ff", icon: "sun" },
    short: "Luz, céu, mar, plantas, animais e pessoas: tudo saiu das mãos de Deus.",
    body: `No começo, não havia nada. Então Deus falou — e a luz apareceu! Em seis dias, Deus criou o céu, a terra e o mar, as plantas e as flores, o sol, a lua e as estrelas, os peixes e os passarinhos, e todos os animais.

Por último, Deus criou as pessoas, com muito carinho, parecidas com ele. Deus olhou para tudo o que tinha feito e viu que era muito bom. No sétimo dia, Deus descansou.

## O que aprendemos

- Tudo o que existe foi criado por Deus.
- Você foi feito com carinho e é muito especial para Deus.
- Cuidar da natureza é cuidar do presente que Deus nos deu.

## Para conversar

- Qual é a parte da criação de que você mais gosta?
- O que Deus achou de tudo o que criou?
- Como podemos cuidar da natureza em casa?

## Desafio da semana

Faça um passeio pelo quintal, pela praça ou pela janela e conte cinco coisas que Deus criou. Depois, agradeça por elas.

## Oração

Deus Criador, obrigado pelo mundo lindo que o Senhor fez — e obrigado por me fazer também. Amém.

## Para colorir

Imprima o desenho **No Princípio, Deus Criou** na seção Para Colorir.`,
  },
  {
    slug: "o-nascimento-de-jesus",
    title: "O nascimento de Jesus",
    kind: "historia",
    reference: "Lucas 2.1-20",
    minutes: 5,
    categories: ["novo-testamento", "jesus"],
    cover: { bg: "#e7e2ff", icon: "star" },
    short: "Numa noite estrelada em Belém, nasceu o maior presente que o mundo já recebeu.",
    body: `Maria e José viajaram até Belém. A cidade estava cheia e não havia lugar para eles nas hospedarias. Então ficaram num lugar onde os animais dormiam. Ali nasceu Jesus, e Maria o deitou numa manjedoura.

Naquela noite, uns pastores cuidavam das ovelhas no campo. De repente, um anjo apareceu e disse que tinha uma notícia de grande alegria: o Salvador tinha nascido! Muitos anjos começaram a louvar a Deus. Os pastores correram para Belém, encontraram o bebê e voltaram contando para todo mundo o que tinham visto.

## O que aprendemos

- Jesus é o presente de Deus para o mundo.
- Jesus nasceu num lugar simples para estar perto de todos.
- Uma notícia tão boa merece ser contada!

## Para conversar

- Por que Jesus nasceu num lugar onde ficavam os animais?
- O que os pastores fizeram depois de ver Jesus?
- Para quem você gostaria de contar sobre Jesus?

## Desafio da semana

Monte um presépio simples com papel, massinha ou brinquedos e conte a história para alguém da família.

## Oração

Jesus, obrigado por ter vindo ao mundo por amor a mim. Amém.

## Assista no Arca Flix

"O Primeiro Natal" do **Superbook**, **O Nascimento de Jesus** e o desenho **Nasceu Jesus!** para colorir.`,
  },
  {
    slug: "pascoa-jesus-esta-vivo",
    title: "Páscoa: Jesus está vivo!",
    kind: "devocional",
    reference: "Lucas 24.1-12",
    minutes: 4,
    categories: ["novo-testamento", "jesus"],
    cover: { bg: "#fff3c4", icon: "cross" },
    short: "O túmulo estava vazio. A melhor notícia de todas: Jesus ressuscitou!",
    body: `Jesus morreu na cruz por amor a nós. Seus amigos ficaram muito tristes e colocaram o corpo dele num túmulo, fechado com uma pedra enorme.

No domingo bem cedinho, algumas mulheres foram até lá. Mas a pedra tinha sido removida e o túmulo estava vazio! Dois anjos disseram: "Por que vocês procuram entre os mortos aquele que está vivo? Ele ressuscitou!". As mulheres correram para contar aos discípulos. Jesus venceu a morte!

## O que aprendemos

- A Páscoa é a festa da vida: Jesus está vivo.
- Jesus cumpriu o que tinha prometido.
- Porque Jesus vive, nunca estamos sozinhos.

## Para conversar

- O que as mulheres encontraram quando chegaram ao túmulo?
- O que os anjos disseram?
- Por que a Páscoa é mais do que chocolate?

## Desafio da semana

Escreva "Jesus vive!" num cartão bonito e entregue a alguém que você ama.

## Oração

Jesus, que alegria saber que o Senhor está vivo! Obrigado pelo seu amor. Amém.

## Assista no Arca Flix

**A Ressurreição de Jesus**, "Chocolate x Jesus" da **Turminha do Criador** e o desenho **Ele Vive!** para colorir.`,
  },
  {
    slug: "o-fruto-do-espirito",
    title: "O fruto do Espírito",
    kind: "estudo",
    reference: "Gálatas 5.22-23",
    minutes: 6,
    categories: ["novo-testamento"],
    cover: { bg: "#e3f6d3", icon: "tree" },
    short: "Amor, alegria, paz, paciência... Como uma árvore boa, a nossa vida pode dar bons frutos.",
    body: `Uma árvore boa dá frutos bons. A Bíblia diz que, quando Deus mora no nosso coração, a nossa vida também dá frutos — mas não são maçãs nem laranjas! São atitudes: **amor, alegria, paz, paciência, amabilidade, bondade, fidelidade, mansidão e domínio próprio**.

Esses frutos não aparecem de um dia para o outro. Eles crescem aos pouquinhos, quando a gente ora, lê a Bíblia e pratica o que aprende.

## O que aprendemos

- O fruto do Espírito é o jeito de Jesus aparecendo em nós.
- Cada atitude boa é como uma fruta crescendo na árvore.
- Deus nos ajuda a crescer um pouquinho a cada dia.

## Para conversar

- Qual desses frutos é mais fácil para você? E o mais difícil?
- Como a paciência pode ajudar quando o irmão pega o seu brinquedo?
- Em quem você vê muito amor e bondade?

## Desafio da semana

Escolha um fruto por dia e pratique: segunda, amor; terça, alegria; quarta, paz... No fim do dia, conte como foi.

## Oração

Espírito Santo, me ajuda a dar bons frutos para que todos vejam o amor de Jesus em mim. Amém.

## Atividade

Imprima o **Caça-palavras: Fruto do Espírito** na seção Para Colorir.`,
  },
  {
    slug: "versiculo-seja-forte-e-corajoso",
    title: "Versículo da semana: seja forte e corajoso",
    kind: "versiculo",
    reference: "Josué 1.9",
    minutes: 3,
    categories: ["antigo-testamento"],
    cover: { bg: "#ffe9b8", icon: "lion" },
    short: "Uma promessa para guardar no coração: Deus está com você por onde você for.",
    body: `Depois que Moisés morreu, Josué ficou responsável por guiar o povo de Deus até a terra prometida. Era uma missão enorme! Então Deus disse a Josué para ser forte e corajoso e não ter medo, porque o Senhor estaria com ele por onde ele andasse.

## Vamos decorar?

**"Seja forte e corajoso! Não tenha medo, pois o Senhor, o seu Deus, estará com você por onde você andar."** (Josué 1.9)

Dica: leia em voz alta uma vez por dia, fazendo um gesto para cada parte — braço forte, mão no peito, e um passo para frente no "por onde você andar".

## Para conversar

- Em que lugar você mais precisa lembrar que Deus está com você?
- O que significa ser corajoso?

## Desafio da semana

Pinte o versículo **Seja Forte e Corajoso** (seção Para Colorir) e cole perto da sua cama.

## Oração

Senhor, obrigado por estar comigo em todo lugar. Amém.`,
  },
  {
    slug: "atividade-diario-da-gratidao",
    title: "Atividade: diário da gratidão",
    kind: "atividade",
    reference: "1 Tessalonicenses 5.18",
    minutes: 10,
    categories: ["jesus"],
    cover: { bg: "#ffd9e4", icon: "heart" },
    short: "Uma semana inteira agradecendo a Deus pelas coisas grandes e pequenas.",
    body: `A Bíblia nos ensina a dar graças em todas as situações. Agradecer deixa o coração alegre e nos ajuda a perceber como Deus cuida de nós todos os dias.

## Como fazer

1. Pegue um caderno ou algumas folhas e escreva na capa: **Meu diário da gratidão**.
2. Todos os dias, antes de dormir, escreva ou desenhe **três coisas** pelas quais você quer agradecer a Deus.
3. Pode ser algo grande (a família, a saúde) ou pequeno (o lanche gostoso, uma risada com um amigo).
4. No fim da semana, leia tudo com a família e façam uma oração juntos agradecendo.

## Ideias para começar

- Uma pessoa que cuidou de mim hoje.
- Algo bonito que eu vi na natureza.
- Uma coisa nova que eu aprendi.
- Um momento em que eu ri muito.

## Para conversar

- Por que é bom agradecer mesmo nos dias difíceis?
- Qual foi a coisa mais legal que você escreveu no diário?

## Oração

Obrigado, Deus, por todas as coisas boas que o Senhor me dá todos os dias. Amém.`,
  },
  {
    slug: "pai-nosso-para-criancas",
    title: "O Pai Nosso explicado para crianças",
    kind: "estudo",
    reference: "Mateus 6.9-13",
    minutes: 6,
    categories: ["jesus", "novo-testamento"],
    cover: { bg: "#efe4fb", icon: "dove" },
    short: "Jesus ensinou os amigos a orar. Vamos entender cada parte dessa oração?",
    body: `Os discípulos pediram a Jesus: "Ensina a gente a orar". Então Jesus ensinou uma oração que até hoje é rezada no mundo inteiro. Vamos entender cada parte?

## Parte por parte

- **"Pai nosso, que estás nos céus"** — Deus é nosso Pai. Podemos falar com ele com carinho, como filhos.
- **"Santificado seja o teu nome"** — o nome de Deus é especial e merece respeito.
- **"Venha o teu Reino; seja feita a tua vontade"** — queremos que o jeito de Deus aconteça aqui na terra.
- **"O pão nosso de cada dia nos dá hoje"** — pedimos a Deus o que precisamos e confiamos que ele cuida de nós.
- **"Perdoa as nossas dívidas, assim como perdoamos"** — pedimos perdão e também perdoamos os outros.
- **"Não nos deixes cair em tentação, mas livra-nos do mal"** — pedimos ajuda para fazer o que é certo.

## Para conversar

- Qual parte da oração você achou mais bonita?
- Por que Jesus falou de perdoar dentro da oração?
- Sobre o que você gosta de conversar com Deus?

## Desafio da semana

Faça o Pai Nosso com a família antes do jantar todos os dias desta semana.

## Oração

Pai, obrigado porque eu posso conversar com o Senhor a qualquer hora. Amém.`,
  },
]
