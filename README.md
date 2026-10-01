# 🚨 Bairro Alerta — Rede Comunitária de Alertas de Desastres Climáticos

> **Projeto desenvolvido como protótipo ágil para Hackathon (tempo estimado de execução: ~1h30).**  
> Uma plataforma colaborativa e hiperlocal para emissão e visualização de alertas sobre eventos climáticos extremos (enchentes, temporais, deslizamentos, ondas de calor provocadas por fenômenos como *Super El Niño*).

---

## 📌 Sumário
- [💡 Sobre o Projeto](#-sobre-o-projeto)
- [🎯 O Problema & A Solução](#-o-problema--a-solução)
- [✨ Funcionalidades do Protótipo (MVP)](#-funcionalidades-do-protótipo-mvp)
- [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [📂 Estrutura de Pastas](#-estrutura-de-pastas)
- [🏛️ Arquitetura do Sistema](#️-arquitetura-do-sistema)
- [🗄️ Modelo de Banco de Dados (Prisma)](#️-modelo-de-banco-de-dados-prisma)
- [🔌 Endpoints da API (REST)](#-endpoints-da-api-rest)
- [🚀 Como Executar o Projeto](#-como-executar-o-projeto)
  - [Pré-requisitos](#pré-requisitos)
  - [Backend](#1-configuração-do-backend)
  - [Frontend](#2-execução-do-frontend)
- [🗺️ Próximos Passos (Pós-Hackathon)](#️-próximos-passos-pós-hackathon)

---

## 💡 Sobre o Projeto

Com o aumento na frequência e intensidade de eventos climáticos severos decorrentes do aquecimento global e fenômenos anômalos como o **Super El Niño**, comunidades locais frequentemente sofrem com a falta de comunicação imediata e hiperlocal. 

O **Bairro Alerta** nasce como uma solução simples, direta e de resposta rápida: uma aplicação web onde os próprios cidadãos e voluntários reportam incidentes e áreas de risco em tempo real, informando localização, tipo de desastre e raio de impacto estimado para prevenir acidentes e salvar vidas.

---

## 🎯 O Problema & A Solução

* **O Problema:** Avisos oficiais da Defesa Civil nem sempre chegam a tempo ou com o nível de detalhe de uma rua/bairro específico que está alagando naquele exato minuto.
* **A Solução:** Um mural colaborativo e imediato onde qualquer morador cadastrado pode registrar um alerta com raio de perigo, permitindo que a vizinhança tome medidas de evacuação ou proteção patrimonial com antecedência.

---

## ✨ Funcionalidades do Protótipo (MVP)

Projetado estrategicamente para ser entregue no formato enxuto de **1h30 de Hackathon**:

1. **Autenticação Simples & Segura:**
   - Cadastro de novos usuários.
   - Login com geração de token JWT e proteção de senhas via Hash (Bcrypt).
2. **Emissão Rápida de Alerta:**
   - Formulário ágil: Título, tipo do desastre (enchente, deslizamento, vendaval, calor extremo, etc.), descrição, endereço/bairro e raio estimado de impacto em metros/km.
3. **Mural de Visualização de Alertas:**
   - Feed de incidentes ativos em tempo real com indicador visual de gravidade.
   - Detalhes de localização e raio afetado.

---

## 🛠️ Tecnologias Utilizadas

Para atender à meta de entrega rápida e sem dependência excessiva de bibliotecas pesadas:

### **Frontend** (100% Vanilla — Sem frameworks)
- **HTML5:** Estrutura semântica das páginas.
- **CSS3:** Estilização moderna, responsiva e com feedback visual claro (alerta/perigo).
- **JavaScript (ES6+):** Manipulação de DOM e requisições assíncronas via `fetch API`.

### **Backend** (Robusto, tipado e modular)
- **Node.js** com **TypeScript**
- **Express:** Criação dos endpoints da API REST.
- **PostgreSQL:** Banco de dados relacional para persistência de usuários e ocorrências.
- **Prisma ORM:** Modelagem, migrations e queries de banco seguras e tipadas.
- **JWT (JSON Web Token):** Autenticação stateless de rotas protegidas.
- **Bcrypt:** Hash seguro de senhas.
- **CORS & Dotenv:** Configuração de ambiente e segurança de requisições.

---

## 📂 Estrutura de Pastas

```text
bairroAlerta/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma             # Modelagem do banco de dados
│   ├── src/
│   │   ├── @types/                   # Definições de tipos customizados (ex: Request com userId)
│   │   ├── controllers/              # Recepção das requisições e envio de respostas HTTP
│   │   │   ├── authController.ts
│   │   │   └── alertController.ts
│   │   ├── services/                 # Regras de negócio e validações
│   │   │   ├── authService.ts
│   │   │   └── alertService.ts
│   │   ├── repositories/             # Comunicação direta com o Prisma
│   │   │   ├── userRepository.ts
│   │   │   └── alertRepository.ts
│   │   ├── routes/                   # Definição e roteamento das rotas da API
│   │   │   ├── authRoutes.ts
│   │   │   ├── alertRoutes.ts
│   │   │   └── index.ts
│   │   ├── middlewares/              # Interceptadores (autenticação JWT, tratamento de erros)
│   │   │   └── authMiddleware.ts
│   │   ├── utils/                    # Funções utilitárias (geração de hash, validações)
│   │   └── server.ts                 # Inicialização do Express
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── assets/                       # Ícones e imagens
│   ├── styles/                       # Folhas de estilo CSS
│   │   ├── global.css
│   │   ├── auth.css
│   │   └── alerts.css
│   ├── api/                          # Funções auxiliares para consumo do backend
│   │   └── api.js                    # Wrapper do Fetch API + gerenciamento de token
│   ├── pages/                        # Páginas HTML da aplicação
│   │   ├── login.html                # Tela de Login
│   │   ├── cadastro.html             # Tela de Cadastro de Usuário
│   │   ├── criar-alerta.html         # Formulário de novo alerta
│   │   └── alertas.html              # Feed e visualização de alertas ativos
│   └── index.html                    # Redirecionamento inicial ou Landing Page
│
└── README.md                         # Documentação oficial do projeto
```

---

## 🏛️ Arquitetura do Sistema

O backend adota o padrão de **Camadas (Layered Architecture)**, garantindo separação clara de responsabilidades mesmo em um projeto relâmpago:

```mermaid
graph TD
    Client[Frontend: HTML/CSS/JS] -->|Requisição HTTP / JSON| Routes[Routes]
    Routes -->|Validação de Token| Middleware[Auth Middleware]
    Middleware --> Controllers[Controllers]
    Controllers --> Services[Services: Regras de Negócio]
    Services --> Repositories[Repositories: Prisma ORM]
    Repositories --> Database[(PostgreSQL Database)]
```

* **Controllers:** Validam campos básicos da requisição e formatam a resposta HTTP (`res.status(200).json(...)`).
* **Services:** Aplicam a lógica de negócios (ex: verificar se e-mail já existe, criptografar senha, validar dados do alerta).
* **Repositories:** Isola as chamadas ao banco via Prisma Client.
* **Middlewares:** Protegem rotas que exigem o cabeçalho `Authorization: Bearer <TOKEN>`.

---

## 🗄️ Modelo de Banco de Dados (Prisma)

Exemplo de schema enxuto planejado para `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  alerts    Alert[]
}

model Alert {
  id          String   @id @default(uuid())
  title       String
  type        String   // Ex: "ENCHENTE", "DESLIZAMENTO", "TEMPESTADE", "CALOR_EXTREMO"
  description String
  location    String   // Bairro, rua ou coordenada aproximada
  radiusKm    Float    // Raio de impacto estimado em quilômetros
  severity    String   // "BAIXA", "MEDIA", "ALTA", "CRITICA"
  createdAt   DateTime @default(now())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## 🔌 Endpoints da API (REST)

### Autenticação (`/api/auth`)
| Método | Rota | Descrição | Requer Auth | Payload Exemplo |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Cria novo usuário | ❌ Não | `{ "name": "Maria", "email": "maria@email.com", "password": "123" }` |
| `POST` | `/api/auth/login` | Realiza login e gera JWT | ❌ Não | `{ "email": "maria@email.com", "password": "123" }` |

### Alertas (`/api/alerts`)
| Método | Rota | Descrição | Requer Auth | Payload Exemplo |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/alerts` | Lista alertas recentes | ❌ Não | — |
| `POST` | `/api/alerts` | Cria novo alerta comunitário | ✅ Sim | `{ "title": "Rua X Alagada", "type": "ENCHENTE", "description": "Água subindo rápido", "location": "Centro", "radiusKm": 1.5, "severity": "ALTA" }` |
| `GET` | `/api/alerts/:id` | Detalhes de um alerta | ❌ Não | — |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (ou instância local/Docker)
- Navegador moderno

---

### 1. Configuração do Backend

1. Acesse o diretório do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install express cors dotenv jsonwebtoken bcrypt
   npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt prisma
   ```

3. Configure o arquivo `.env`:
   ```env
   PORT=3333
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/bairroalerta?schema=public"
   JWT_SECRET="seu_jwt_secret_super_seguro"
   ```

4. Execute as migrations do Prisma:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O backend estará rodando em:* `http://localhost:3333`

---

### 2. Execução do Frontend

Por ser puramente HTML, CSS e JavaScript Vanilla, não há necessidade de build:

1. Acesse a pasta `frontend`:
   ```bash
   cd ../frontend
   ```

2. Abra o arquivo `index.html` ou `pages/login.html` no navegador:
   - Dica: Utilize a extensão **Live Server** do VS Code, ou execute um servidor estático simples:
     ```bash
     npx serve .
     ```
   - O frontend consumirá a API configurada em `http://localhost:3333`.

---

## 🗺️ Próximos Passos (Pós-Hackathon)

Recursos planejados para expansão futura após a apresentação do pitch:
- [ ] **Mapa Interativo:** Integração com Leaflet / OpenStreetMap para renderizar o círculo do raio afetado.
- [ ] **Notificações Push / SMS:** Alerta instantâneo para vizinhos no raio delimitado via WebSockets ou bot de WhatsApp/Telegram.
- [ ] **Votação Comunitária / Validação:** Mecanismo para confirmar se o alerta ainda está ativo ou se a situação foi normalizada.
- [ ] **Integração com Órgãos Públicos:** Consumo de APIs públicas da Defesa Civil e CEMADEN.

---

## 👥 Equipe & Hackathon
Projeto concebido e prototipado em ambiente de maratona de programação.
Focado em impacto social, sustentabilidade e resiliência climática comunitária.
