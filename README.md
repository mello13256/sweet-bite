# SweetBite — loja online de doces

Loja online para uma doçaria: catálogo com pesquisa e filtros, página de produto com variantes, carrinho persistente e encomenda enviada pelo **WhatsApp**. Pode ligar-se opcionalmente ao **Firebase (Firestore)** para gerir o catálogo e registar os pedidos.

> **Importante:** o envio pelo WhatsApp é um **pedido de encomenda**. Não é um pagamento nem uma confirmação automática. A loja tem de responder ao cliente para confirmar a disponibilidade, a data, o custo de entrega e a forma de pagamento.

**Tecnologias:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Lucide, Firebase (opcional).

---

## Executar o projeto

Requer Node.js 20 ou mais recente.

```bash
npm install
npm run dev          # servidor de desenvolvimento em http://localhost:5173
npm run build        # verificação de tipos + build de produção (pasta dist/)
npm run preview      # pré-visualizar o build
npm test             # testes unitários (preços, carrinho, filtros, validação, WhatsApp)
```

## Onde está cada coisa

| O que quer alterar | Ficheiro |
| --- | --- |
| Nome, logótipo, cores, WhatsApp, contactos, redes sociais, horário, entregas, promoções | `src/config/store.ts` |
| Produtos | `src/data/products.ts` |
| Categorias | `src/data/categories.ts` |
| Textos de "Sobre nós", perguntas frequentes, páginas legais | `src/data/content.ts` |
| Imagem principal (hero) e imagens das secções | `src/components/home/Hero.tsx`, `src/components/home/HomeSections.tsx`, `src/pages/AboutPage.tsx` |
| Tipografia e paleta completa | `src/index.css` |
| Regras de segurança do Firestore | `firestore.rules` |

```
src/
├── config/store.ts        configuração da loja (um único sítio)
├── data/                  produtos, categorias e textos (separados dos componentes)
├── lib/                   lógica sem interface: preços, carrinho, filtros, validação, WhatsApp
├── services/              Firebase: ligação, catálogo e pedidos
├── context/               estado global: catálogo, carrinho, notificações, interface
├── components/
│   ├── layout/            cabeçalho, menu móvel, pesquisa, rodapé
│   ├── home/              hero, categorias, destaques, promoções
│   ├── product/           cartão, grelha, preço, etiquetas, variantes
│   ├── cart/              linhas do carrinho, gaveta, totais
│   └── ui/                botões, campos, imagens, gaveta acessível
└── pages/                 início, loja, produto, carrinho, encomenda, sobre, contactos, informações
```

## Alterar os produtos

Edite `src/data/products.ts`. Cada produto tem este formato:

```ts
{
  id: 'p-trufas-cacau',          // único e estável (é guardado no carrinho)
  slug: 'trufas-de-cacau',       // URL: /produto/trufas-de-cacau
  name: 'Trufas de Cacau',
  categoryId: 'chocolates',      // id de uma categoria em categories.ts
  shortDescription: '…',         // aparece no cartão
  description: '…',              // aparece na página do produto
  image: pexels(6213672),        // ou '/images/produtos/trufas.webp'
  price: 590,                    // EM CÊNTIMOS: 590 = 5,90 €
  variantLabel: 'Tamanho',       // opcional
  variants: [                    // opcional — cada opção tem o seu preço
    { id: '6', label: '6 unidades', price: 590 },
    { id: '12', label: '12 unidades', price: 1090, available: false },
  ],
  discountPercent: 15,           // opcional — promoção aplicada a todas as variantes
  available: true,               // false = esgotado (não pode ser comprado)
  isNew: true,                   // etiqueta "Novidade"
  bestSeller: true,              // etiqueta "Mais vendido"
  popularity: 90,                // ordenação "Mais populares"
  createdAt: '2026-02-10',       // ordenação "Novidades"
  allergens: ['Leite', 'Soja'],  // deixe undefined se não estiver confirmado
}
```

