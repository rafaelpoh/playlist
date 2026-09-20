# Playlist | Filmes, Séries & Animes

Plataforma integrada de entretenimento para busca, descoberta, visualização de trailers e gerenciamento de títulos para assistir (Watchlist) de **Filmes**, **Séries** e **Animes**.

Desenvolvida com **React 18+**, **TypeScript (estrito)**, **Vite**, **CSS Modules**, validação em runtime com **Zod**, e persistência em nuvem com **Firebase Auth & Cloud Firestore**.

---

## 🚀 Funcionalidades Principais

- **Catálogo Unificado:**
  - 🎬 **Filmes:** Em Cartaz e Próximos Lançamentos (via The Movie Database - TMDb API).
  - 📺 **Séries:** Séries no Ar e Mais Populares (via The Movie Database - TMDb API).
  - ⚡ **Animes:** Temporada Atual e Top Animes (via Jikan API v4).
- **Busca em Tempo Real:** Pesquisa inteligente com *debounce* otimizado em todo o catálogo ou filtrada por categoria.
- **Player de Trailers:** Modal imersivo com proporção 16:9, validação estrita de URLs seguras do YouTube/Jikan, controle por teclado (`Esc`) e fechamento suave.
- **Autenticação com Firebase Auth:**
  - Login e Cadastro com E-mail e Senha (validação com Zod).
  - Login integrado com Google (`GoogleAuthProvider`).
  - Modo Visitante (*Guest Mode*) para experimentação instantânea sem atrito.
- **Minha Lista (Watchlist) em Tempo Real:**
  - Salvar e remover títulos favoritos clicando no marcador dos cards.
  - Sincronização reativa instantânea via Cloud Firestore (`onSnapshot`).
  - Contador dinâmico de itens salvos na barra de navegação.
- **Design Impeccable (Tema Cinemático Escuro):**
  - Identidade visual com acentos dedicados (Filmes em Coral/Rosa, Séries em Violeta/Índigo e Animes em Laranja Solar).
  - 100% tokenizado em `src/styles/tokens.css` (zero valores hardcoded).
  - Skeletons animados (*shimmer effect*) prevenindo deslocamentos de layout (*CLS*).

---

## 🛠️ Tecnologias e Padrões de Arquitetura

A aplicação segue rigorosamente as diretrizes de desenvolvimento do `/reactspecs`:

| Camada / Função | Tecnologia | Justificativa / Padrão |
|---|---|---|
| **Linguagem** | TypeScript 5.6+ | Tipagem estrita (`strict: true`, `noUncheckedIndexedAccess: true`), contratos explícitos e ausência de `any`. |
| **Biblioteca de UI** | React 18+ | Componentes funcionais puros, imutabilidade de estado e hooks nativos. |
| **Bundler / Build** | Vite 5+ | Hot Module Replacement (HMR) ultrarrápido e compilação otimizada para produção. |
| **Validação de Dados** | Zod | Validação em runtime na fronteira de entrada das APIs (TMDb e Jikan). |
| **Estilização** | CSS Modules + Tokens nativos | Escopo encapsulado por componente com Design Tokens centralizados em variáveis CSS. |
| **Autenticação & Banco** | Firebase Auth & Cloud Firestore | Gerenciamento de sessões e sincronização em tempo real de favoritos. |
| **Ícones** | Lucide-React | Ícones consistentes, leves e com zero impacto no bundle. |

---

## 📁 Estrutura de Diretórios

O projeto adota uma arquitetura orientada a domínios (**Feature-Driven & Colocation**):

