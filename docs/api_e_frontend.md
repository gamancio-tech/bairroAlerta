# Documentação da API Bairro Alerta & Integração com Frontend

Este documento descreve as funções da API REST desenvolvida no backend, detalhando seus endpoints, o fluxo de comunicação esperado e as orientações para a futura implementação no Frontend.

---

## 1. Funções da API e Endpoints

A API opera baseada no padrão REST. Todas as requisições baseiam-se em JSON (tanto para envio de dados em requisições POST quanto nas respostas).

A URL base da aplicação no ambiente local é: `http://localhost:3333/api`

### 1.1 Autenticação (`/api/auth`)

#### 🔹 Cadastro de Usuário
- **Endpoint:** `POST /api/auth/register`
- **O que faz:** Recebe os dados de um novo usuário, valida se o e-mail não está em uso, faz o hash da senha (usando Bcrypt) e persiste os dados de forma segura no banco de dados.
- **Corpo da Requisição (Body JSON):**
  ```json
  {
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha_segura"
  }
  ```
- **Retorno Esperado:** 
  - `201 Created`: Usuário criado com sucesso (retorna o objeto de usuário sem a senha).
  - `400 Bad Request`: Faltam campos obrigatórios ou e-mail já cadastrado.

#### 🔹 Login de Usuário
- **Endpoint:** `POST /api/auth/login`
- **O que faz:** Valida as credenciais do usuário. Se corretas, gera um **Token JWT** que deve ser usado para acessar as rotas protegidas da API.
- **Corpo da Requisição (Body JSON):**
  ```json
  {
    "email": "joao@email.com",
    "password": "senha_segura"
  }
  ```
- **Retorno Esperado:** 
  - `200 OK`: Retorna o `token` de acesso e os dados básicos do usuário.
  - `401 Unauthorized`: Credenciais (e-mail ou senha) inválidas.

---

### 1.2 Alertas (`/api/alerts`)

#### 🔹 Listagem do Mural de Alertas
- **Endpoint:** `GET /api/alerts`
- **O que faz:** Retorna a lista de todos os alertas cadastrados no sistema, ordenados dos mais recentes para os mais antigos. Inclui também o nome e e-mail de quem reportou a ocorrência.
- **Autenticação:** Não requer. Acesso público.
- **Retorno Esperado:**
  - `200 OK`: Um Array JSON contendo a lista de incidentes com suas informações (localização, descrição, tipo de desastre, raio estimado).

#### 🔹 Criação de Novo Alerta
- **Endpoint:** `POST /api/alerts`
- **O que faz:** Permite que um usuário autenticado reporte um novo incidente (enchente, temporal, deslizamento, etc) referenciado ao seu ID.
- **Autenticação:** Requer cabeçalho HTTP: `Authorization: Bearer <TOKEN>`
- **Corpo da Requisição (Body JSON):**
  ```json
  {
    "title": "Alagamento na Rua Principal",
    "type": "ENCHENTE",
    "description": "A água está subindo rapidamente próximo ao mercado.",
    "location": "Centro, Rua Principal",
    "radius": 1.5
  }
  ```
- **Retorno Esperado:**
  - `201 Created`: Ocorrência inserida no banco e pronta para ser renderizada no mural.
  - `401 Unauthorized`: Usuário não passou o token ou token inválido.
  - `400 Bad Request`: Faltando preencher algum campo obrigatório do alerta.

---

## 2. Orientações para Implementação no Frontend

O lado do Cliente (Frontend) tem a missão de interagir de forma reativa com esses endpoints, focando principalmente no gerenciamento de estado da sessão (o Token) e renderização dos Alertas.

Como o projeto foca em **HTML/CSS/JS Vanilla** (puro), o ideal é seguir este roteiro:

### A. Gerenciamento de Autenticação
1. **Página de Cadastro:** Ter um formulário HTML e no script usar o `fetch()` apontando para `/api/auth/register`. Ao obter o HTTP 201, alertar sucesso e direcionar para a tela de Login.
2. **Página de Login:** Fazer um `fetch()` para `/api/auth/login`. Quando receber a resposta de sucesso (`200 OK`), pegar o campo `token` da resposta e **salvar no LocalStorage** (`localStorage.setItem('token', tokenRecebido)`).

### B. Proteção de Rotas e Envio de Dados Autenticados
- Ao carregar páginas protegidas (como a de "Criar Alerta"), o JS deve verificar se `localStorage.getItem('token')` existe. Se não existir, redireciona o usuário para a página de Login via `window.location.href`.
- Quando for enviar o formulário de um Novo Alerta, é necessário colocar o cabeçalho de Autorização no `fetch()`:
  ```javascript
  const token = localStorage.getItem('token');
  fetch('http://localhost:3333/api/alerts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Injetando o token aqui
    },
    body: JSON.stringify(dadosDoFormulario)
  })
  .then(res => res.json())
  .then(data => console.log(data));
  ```

### C. Consumo e Renderização Dinâmica (Mural)
- Na página principal de Alertas, executar um `fetch()` em `GET /api/alerts` assim que a página carregar (escutando o evento DOMContentLoaded).
- O retorno será um Array. Use um loop nativo do JavaScript (ex: `.forEach()` ou `.map()`) para iterar por esses incidentes.
- Crie elementos HTML dinâmicos para cada alerta (como um `<div class="card">`) anexando-os à tela.
- **Dica de UI:** Pode-se adicionar uma lógica que adicione uma classe CSS ou altere a cor de fundo do card baseado no campo `type` retornado pela API (ex: `ENCHENTE` = Azul, `CALOR_EXTREMO` = Laranja/Vermelho).