- **Os preços são guardados em cêntimos** (inteiros) para evitar erros de arredondamento. Descontos são arredondados ao cêntimo.
- **Alergénios:** os valores atuais são **exemplos**. Substitua-os pelos da rotulagem real ou deixe `allergens` sem valor — o site mostra então "Informação de alergénios por confirmar".
- As secções "Mais vendidos", "Novidades", "Promoções", "Combos" e "Caixas de oferta" da página inicial são geradas automaticamente a partir destes dados, por isso não há informação duplicada.
- Para desligar todas as promoções de uma vez: `promotions.enabled: false` em `src/config/store.ts`.

## Substituir as imagens

As imagens de demonstração vêm do [Pexels](https://www.pexels.com/license/) (uso gratuito, incluindo comercial) e são pedidas ao CDN já recortadas e comprimidas no tamanho certo.

Para usar fotografias próprias:

1. Coloque os ficheiros em `public/images/` (de preferência `.webp` ou `.jpg`, quadrados, com 1200 px de lado nos produtos).
2. Use o caminho no produto/categoria: `image: '/images/produtos/trufas.webp'`.

Recomendação: fotografias com o mesmo enquadramento e fundo para todos os produtos — o site corta sempre em formato quadrado nos cartões.

## Configurar o WhatsApp

Em `src/config/store.ts`:

```ts
whatsappNumber: '3519XXXXXXXX', // formato internacional, só dígitos
```

ou, sem alterar o código, numa variável de ambiente (`.env.local` ou no serviço de alojamento):

```bash
VITE_WHATSAPP_NUMBER=3519XXXXXXXX
```

Sem número configurado, o botão de envio fica desativado com uma mensagem clara — nada é simulado.

**Fluxo de encomenda:** carrinho → dados pessoais → levantamento ou entrega → resumo → "Enviar pedido pelo WhatsApp". O site abre o WhatsApp com uma mensagem formatada (produtos, variantes, quantidades, preços unitários, subtotais, total, cliente, método de entrega e observações) e uma referência (ex.: `SB-261028-7KQ2`). O cliente só tem de carregar em enviar.

## Personalizar cores e logótipo

- **Cores:** `colors` em `src/config/store.ts` (framboesa `brand-*`, chocolate `cocoa-*`, creme `cream-*`). A paleta completa está em `src/index.css`.
- **Logótipo:** por omissão é o nome da loja em tipografia + um coração desenhado em SVG. Para usar uma imagem, coloque-a em `public/` e defina `logo.image: '/logo.svg'`.
- **Favicon:** `public/favicon.svg`.
- **Tipografia:** Fraunces (títulos) e Plus Jakarta Sans (texto), alojadas no próprio site (sem pedidos ao Google Fonts).
- **Faixa "Loja de demonstração":** `demoMode: false` em `src/config/store.ts` quando os conteúdos forem reais.

---

## Firebase (opcional)

O site funciona **sem Firebase**. Ao ligá-lo ganha:

1. **Registo dos pedidos** na coleção `orders` do Firestore, antes de abrir o WhatsApp (consulte-os na consola do Firebase).
2. **Catálogo no Firestore** (opcional): alterar produtos, preços e disponibilidade na consola do Firebase, sem publicar o site novamente.

### Passos

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com) e ative o **Cloud Firestore** (região `eur3` ou `europe-west`, por proximidade e RGPD).
2. *Definições do projeto → As suas apps → Adicionar app Web* e copie a configuração.
3. Copie `.env.example` para `.env.local` e preencha:

   ```bash
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_CATALOG_SOURCE=local      # ou 'firestore'
   VITE_SAVE_ORDERS=true
   ```

   A configuração Web do Firebase não é secreta — a segurança é garantida pelas regras do Firestore.

