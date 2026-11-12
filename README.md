# BiblioCom — Sistema de Gestão de Biblioteca

API desenvolvida em **NestJS**, **TypeORM** e **PostgreSQL** para catalogação de obras, controle de exemplares físicos e gestão de empréstimos.

## Como executar o projeto do zero

### 1. Subir o banco de dados PostgreSQL
Certifique-se de que o serviço do **PostgreSQL** esteja ativo localmente (`localhost:5432`) e crie um banco de dados vazio chamado `bibliocom`:

```sql
CREATE DATABASE bibliocom;
```

*(Configure a senha e o usuário do banco nos arquivos `backend/src/data-source.ts` e `backend/src/app.module.ts` conforme o ambiente local).*

### 2. Instalar dependências e aplicar as migrações versionadas
Entre na pasta `backend`, instale os pacotes e execute as migrações para criar toda a estrutura de tabelas, chaves estrangeiras e restrições:

```bash
cd backend
pnpm install
npm run migration:run
```

*(Para desfazer a última migração aplicada, utilize `npm run migration:revert`).*

### 3. Popular o banco com dados de exemplo (Seed)
Execute o script de seed para cadastrar usuários, categorias, autores (incluindo coautoria N-N), obras, exemplares e empréstimos:

```bash
npm run seed
```

### 4. Subir a API em modo de desenvolvimento
Inicie o servidor NestJS:

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000/api/obras`.