```text
/
├── index.html                   # Ponto de montagem HTML com fontes Inter/Outfit e SEO
├── package.json                 # Dependências e scripts
├── tsconfig.json                # Configurações estritas do TypeScript
├── vite.config.ts               # Configuração do Vite com aliases @/
├── vercel.json                  # Roteamento SPA e headers de segurança na Vercel
├── firebase.json                # Configurações de deploy do Firebase
├── firestore.rules              # Regras de segurança do Cloud Firestore
├── .firebaserc                  # Vinculação ao projeto Firebase (playlist-app-2026)
├── .env.example                 # Modelo de variáveis de ambiente
├── .gitignore                   # Arquivos e pastas ignorados no versionamento
├── /api                         # Serverless Functions da Vercel (BFF de proxy seguro)
│   └── tmdb.ts
├── /public                      # Mídias e ícones estáticos
└── /src
    ├── main.tsx                 # Inicialização do React (createRoot)
    ├── App.tsx                  # Composição e orquestração global
    ├── App.module.css           # Estilização do layout principal
    ├── /styles                  # Design Tokens e Reset
    │   ├── tokens.css
    │   └── reset.css
    ├── /services                # Singletons de infraestrutura (firebase.ts)
    ├── /types                   # Contratos e interfaces TypeScript compartilhadas
    ├── /utils                   # Funções puras (formatters.ts, security.ts)
    ├── /hooks                   # Hooks utilitários (useDebounce, useTrailerModal)
    ├── /features                # Módulos verticais de negócio
    │   ├── auth/                # Contexto de autenticação, UserMenu e AuthModal
    │   ├── watchlist/           # Hook, serviços e schemas da Minha Lista (Firestore)
    │   ├── movies/              # Schemas Zod, API e hook de filmes (TMDb)
    │   ├── series/              # Schemas Zod, API e hook de séries (TMDb)
    │   └── animes/              # Schemas Zod, API e hook de animes (Jikan v4)
    └── /components              # Componentes de interface desacoplados
        ├── Header/
        ├── SearchBar/
        ├── NavigationTabs/
        ├── MediaCard/
        ├── MediaGrid/
        ├── TrailerModal/
        ├── SkeletonCard/
        └── EmptyState/
```

---

## 🚦 Como Executar o Projeto

### Pré-requisitos
- **Node.js**: v18+ (recomendado v20 ou superior)
- **npm** (ou yarn/pnpm)

### Instalação

1. Clone o repositório ou navegue até a pasta do projeto:
```bash
cd playlist
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Configure as variáveis de ambiente em um arquivo `.env.local` baseado no `.env.example`:
```bash
cp .env.example .env.local
```

### Scripts Disponíveis

```bash
# Iniciar o servidor de desenvolvimento local (porta 3000)
npm run dev

# Executar a verificação estrita de tipagem TypeScript
npm run type-check

# Gerar o build otimizado para produção
npm run build

# Pré-visualizar o build de produção localmente
npm run preview
```

---

## 🔒 Segurança de Chaves de API & Vercel Serverless

Para garantir segurança total, a aplicação adota o padrão **BFF (Backend For Frontend)** utilizando **Serverless Edge Functions da Vercel**:

- **Ocultação de Segredos**: A chave de API da TMDb (`TMDB_API_KEY`) nunca é incluída no código do cliente ou enviada ao navegador do usuário.
- **Proxy Seguro (`api/tmdb.ts`)**: O cliente faz requisições exclusivamente para o endpoint interno `/api/tmdb?path=...`. A Edge Function injeta a chave no servidor e aplica cache na borda (`s-maxage=3600`), reduzindo a latência e o consumo de requisições externas.
- **Ambiente Local**: No desenvolvimento com `npm run dev`, um middleware embutido no `vite.config.ts` emula o comportamento do servidor sem expor chaves no bundle.

---

## 🚀 Como Fazer o Deploy na Vercel

1. **Importar o Projeto**: Conecte o repositório no painel da [Vercel](https://vercel.com).
2. **Definir as Variáveis de Ambiente** em **Project Settings > Environment Variables**:
   - `TMDB_API_KEY`: sua chave de API da TMDb.
   - `VITE_FIREBASE_API_KEY`: sua chave web do Firebase.
   - `VITE_FIREBASE_AUTH_DOMAIN`: domínio de auth do Firebase (`playlist-app-2026.firebaseapp.com`).
   - `VITE_FIREBASE_PROJECT_ID`: ID do projeto (`playlist-app-2026`).
   - `VITE_FIREBASE_STORAGE_BUCKET`: bucket do storage.
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: ID do remetente.
   - `VITE_FIREBASE_APP_ID`: ID da aplicação web.
3. **Autorizar o Domínio no Firebase**:
   - No [Firebase Console](https://console.firebase.google.com/), acesse **Authentication > Settings > Authorized domains**.
   - Adicione o domínio gerado pela Vercel (ex: `seu-projeto.vercel.app`).
4. **Deploy Automático**: Cada push na branch principal acionará o build de produção automaticamente com rotas e serverless functions configuradas via `vercel.json`.

---

## 🔒 Segurança & Regras do Firestore

O projeto utiliza regras estritas em `firestore.rules`, garantindo que cada usuário acesse exclusivamente seus próprios títulos na lista:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/watchlist/{mediaId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
