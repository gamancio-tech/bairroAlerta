# Guia: Conexão com o Banco de Dados + Deploy (Render & Vercel)

Este guia cobre três etapas: resolver a conexão com o banco Neon, fazer o deploy do backend no Render e configurar o frontend na Vercel.

---

## Parte 1 — Resolvendo a Conexão com o Banco (Neon.tech)

O erro `P1001: Can't reach database server` indica que o servidor PostgreSQL na Neon está pausado por inatividade ou a URL de conexão expirou.

### Passo a Passo

1. **Acessar o painel da Neon:**
   - Acesse [https://console.neon.tech](https://console.neon.tech) e faça login.

2. **Verificar o status do projeto:**
   - No dashboard, procure o projeto `neondb`. Verifique se ele está **Active** (verde). Se estiver como **Suspended** ou **Idle**, clique nele — a Neon geralmente reativa automaticamente ao acessar.

3. **Copiar a Connection String atualizada:**
   - Dentro do projeto, vá até a aba **Connection Details**.
   - Selecione **Prisma** no dropdown de frameworks (isso gera a URL no formato correto).
   - Copie a string completa. Ela terá esse formato:
     ```
     postgresql://neondb_owner:SENHA@ep-XXXXXX.sa-east-1.aws.neon.tech/neondb?sslmode=require
     ```

4. **Atualizar o `.env` local:**
   - Cole a nova string no seu arquivo `backend/.env`:
     ```env
     DATABASE_URL="SUA_STRING_COPIADA_AQUI"
     ```

5. **Testar a conexão e rodar as migrations:**
   - Abra o terminal na pasta `backend/` e execute:
     ```bash
     npx prisma migrate dev --name add_map_coordinates
     ```
   - Se der certo, verá a mensagem `Your database is now in sync with your schema`.

6. **Testar o servidor:**
   ```bash
   npm run dev
   ```
   - Acesse `http://localhost:3333/health` no navegador. Se retornar `{"status":"OK"}`, está tudo funcionando.

---

## Parte 2 — Deploy do Backend no Render

O Render é ideal para hospedar o backend Node.js com PostgreSQL integrado.

### Passo a Passo

1. **Criar conta no Render:**
   - Acesse [https://render.com](https://render.com) e faça login (pode usar GitHub).

2. **Subir o código no GitHub:**
   - Certifique-se de que seu repositório `bairroAlerta` está no GitHub com as últimas alterações commitadas e enviadas (`git push`).

3. **Criar um novo Web Service:**
   - No dashboard do Render, clique em **New** → **Web Service**.
   - Conecte seu repositório GitHub `bairroAlerta`.
   - Configure os campos:

     | Campo | Valor |
     |-------|-------|
     | **Name** | `bairroalerta-api` |
     | **Region** | `South America (São Paulo)` se disponível |
     | **Root Directory** | `backend` |
     | **Runtime** | `Node` |
     | **Build Command** | `npm install; npx prisma generate; npx tsc` |
     | **Start Command** | `node dist/server.js` |
     | **Plan** | `Free` (para o hackathon basta) |

4. **Configurar as Variáveis de Ambiente:**
   - Na aba **Environment** do seu Web Service, adicione:

     | Variável | Valor |
     |----------|-------|
     | `DATABASE_URL` | A string de conexão do Neon (a mesma do `.env`) |
     | `JWT_SECRET` | `bairroAlertaSenha` (ou qualquer segredo forte) |
     | `PORT` | `3333` (o Render injeta a dele automaticamente, mas ter como fallback é seguro) |

5. **Deploy:**
   - Clique em **Create Web Service**. O Render vai clonar, buildar e iniciar o servidor automaticamente.
   - Após o deploy, ele fornecerá uma URL pública, por exemplo:
     ```
     https://bairroalerta-api.onrender.com
     ```
   - Teste acessando: `https://bairroalerta-api.onrender.com/health`

6. **Rodar migrations em produção (se necessário):**
   - No Render, vá na aba **Shell** do seu Web Service e execute:
     ```bash
     npx prisma migrate deploy
     ```
   - Isso aplica as migrations pendentes no banco de produção sem criar novas.

---

## Parte 3 — Deploy do Frontend na Vercel

A Vercel é perfeita para hospedar o frontend estático (HTML/CSS/JS Vanilla).

### Passo a Passo

1. **Criar conta na Vercel:**
   - Acesse [https://vercel.com](https://vercel.com) e faça login (pode usar GitHub).

2. **Importar o repositório:**
   - Clique em **Add New** → **Project**.
   - Importe o repositório `bairroAlerta` do GitHub.

3. **Configurar o projeto:**

   | Campo | Valor |
   |-------|-------|
   | **Framework Preset** | `Other` (pois é Vanilla, sem framework) |
   | **Root Directory** | `frontend` |
   | **Build Command** | Deixe vazio (não precisa de build) |
   | **Output Directory** | `.` (o próprio diretório raiz do frontend) |

4. **Configurar a URL da API:**
   - Na aba **Settings** → **Environment Variables**, adicione:

     | Variável | Valor |
     |----------|-------|
     | `VITE_API_URL` ou variável usada no `api.js` | `https://bairroalerta-api.onrender.com/api` |

   - **Importante:** Como é Vanilla JS, essa variável não será injetada automaticamente. O time do frontend precisará garantir que o arquivo `api.js` aponte para a URL correta do backend no Render. Ex:
     ```javascript
     const API_BASE_URL = 'https://bairroalerta-api.onrender.com/api';
     ```

5. **Deploy:**
   - Clique em **Deploy**. A Vercel vai publicar o frontend e fornecer uma URL pública.

---

## Resumo das URLs Finais

| Serviço | Hospedagem | URL |
|---------|-----------|-----|
| **Backend (API)** | Render | `https://bairroalerta-api.onrender.com` |
| **Frontend** | Vercel | `https://bairroalerta.vercel.app` |
| **Banco de Dados** | Neon.tech | Conexão interna via `DATABASE_URL` |

> **Dica:** No plano gratuito do Render, o servidor "dorme" após 15 minutos de inatividade. A primeira requisição após o "sono" pode demorar ~30 segundos para o servidor acordar. Para o hackathon isso é aceitável.
