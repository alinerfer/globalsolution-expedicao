# Expedição

Projeto da atividade substitutiva da **Global Solution**.

É uma plataforma de **controle de expedição de pedidos para restaurantes**, com
duas partes que conversam entre si:

- Um **painel web** para o operador do restaurante criar pedidos, atribuir
  entregadores e acompanhar tudo num kanban.
- Uma **API REST** consumida pelo **app mobile do entregador**
  (login, ver os pedidos atribuídos, confirmar retirada/entrega e mandar a
  posição do GPS de tempos em tempos).

> O app mobile é um projeto Expo separado, em
> <https://github.com/alinerfer/globalsolution-expedicao-app>.

## O que dá pra fazer

No painel web (`/`):

- Login do operador.
- Cadastrar entregadores (criar, editar, desativar).
- Criar pedidos com vários itens, cliente, endereço e coordenadas opcionais.
- Kanban com as colunas: **Pendente -> Em preparo -> Pronto -> Aguardando
  retirada -> Saiu para entrega -> Entregue**.
- Mover os cards arrastando (drag-and-drop). Para mandar pra "Aguardando
  retirada" abre um modal pra escolher qual entregador.
- Ver detalhe do pedido com itens, total e o mapa do destino.
- Acompanhar a posição do entregador no mapa em tempo real (atualiza
  sozinho a cada 5s).
- Mapa geral abaixo do kanban com a última posição de **todos** os
  entregadores ativos.

Na API (`/api/*`):

- `POST /api/auth/login` — login do entregador, devolve um JWT.
- `GET /api/orders/mine` — pedidos atribuídos ao entregador.
- `GET /api/orders/:id` — detalhe do pedido (só se for do entregador logado).
- `POST /api/orders/:id/pickup` — confirma retirada no restaurante.
- `POST /api/orders/:id/deliver` — marca como entregue.
- `POST /api/locations` — envia a posição atual (lat/lng) do entregador.

## Tecnologias usadas

- [NestJS](https://nestjs.com) (Node.js + TypeScript)
- [TypeORM](https://typeorm.io) + SQLite (`better-sqlite3`)
- [LiquidJS](https://liquidjs.com) — template engine pro painel SSR (MVC)
- [Tailwind CSS](https://tailwindcss.com) via Play CDN
- [Leaflet](https://leafletjs.com) + tiles do OpenStreetMap (mapas)
- [SortableJS](https://sortablejs.github.io/Sortable/) (drag-and-drop do kanban)
- JWT (`@nestjs/jwt`) na API e `express-session` no painel
- `bcrypt` pra senha

## Como rodar

Precisa ter o **Node 20+** instalado.

```bash
git clone git@github-aline:alinerfer/globalsolution-expedicao.git
cd globalsolution-expedicao
npm install
npm run start:dev
```

Acesse <http://localhost:3000>.

O banco de dados é um arquivo SQLite criado automaticamente em
`data/expedicao.sqlite` na primeira execução.

## Primeiro login

Quando a aplicação sobe pela primeira vez, ela cria um operador admin
automaticamente:

- **E-mail:** `admin@expedicao.com`
- **Senha:** `admin123`

Use essas credenciais pra logar em <http://localhost:3000/login>.

Depois, vá em **Entregadores -> + Novo entregador** pra criar um usuário
de entregador e usar no app/na API.

## Como testar o fluxo inteiro

1. Logue como admin.
2. Crie um entregador (ex.: `pedro@expedicao.com` / `senha123`).
3. Crie um pedido com 1 ou 2 itens.
4. No kanban, arraste o card pra **Em preparo**, depois pra **Pronto**.
5. Arraste pra **Aguardando retirada** — abre um modal: escolha o entregador.
6. Faça login na API como o entregador:

   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"pedro@expedicao.com","senha":"senha123"}'
   ```

7. Pegue o `token` da resposta e use nos demais endpoints da API
   (`/api/orders/mine`, `/api/orders/:id/pickup`, etc.).

## Estrutura do projeto

```
src/
  auth/        login web (sessão) + login JWT da API
    web/       SessionGuard, WebAuthController
    api/       JwtAuthGuard, ApiAuthController
  users/       entidade de usuários (operador + entregador) e seed do admin
  drivers/     CRUD de entregadores (web SSR) + endpoint de localizações
  orders/      pedidos
    web/       OrdersController (kanban, criar, detalhe, transições)
    api/       ApiOrdersController (mine, detalhe, pickup, deliver)
  locations/   posição dos entregadores (entidade + service + POST /api/locations)
  types/       extensões de tipo (sessão)
views/         templates LiquidJS
  layouts/     layout base
  drivers/     telas de entregadores
  orders/      telas de pedidos (kanban, form, detail)
data/          arquivo SQLite (gerado em runtime, ignorado pelo git)
```

## Scripts úteis

```bash
npm run start:dev    # roda em modo dev com watch
npm run start        # roda uma vez
npm run build        # compila para dist/
npm test             # roda os testes do jest
npm run lint         # roda o eslint
```

## Variáveis de ambiente

Tudo tem valor padrão, então pra dev local você não precisa configurar nada.
Pra produção, vale a pena setar:

| Variável         | O que faz                                 | Padrão                |
| ---------------- | ----------------------------------------- | --------------------- |
| `PORT`           | Porta que o servidor escuta               | `3000`                |
| `DATABASE_PATH`  | Caminho do arquivo SQLite                 | `data/expedicao.sqlite` |
| `SESSION_SECRET` | Segredo da sessão do painel               | `segredo`             |
| `JWT_SECRET`     | Segredo dos tokens JWT da API             | `segredo`             |

## Status do pedido

O ciclo de vida do pedido é:

```
PENDENTE
  -> EM_PREPARO
  -> PRONTO
  -> ATRIBUIDO          (operador atribui um entregador)
  -> SAIU_PARA_ENTREGA  (entregador faz pickup no app)
  -> ENTREGUE           (entregador marca como entregue no app)
```

Cancelar é possível enquanto o pedido ainda não saiu para entrega
(Pendente, Em preparo ou Pronto) -> `CANCELADO`.

## Sobre o app do entregador

O app mobile foi feito com **Expo** e fica num repositório separado:

<https://github.com/alinerfer/globalsolution-expedicao-app>

Ele consome a API REST deste projeto (`/api/*`). Os endpoints disponíveis
estão listados na seção "O que dá pra fazer" acima.

## Autora

Aline Rocha Fernandes – RM560937
