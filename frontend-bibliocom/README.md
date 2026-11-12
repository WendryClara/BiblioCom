# BiblioCom â€” Front-end

Interface em **Vue 3 + TypeScript + Vite** para a API NestJS em `../backend`.

## Telas

| Rota          | O que faz                                                                  | Endpoints usados |
|---------------|----------------------------------------------------------------------------|------------------|
| `/acervo`     | Lista paginada, busca por tÃ­tulo/autor/ano, criar, editar e remover obras  | `GET /obras`, `GET /obras/busca/filtros`, `POST/PATCH/DELETE /obras` |
| `/painel`     | Totais, obras por categoria, exemplares por estado, autores sem obra       | `GET /obras/exercicios/e06-3` |
| `/desempenho` | Compara N+1 Ã— relations e LEFT JOIN Ã— NOT IN                               | `GET /obras/exercicios/e06-2/{ruim,boa}`, `e06-3` |

## Como rodar

1. Suba o PostgreSQL e a API (porta 3000):
   ```bash
   cd backend
   npm run start:dev
   ```
2. Em outro terminal:
   ```bash
   cd frontend-bibliocom
   npm install --include=dev
   npm run dev
   ```
3. Abra http://localhost:5173

> `--include=dev` Ã© necessÃ¡rio se a variÃ¡vel `NODE_ENV=production` estiver definida na sua mÃ¡quina; sem isso o npm pula o Vite e o TypeScript.

## Como a conexÃ£o funciona

O backend nÃ£o habilita CORS. Em desenvolvimento, o Vite faz proxy de `/api` para `http://localhost:3000` (ver `vite.config.ts`), entÃ£o o navegador sÃ³ enxerga a mesma origem. Para apontar para outra API:

```bash
VITE_API_URL=http://outro-host:3000 npm run dev      # proxy de desenvolvimento
VITE_API_BASE=https://api.exemplo.com/api npm run build   # build de produÃ§Ã£o (exige CORS no backend)
```

## LimitaÃ§Ãµes atuais do backend

- SÃ³ existe o mÃ³dulo `obras`. NÃ£o hÃ¡ endpoints para categorias, autores, exemplares, usuÃ¡rios ou emprÃ©stimos.
- Por isso, os selects de categoria e autor do formulÃ¡rio sÃ£o montados a partir das obras jÃ¡ cadastradas; nÃ£o dÃ¡ criar uma obra em uma categoria que ainda nÃ£o tenha nenhuma obra.
- `PATCH /obras/:id` aceita apenas `titulo`, `editora` e `anoPublicacao`.
- A rota de busca com filtros nÃ£o devolve exemplares nem paginaÃ§Ã£o.


> O TypeScript está fixado na série 5.x porque o `vue-tsc` ainda não funciona com o TypeScript 7.
