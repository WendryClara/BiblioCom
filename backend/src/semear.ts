import { AppDataSource } from './data-source.js';
import { Usuario, PerfilUsuario } from './entities/usuario.entity.js';
import { Categoria } from './entities/categoria.entity.js';
import { Autor } from './entities/autor.entity.js';
import { Obra } from './entities/obra.entity.js';
import {
  Exemplar,
  EstadoConservacao,
  StatusExemplar,
} from './entities/exemplar.entity.js';
import {
  Emprestimo,
  StatusEmprestimo,
} from './entities/emprestimo.entity.js';

async function semear() {
  await AppDataSource.initialize();
  console.log('Conectado ao banco para executar o seed...');

  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const categoriaRepo = AppDataSource.getRepository(Categoria);
  const autorRepo = AppDataSource.getRepository(Autor);
  const obraRepo = AppDataSource.getRepository(Obra);
  const exemplarRepo = AppDataSource.getRepository(Exemplar);
  const emprestimoRepo = AppDataSource.getRepository(Emprestimo);

  const countObras = await obraRepo.count();
  if (countObras > 0) {
    console.log('O banco já possui dados populados. Seed ignorado.');
    await AppDataSource.destroy();
    return;
  }

  // 1. Usuários
  const [leitor1, bibliotecario] = await usuarioRepo.save([
    usuarioRepo.create({
      nome: 'Wendry Clara',
      email: 'wendry@bibliocom.edu.br',
      matricula: '2026001',
      perfil: PerfilUsuario.LEITOR,
      ativo: true,
    }),
    usuarioRepo.create({
      nome: 'Carlos Silva',
      email: 'carlos.biblio@bibliocom.edu.br',
      matricula: '2026002',
      perfil: PerfilUsuario.BIBLIOTECARIO,
      ativo: true,
    }),
  ]);

  // 2. Categorias
  const [catLiteratura, catComputacao] = await categoriaRepo.save([
    categoriaRepo.create({
      nome: 'Literatura Brasileira',
      descricao: 'Romances, contos e clássicos da literatura nacional.',
    }),
    categoriaRepo.create({
      nome: 'Engenharia de Software',
      descricao: 'Arquitetura, bancos de dados e desenvolvimento de sistemas.',
    }),
  ]);

  // 3. Autores (incluindo coautoria para exercitar relação N-N)
  const [machado, martin, fowler] = await autorRepo.save([
    autorRepo.create({
      nome: 'Machado de Assis',
      nacionalidade: 'Brasileira',
    }),
    autorRepo.create({
      nome: 'Robert C. Martin',
      nacionalidade: 'Estadunidense',
    }),
    autorRepo.create({
      nome: 'Martin Fowler',
      nacionalidade: 'Britânica',
    }),
  ]);

  // 4. Obras (exercitando 1-N com Categoria e N-N com Autor)
  const [obraDomCasmurro, obraArquitetura] = await obraRepo.save([
    obraRepo.create({
      titulo: 'Dom Casmurro',
      isbn: '978-8535914849',
      anoPublicacao: 1899,
      editora: 'Companhia das Letras',
      categoria: catLiteratura,
      autores: [machado],
    }),
    obraRepo.create({
      titulo: 'Arquitetura Limpa e Refatoração',
      isbn: '978-8550804606',
      anoPublicacao: 2019,
      editora: 'Alta Books',
      categoria: catComputacao,
      autores: [martin, fowler],
    }),
  ]);

  // 5. Exemplares físicos (1-N com Obra)
  const [exemplar1, exemplar2, exemplar3] = await exemplarRepo.save([
    exemplarRepo.create({
      codigoTombo: 'TOMBO-001',
      estadoConservacao: EstadoConservacao.BOM,
      status: StatusExemplar.EMPRESTADO,
      obra: obraDomCasmurro,
    }),
    exemplarRepo.create({
      codigoTombo: 'TOMBO-002',
      estadoConservacao: EstadoConservacao.NOVO,
      status: StatusExemplar.DISPONIVEL,
      obra: obraDomCasmurro,
    }),
    exemplarRepo.create({
      codigoTombo: 'TOMBO-003',
      estadoConservacao: EstadoConservacao.NOVO,
      status: StatusExemplar.DISPONIVEL,
      obra: obraArquitetura,
    }),
  ]);

  // 6. Empréstimo (entidade associativa ligada a Usuario e Exemplar)
  const hoje = new Date();
  const devolucaoPrevista = new Date();
  devolucaoPrevista.setDate(hoje.getDate() + 14);

  await emprestimoRepo.save(
    emprestimoRepo.create({
      dataRetirada: hoje,
      dataPrevistaDevolucao: devolucaoPrevista,
      dataDevolucao: null,
      valorMulta: '0.00',
      status: StatusEmprestimo.ATIVO,
      usuario: leitor1,
      exemplar: exemplar1,
    }),
  );

  console.log(
    `Seed concluído: ${bibliotecario.nome} e ${leitor1.nome} cadastrados, 2 obras (com N-N), 3 exemplares e 1 empréstimo ativo.`,
  );
  await AppDataSource.destroy();
}

semear().catch((err) => {
  console.error('Erro ao executar seed:', err);
  process.exit(1);
});