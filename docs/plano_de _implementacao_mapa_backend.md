# Plano de Implementação: Integração com Mapa no Backend

A integração com o mapa no frontend exige que o backend armazene e retorne as coordenadas exatas e o raio de alcance para desenhar os marcadores (`pins`) na tela. 

Avaliando o script `alerts.js` do frontend, notamos que o cliente espera as seguintes propriedades numéricas no objeto do alerta:
- `mapX` (coordenada X do mapa)
- `mapY` (coordenada Y do mapa)
- `radiusKm` (raio do incidente em quilômetros)

Abaixo está o plano de ação passo a passo para adaptar nosso backend atual para dar suporte a essas informações do mapa.

## 1. Atualização do Banco de Dados (Prisma Schema)

O primeiro passo é alterar a estrutura da tabela de alertas para receber as coordenadas geográficas fictícias (`mapX` e `mapY`) e padronizar o nome da propriedade de raio.

**Ações no arquivo `backend/prisma/schema.prisma`:**
- Modificar o modelo `Alert`:
  - Adicionar o campo `mapX Float`
  - Adicionar o campo `mapY Float`
  - Renomear o campo `radius Float` para `radiusKm Float` (para casar exatamente com a expectativa do script do frontend).
- *Nota: Após alterar o schema, precisaremos rodar `npx prisma migrate dev --name add_map_coordinates` (isso dependerá do banco de dados estar acessível).*

## 2. Adaptação da Camada de Repositório

Como os tipos gerados pelo Prisma Client serão atualizados, o repositório precisará refletir a mudança de `radius` para `radiusKm` e os novos campos do mapa.

**Ações no arquivo `backend/src/repositories/alertRepository.ts`:**
- Não há grandes mudanças manuais se estivermos apenas repassando o objeto inteiro via `data`, mas é essencial recompilar o Prisma Client (`npx prisma generate`) para que o TypeScript reconheça os novos campos no método `create`.

## 3. Atualização da Camada de Serviços (Regra de Negócio)

A validação de serviço deve checar se as coordenadas do mapa estão sendo passadas corretamente.

**Ações no arquivo `backend/src/services/alertService.ts`:**
- No método `create`, incluir `mapX`, `mapY` e `radiusKm` na validação de campos obrigatórios, no lugar do antigo `radius`.
- (Opcional) Adicionar uma validação numérica garantindo que `mapX` e `mapY` estão dentro dos limites lógicos do frontend (ex: entre 0 e 100).

## 4. Atualização da Camada de Controladores (Recebimento dos Dados)

O controller é a porta de entrada. Ele deve extrair as coordenadas originadas do clique do usuário no frontend.

**Ações no arquivo `backend/src/controllers/alertController.ts`:**
- Na rota de criar (`async create`), desestruturar do `req.body`: `title, type, description, location, radiusKm, mapX, mapY`.
- Passar os valores em formato numérico (usando `Number(mapX)`, etc) no payload final que vai para o `alertService.create()`.

## 5. Rotas de Consumo
As rotas de consumo em `alertRoutes.ts` já estão prontas (`GET /api/alerts`). Quando o Controller retornar a lista vinda do Repositório, o objeto automaticamente conterá o `mapX`, `mapY` e `radiusKm` direto do banco de dados para o frontend desenhar o mapa.

---
**Resumo:** O backend servirá unicamente para persistir (gravar) as posições (X e Y) definidas pelo clique do usuário na interface gráfica do frontend e entregá-las de volta durante o carregamento inicial.