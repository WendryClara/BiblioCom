# Modelo de Dados — BiblioCom

Este documento descreve a evolução da modelagem de domínio do sistema **BiblioCom**, contemplando as entidades, os relacionamentos, as políticas de integridade referencial (`onDelete`) e as restrições aplicadas no banco de dados.

---

## 1. Diagrama Entidade-Relacionamento (ER)

```mermaid
erDiagram
    USUARIO ||--o{ EMPRESTIMO : "realiza"
    EXEMPLAR ||--o{ EMPRESTIMO : "é objeto de"
    OBRA ||--o{ EXEMPLAR : "possui cópias físicas"
    CATEGORIA ||--o{ OBRA : "classifica"
    OBRA }o--o{ AUTOR : "escrita por (obras_autores)"

    USUARIO {
        uuid id PK
        varchar nome
        varchar email UK
        varchar matricula UK
        enum perfil "LEITOR | BIBLIOTECARIO | ADMIN"
        boolean ativo
        timestamptz criado_em
    }

    CATEGORIA {
        uuid id PK
        varchar nome UK
        text descricao "nullable"
    }

    AUTOR {
        uuid id PK
        varchar nome
        varchar nacionalidade "nullable"
    }

    OBRA {
        uuid id PK
        varchar titulo
        varchar isbn UK
        int ano_publicacao
        varchar editora "nullable"
        uuid categoria_id FK
    }

    EXEMPLAR {
        uuid id PK
        varchar codigo_tombo UK
        enum estado_conservacao "NOVO | BOM | DESGASTADO | DANIFICADO"
        enum status "DISPONIVEL | EMPRESTADO | MANUTENCAO | BAIXADO"
        uuid obra_id FK
    }

    EMPRESTIMO {
        uuid id PK
        timestamptz data_retirada
        timestamptz data_prevista_devolucao
        timestamptz data_devolucao "nullable"
        decimal valor_multa
        enum status "ATIVO | DEVOLVIDO | ATRASADO"
        uuid usuario_id FK
        uuid exemplar_id FK
    }
```

---

## 2. Evolução do Modelo (Antes × Depois)

| Aspecto | Antes (Modelo Inicial) | Depois (Modelo de Domínio Atualizado) | Por que mudou? |
| :--- | :--- | :--- | :--- |
| **Persistência e Estrutura** | Lista fixa em memória no `ObrasService` com apenas 3 objetos (`id`, `titulo`, `autor`). | 6 entidades persistentes mapeadas com TypeORM (`Usuario`, `Obra`, `Autor`, `Categoria`, `Exemplar`, `Emprestimo`). | Sustentar todas as histórias *Must* (catalogação, controle de acervo físico e circulação de empréstimos). |
| **Identificadores** | IDs numéricos sequenciais simples (`1`, `2`, `3`). | Chaves primárias do tipo `uuid` geradas automaticamente. | Evitar enumeração previsível de registros em URLs públicas da API (`/api/obras/:id`). |
| **Autores** | Campo de texto simples dentro da obra (`autor: string`). | Entidade `Autor` separada ligada a `Obra` por relação **N-N** (`@ManyToMany` + `@JoinTable` `obras_autores`). | Uma obra pode ter múltiplos autores e um autor escreve várias obras; evita repetição e erros de digitação. |
| **Categorização** | Inexistente no objeto inicial. | Entidade `Categoria` ligada a `Obra` por relação **1-N** (`@ManyToOne` / `@OneToMany`). | Padronizar gêneros/assuntos do acervo e permitir filtros consistentes sem texto livre duplicado. |
| **Obra × Cópia Física** | Misturava o título bibliográfico com a disponibilidade do livro. | Separação entre `Obra` (dados catalográficos) e `Exemplar` (unidade física com `codigo_tombo` e `status`). | Uma mesma obra possui vários exemplares físicos na estante, cada um com estado de conservação e disponibilidade próprios. |
| **Empréstimos** | Inexistente. | Entidade associativa `Emprestimo` entre `Usuario` e `Exemplar` (duas relações **1-N**). | A relação entre usuário e exemplar possui atributos próprios do evento (`data_retirada`, `data_prevista_devolucao`, `data_devolucao`, `valor_multa`, `status`). |

---

## 3. Chaves Estrangeiras e Regras de Exclusão (`onDelete`)

| Tabela Origem (FK) | Tabela Destino (PK) | Relação | `onDelete` | Justificativa de Negócio |
| :--- | :--- | :--- | :--- | :--- |
| `obras.categoria_id` | `categorias.id` | `N:1` | `RESTRICT` | Impede excluir uma categoria enquanto houver obras catalogadas nela, evitando livros órfãos sem classificação no acervo. |
| `exemplares.obra_id` | `obras.id` | `N:1` | `RESTRICT` | Impede apagar o registro bibliográfico de uma obra se ainda existirem exemplares físicos vinculados no patrimônio da biblioteca. |
| `emprestimos.usuario_id` | `usuarios.id` | `N:1` | `RESTRICT` | Preserva o histórico de circulação, auditoria e eventuais pendências financeiras (`valor_multa`); usuários desligados devem ser inativados (`ativo = false`), nunca excluídos com histórico. |
| `emprestimos.exemplar_id` | `exemplares.id` | `N:1` | `RESTRICT` | Mantém a rastreabilidade completa de quem retirou cada exemplar físico ao longo do tempo, impedindo perda de histórico patrimonial. |
| `obras_autores.obra_id` / `autor_id` | `obras.id` / `autores.id` | `N:N` | `CASCADE` (padrão `@JoinTable`) | Remove apenas o vínculo associativo na tabela de junção caso a associação seja desfeita, sem apagar os registros principais de `Obra` ou `Autor`. |

---

## 4. Restrições e Índices no Banco de Dados

* **`obras.isbn` (`UNIQUE`):** Garante que o código ISBN internacional não seja duplicado no catálogo bibliográfico, evitando cadastros redundantes da mesma edição.
* **`@Index(['titulo', 'editora', 'anoPublicacao'], { unique: true })` em `Obra`:** Protege contra o cadastro duplicado de uma mesma edição (mesmo título, editora e ano) caso o ISBN seja informado com formatação divergente.
* **`exemplares.codigo_tombo` (`UNIQUE`):** Assegura que cada etiqueta patrimonial física da biblioteca identifique exclusivamente um único exemplar na estante.
* **`usuarios.email` e `usuarios.matricula` (`UNIQUE`):** Garante unicidade no login e impede que um mesmo estudante ou servidor crie múltiplas contas para burlar limites de empréstimos simultâneos.
* **`categorias.nome` (`UNIQUE`):** Evita categorias duplicadas com o mesmo nome (ex.: duas categorias "Romance"), mantendo a integridade dos filtros de busca.
* **`@Index(['usuario', 'exemplar', 'status'])` em `Emprestimo`:** Otimiza consultas frequentes de validação de regras de negócio (verificar se um usuário já possui empréstimos ativos ou atrasados) e rastreabilidade de circulação.
*