 feat/migracoes-e-consultas
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
📦 Entregas S.A
Bem-vindo ao Entregas S.A, está é uma aplicação web desenvolvida para simplificar o gerenciamento e acompanhamento de todo fluxo de entregas, desde o cadastro inicial ate a monitorização do status final, Ideal para quem busca uma solução prática e eficiente pata controle logístico.

✨ Funcionalidades Principais
•Cadastro de Cliente: Gerencia informações dos seus clientes.
•Cadastro de Encomendas: Registra todas as encomendas, com suas respectivas informações.
•Definição de Rotas: Organiza as rotas de entrega, especificando origem, destino e distância.
•Gestão de Entregas: Associa clientes, encomendas e rotas para criar novas entregas.
•Rastreamento: Acompanha o status de cada entrega, desde o preparo até a entrega.

🚀 Tecnologias Utilizadas
Frontend
•HTML5: Estrutura semântica das páginas web.
•CSS3: Estilização e design responsivo para uma interface agradável.
•JavaScript: Lógica interativa do lado do cliente e comunicação com o backend.

Backend
•Node.js: Ambiente de execução Javascript no servidor, responsável pela lógica de negócio e API.
•Express.js: Framework web para Node.js, utilizado para construir a API RESTful.
•API REST: Interface de comunicação entre o frontend e o backend, permitindo a troca de dados de forma padronizada.

⚙️ Como Rodar o Projeto
Siga o passo a passo abaixo para configurar e executar o sistema em sua máquina local:

1- Abra o terminal: Utilize no terminal o comando cd /home/usuario/meu-projeto para navegar até a pasta raiz do seu projeto e para verificar as pastas existentes nele utilize ls.
2- Instale as dependências: No terminal execute o comando npm install para instalar todas as bibliotecas e pacotes necessários para o backend.
3- Inicie o servidor: Após as instalações das dependências, inicie o servidor node.js com o comando npm start.
4- Acesse a aplicação: O terminal mostrará uma mensagem indicando que o servidor está rodando e em qual porta (ex: "Sistema rodando na porta:5500"). Clique em cima dessa mensagem ou copie o link (geralmente é: "http://localhost:5500") e cole-o no seu navegador e pronto, pode começar a usar o sistema.
 main