4. Publique as regras de segurança:

   ```bash
   cp .firebaserc.example .firebaserc   # e coloque o id do projeto
   npx firebase-tools deploy --only firestore:rules
   ```

5. *(Só se usar `VITE_CATALOG_SOURCE=firestore`)* Carregue os produtos e categorias:
   - *Definições do projeto → Contas de serviço → Gerar nova chave privada* — guarde como `service-account.json` (já está no `.gitignore`, **nunca o publique**).
   - `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json FIREBASE_PROJECT_ID=o-seu-projeto npm run seed:firestore`
   - Pode repetir o comando sempre que alterar `src/data/`; `--prune` remove do Firestore o que já não existe localmente.

### Regras de segurança (`firestore.rules`)

- `products` e `categories`: leitura pública; escrita só pela consola ou pelo script de seed.
- `orders`: o site **só pode criar** pedidos com estrutura válida (estado `pendente`, data do servidor, limites de tamanho). **Ninguém pode ler, alterar ou apagar pedidos a partir do site.**
- Os preços de um pedido vêm do navegador do cliente — confira sempre o pedido antes de o confirmar.

### Emulador local (desenvolvimento)

```bash
npx firebase-tools emulators:start --only firestore --project demo-sweetbite
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=demo-sweetbite npm run seed:firestore
# e no .env.local: VITE_FIRESTORE_EMULATOR_HOST=localhost:8080 (+ as restantes VITE_FIREBASE_* com valores fictícios)
```

### O que exige um servidor (não implementado)

Estas funcionalidades **não estão incluídas** e não são simuladas, porque precisam de backend e/ou de serviços contratados:

- **Pagamentos online** (MB WAY, Multibanco, cartão) — requer um prestador de pagamentos (ex.: Stripe, easypay, ifthenpay) e uma função de servidor para criar e validar pagamentos.
- **Confirmação automática de encomendas / emails** — requer Cloud Functions (ou outro servidor) e um serviço de email.
- **Gestão de stock em tempo real** — requer descontar stock no servidor quando a encomenda é confirmada.
- **Área de administração no site** — requer Firebase Authentication e regras de acesso para administradores (hoje a gestão é feita na consola do Firebase).
- **Contas de cliente** — requer Firebase Authentication.

---

## Publicar o site

O build gera ficheiros estáticos em `dist/`. O site usa rotas do lado do cliente, por isso o alojamento tem de devolver `index.html` para qualquer caminho (já configurado para Netlify e Firebase Hosting).

**Netlify** (como no projeto anterior): *Add new site → Import from Git*, comando `npm run build`, pasta `dist`. O ficheiro `public/_redirects` já trata das rotas. Defina as variáveis `VITE_*` em *Site configuration → Environment variables*.

**Firebase Hosting:**

```bash
npm run build
npx firebase-tools deploy --only hosting
```

`firebase.json` já inclui o redirecionamento para `index.html` e cache longa para os ficheiros em `assets/`.

## Antes de usar comercialmente

- [ ] Número de WhatsApp, telefone, email, morada e redes sociais reais em `src/config/store.ts`.
- [ ] Horário, zonas e custos de entrega reais.
- [ ] Produtos, preços, fotografias e **alergénios confirmados** pela rotulagem.
- [ ] Textos legais em `src/data/content.ts` (condições de encomenda, privacidade, livro de reclamações) revistos por um profissional — os textos incluídos são modelos e não constituem aconselhamento jurídico.
- [ ] `demoMode: false`.

## Testes

- `npm test` — 23 testes unitários: arredondamentos, descontos, carrinho (quantidades inválidas, dados corrompidos), filtros e ordenação, validação de formulários e conteúdo da mensagem de WhatsApp.
- O fluxo completo (pesquisa, filtros, variantes, carrinho, persistência, encomenda, WhatsApp, responsividade a 390 px) e a integração com o Firestore (regras, seed, catálogo e gravação de pedidos no emulador) foram testados no Chromium durante o desenvolvimento.
