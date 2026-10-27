# 🚨 Bairro Alerta — Rede Comunitária de Alertas de Desastres Climáticos

> Projeto desenvolvido na **Hackatown (Jornada Acadêmica UNIFRAN 2026)**, em equipe de 5 pessoas, com foco em impacto social e resiliência climática. O protótipo funcional foi entregue em 3 horas.

Plataforma colaborativa e hiperlocal onde moradores registram e consultam alertas sobre eventos climáticos extremos (enchentes, alagamentos, deslizamentos, vendavais, calor extremo e outros).

🔗 **Demonstração (front-end):** https://bairroalerta-frontend.vercel.app/
🔗 **API (hospedada no Render):** https://bairroalerta.onrender.com

---

## 📌 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#️-tecnologias)
- [Arquitetura](#️-arquitetura)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Endpoints da API](#-endpoints-da-api)
- [Como executar](#-como-executar)
- [Próximos passos](#️-próximos-passos)
- [Equipe](#-equipe)

---

## 💡 Sobre o projeto

Avisos oficiais nem sempre chegam com o nível de detalhe de uma rua ou bairro específico. O **Bairro Alerta** permite que moradores cadastrados registrem ocorrências informando tipo de evento, gravidade, raio estimado de impacto e a posição no mapa, para que a vizinhança possa se proteger com antecedência.

---

## ✨ Funcionalidades

**Autenticação**
- Cadastro e login de moradores (senha com no mínimo 8 caracteres)
- Senhas protegidas com `bcrypt`
- Autenticação stateless com JWT (token com validade de 1 dia)
- A API não inicia sem `JWT_SECRET` (mínimo de 32 caracteres) nem sem `DATABASE_URL`

**Mural e mapa de alertas**
- Lista de alertas ordenada do mais recente para o mais antigo
- Pinos no mapa com cor por gravidade: **Baixa**, **Média**, **Alta** e **Crítica**
- Filtros por tipo de evento e por gravidade
- Detalhes completos de cada alerta

**Criação de alertas** (apenas usuários autenticados)
- Seleção do ponto no mapa
- Tipos: Enchente, Alagamento, Chuva forte, Deslizamento, Tempestade, Vendaval, Calor extremo e Outros
- Gravidade, raio estimado (em km) e descrição

**Guia de orientações**
- Procedimentos preventivos e de emergência por tipo de evento
- Contatos de emergência: Defesa Civil **199**, Bombeiros **193** e SAMU **192**

> ℹ️ O mapa atual é uma **imagem ilustrativa** (`frontend/assets/mapa-bairro.svg`). A posição de cada alerta é guardada como coordenadas relativas (`mapX` e `mapY`), e não como latitude e longitude. A integração com mapas reais está nos próximos passos.

---

## 🛠️ Tecnologias

**Front-end** (HTML, CSS e JavaScript puros, sem frameworks)
- HTML5, CSS3 e JavaScript (ES6+)
- Consumo da API com `fetch`
- Hospedagem na Vercel

**Back-end**
- Node.js e TypeScript
- Express 4 (rotas e middlewares)
- **PostgreSQL** (Neon) com **Prisma ORM**
- `jsonwebtoken` (JWT) e `bcrypt` (hash de senhas)
- **Zod** (validação dos dados de entrada)
- **Jest** e **Supertest** (testes automatizados)
- `cors` e `dotenv`
- Hospedagem no Render

---

## 🏛️ Arquitetura

O back-end segue uma arquitetura em camadas, separando rotas, regras de negócio e acesso a dados:

```mermaid
graph TD
    Client[Front-end: HTML/CSS/JS] -->|HTTP + JSON, token JWT| Routes[Routes]
    Routes --> Middleware[authMiddleware: valida o Bearer token]
    Routes --> Validate[validate: schemas Zod]
    Validate --> Controllers[Controllers: recebem a requisição]
    Middleware --> Controllers
    Controllers --> Services[Services: regras de negócio]
    Services --> Repositories[Repositories: acesso a dados]
    Repositories --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL)]
```

**Modelo de dados** (`backend/prisma/schema.prisma`): `User` (1) ── (N) `Alert`.

---

## 📂 Estrutura de pastas

```text
bairroAlerta/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelos User e Alert (PostgreSQL)
│   │   └── seed.ts              # Importa dados antigos de data/*.json (opcional)
│   ├── src/
│   │   ├── config/              # env.ts (variáveis de ambiente) e prisma.ts
│   │   ├── controllers/         # authController, alertController
│   │   ├── middlewares/         # authMiddleware, validate, errorHandler
│   │   ├── repositories/        # userRepository, alertRepository
│   │   ├── routes/              # authRoutes, alertRoutes, index
│   │   ├── schemas/             # Schemas Zod de cadastro, login e alertas
│   │   ├── services/            # authService, alertService
│   │   ├── types/               # express.d.ts (req.userId)
│   │   ├── utils/               # AppError, asyncHandler, hash, jwt, httpStatusCodes
│   │   ├── app.ts               # Configuração do Express
│   │   └── server.ts            # Inicialização do servidor
│   ├── tests/                   # Testes com Jest + Supertest (sem banco real)
│   ├── .env.example
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── assets/
│   │   └── mapa-bairro.svg      # Mapa ilustrativo
│   ├── pages/                   # login, cadastro, criar-alerta, orientacoes
│   ├── scripts/                 # api.js (cliente da API), alerts.js, create-alert.js, ...
│   ├── styles/                  # CSS por página
│   └── index.html               # Mural de alertas + mapa
│
└── README.md
```

---

## 🔌 Endpoints da API

Prefixo: `/api`. Rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

### Autenticação (`/api/auth`)

| Método | Endpoint | Protegido | Descrição | Body |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/register` | ❌ | Cadastra um morador | `{ "name", "email", "password" }` |
| `POST` | `/api/auth/login` | ❌ | Autentica e retorna `{ message, token, user }` | `{ "email", "password" }` |

### Alertas (`/api/alerts`)

| Método | Endpoint | Protegido | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/alerts` | ❌ | Lista os alertas, do mais recente para o mais antigo |
| `GET` | `/api/alerts/:id` | ❌ | Detalhes de um alerta (`404` se não existir) |
| `POST` | `/api/alerts` | ✅ | Cria um alerta (retorna `201`) |

Exemplo de body para `POST /api/alerts` (todos os campos são obrigatórios):

```json
{
  "title": "Rua alagada",
  "type": "ENCHENTE",
  "description": "Água subindo rápido na avenida principal",
  "location": "Rua das Flores",
  "radiusKm": 1.5,
  "severity": "ALTA",
  "mapX": 45.2,
  "mapY": 60.1
}
```

- `type`: `ENCHENTE`, `ALAGAMENTO`, `CHUVA`, `DESLIZAMENTO`, `TEMPESTADE`, `VENDAVAL`, `CALOR_EXTREMO` ou `OUTROS`
- `severity`: `BAIXA`, `MEDIA`, `ALTA` ou `CRITICA`

**Regras de validação** (erros devolvem `400` com `{ "error": "...", "details": [{ "field", "message" }] }`):

| Campo | Regra |
| :--- | :--- |
| `name` | 2 a 80 caracteres |
| `email` | formato válido (salvo em minúsculas) |
| `password` | mínimo de 8 caracteres |
| `title` | 3 a 70 caracteres |
| `description` | 5 a 300 caracteres |
| `location` | 2 a 80 caracteres |
| `radiusKm` | entre 0,1 e 50 |
| `mapX`, `mapY` | entre 0 e 100 |

**Status HTTP:** `201` criado, `400` dados inválidos, `401` token ausente/inválido ou credenciais incorretas, `404` não encontrado, `409` e-mail já cadastrado. O e-mail do autor nunca é devolvido nas rotas de alertas, apenas o nome (`author`).

### Diagnóstico

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/health` | Healthcheck: `{ "status": "OK", "message": "Backend is running" }` |

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Um banco **PostgreSQL**: pode ser local ou gratuito na nuvem, como [Neon](https://neon.tech/)

### 1. Back-end

```bash
cd backend
npm install        # também executa `prisma generate`
cp .env.example .env
```

Edite o `.env` com os seus valores:

```env
PORT=3333
JWT_SECRET="troque-por-uma-chave-longa-e-aleatoria"
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO"
# Opcional: origens do front-end permitidas no CORS, separadas por vírgula
# CORS_ORIGIN="https://seu-front.vercel.app,http://localhost:3000"
```

Gere um `JWT_SECRET` seguro com:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Crie as tabelas e inicie o servidor:

```bash
npm run db:push    # cria as tabelas no banco
npm run dev        # servidor em http://localhost:3333
```

Para produção: `npm run build` e depois `npm start`.

**Testes** (não precisam de banco de dados):

```bash
npm test
```

### 2. Front-end

```bash
cd frontend
npx serve .
```

Por padrão, o front-end usa a API de produção (`https://bairroalerta.onrender.com/api`). Para usar o back-end local, defina `window.__API_URL__ = 'http://localhost:3333/api'` antes de carregar `scripts/api.js`, ou altere `PRODUCTION_API_URL` nesse arquivo.

---

## 🗺️ Próximos passos

- [ ] Mapa real com geolocalização (Leaflet + OpenStreetMap)
- [ ] Limite de tentativas (rate limit) nas rotas de login e cadastro
- [ ] Migrations do Prisma em vez de `db push`
- [ ] Notificações push para moradores da região
- [ ] Confirmação comunitária ("o problema ainda está ocorrendo?")
- [ ] Integração com dados da Defesa Civil e do CEMADEN
- [ ] Docker e docker-compose para o ambiente de desenvolvimento

---

## 👥 Equipe

Projeto desenvolvido por 5 pessoas durante a Hackatown (Jornada Acadêmica UNIFRAN 2026).

| Integrante | Responsabilidade |
| :--- | :--- |
| **Gustavo Amancio** | API REST, autenticação (JWT) e arquitetura do back-end |
| _[Nome]_ | _[Responsabilidade]_ |
| _[Nome]_ | _[Responsabilidade]_ |
| _[Nome]_ | _[Responsabilidade]_ |
| _[Nome]_ | _[Responsabilidade]_ |
