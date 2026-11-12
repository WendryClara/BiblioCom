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
  console.log('Iniciando seed com volume para benchmarks...');

  await AppDataSource.query(
    'TRUNCATE TABLE "emprestimos", "exemplares", "obras_autores", "obras", "autores", "categorias", "usuarios" RESTART IDENTITY CASCADE',
  );

  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const categoriaRepo = AppDataSource.getRepository(Categoria);
  const autorRepo = AppDataSource.getRepository(Autor);
  const obraRepo = AppDataSource.getRepository(Obra);
  const exemplarRepo = AppDataSource.getRepository(Exemplar);
  const emprestimoRepo = AppDataSource.getRepository(Emprestimo);

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

  const categorias = await categoriaRepo.save([
    categoriaRepo.create({ nome: 'Literatura Brasileira', descricao: 'Clássicos e romances nacionais' }),
    categoriaRepo.create({ nome: 'Engenharia de Software', descricao: 'Arquitetura, bancos de dados e código' }),
    categoriaRepo.create({ nome: 'História e Sociologia', descricao: 'Formação histórica e social' }),
    categoriaRepo.create({ nome: 'Ciências Exatas', descricao: 'Matemática, física e lógica' }),
  ]);

  const autoresPrincipais = await autorRepo.save([
    autorRepo.create({ nome: 'Machado de Assis', nacionalidade: 'Brasileira' }),
    autorRepo.create({ nome: 'Machado de Castro', nacionalidade: 'Portuguesa' }),
    autorRepo.create({ nome: 'Euclides da Cunha', nacionalidade: 'Brasileira' }),
    autorRepo.create({ nome: 'Guimarães Rosa', nacionalidade: 'Brasileira' }),
    autorRepo.create({ nome: 'Graciliano Ramos', nacionalidade: 'Brasileira' }),
    autorRepo.create({ nome: 'Robert C. Martin', nacionalidade: 'Estadunidense' }),
    autorRepo.create({ nome: 'Martin Fowler', nacionalidade: 'Britânica' }),
    autorRepo.create({ nome: 'Autor Sem Obra 1', nacionalidade: 'Brasileira' }),
    autorRepo.create({ nome: 'Autor Sem Obra 2', nacionalidade: 'Portuguesa' }),
  ]);

  const autoresExtras = Array.from({ length: 16 }, (_, i) =>
    autorRepo.create({
      nome: `Autor Contemporâneo ${i + 1}`,
      nacionalidade: i % 2 === 0 ? 'Brasileira' : 'Estrangeira',
    }),
  );
  const todosAutores = [...autoresPrincipais, ...(await autorRepo.save(autoresExtras))];

  const obrasEspeciais = [
    obraRepo.create({
      titulo: 'Dom Casmurro',
      isbn: '978-8535914849',
      anoPublicacao: 1899,
      editora: 'Garnier',
      categoria: categorias[0],
      autores: [autoresPrincipais[0]],
    }),
    obraRepo.create({
      titulo: 'Memórias Póstumas de Brás Cubas',
      isbn: '978-8535911121',
      anoPublicacao: 1881,
      editora: 'Tipografia Nacional',
      categoria: categorias[0],
      autores: [autoresPrincipais[0]],
    }),
    obraRepo.create({
      titulo: 'Os Sertões',
      isbn: '978-8535920239',
      anoPublicacao: 1902,
      editora: 'Laemmert',
      categoria: categorias[2],
      autores: [autoresPrincipais[2]],
    }),
    obraRepo.create({
      titulo: 'Grande Sertão: Veredas',
      isbn: null,
      anoPublicacao: 1956,
      editora: 'José Olympio',
      categoria: categorias[0],
      autores: [autoresPrincipais[3]],
    }),
    obraRepo.create({
      titulo: 'Vidas Secas no Sertão',
      isbn: null,
      anoPublicacao: 1938,
      editora: 'José Olympio',
      categoria: categorias[0],
      autores: [autoresPrincipais[4]],
    }),
  ];

  const obrasGeradas = Array.from({ length: 55 }, (_, i) => {
    const num = i + 1;
    const autorA = todosAutores[num % 7];
    const autorB = todosAutores[(num + 1) % 7];
    return obraRepo.create({
      titulo: `Obra Técnica e Literária Vol. ${num}`,
      isbn: num % 7 === 0 ? null : `978-85000${String(num).padStart(5, '0')}`,
      anoPublicacao: 1890 + (num * 2),
      editora: `Editora Acadêmica ${(num % 4) + 1}`,
      categoria: categorias[num % categorias.length],
      autores: num % 3 === 0 ? [autorA, autorB] : [autorA],
    });
  });

  const todasObras = await obraRepo.save([...obrasEspeciais, ...obrasGeradas]);

  const estados = [
    EstadoConservacao.NOVO,
    EstadoConservacao.BOM,
    EstadoConservacao.DESGASTADO,
    EstadoConservacao.DESCARTADO,
  ];

  const exemplares = todasObras.map((obra, idx) =>
    exemplarRepo.create({
      codigoTombo: `TOMBO-${String(idx + 1).padStart(4, '0')}`,
      estadoConservacao: estados[idx % estados.length],
      status: idx === 0 ? StatusExemplar.EMPRESTADO : StatusExemplar.DISPONIVEL,
      obra,
    }),
  );

  const exemplaresSalvos = await exemplarRepo.save(exemplares);

  const hoje = new Date();
  const devolucao = new Date();
  devolucao.setDate(hoje.getDate() + 14);

  await emprestimoRepo.save(
    emprestimoRepo.create({
      dataRetirada: hoje,
      dataPrevistaDevolucao: devolucao,
      dataDevolucao: null,
      valorMulta: '0.00',
      status: StatusEmprestimo.ATIVO,
      usuario: leitor1,
      exemplar: exemplaresSalvos[0],
    }),
  );

  console.log(
    `Seed concluído: ${bibliotecario.nome}, ${todosAutores.length} autores, ${todasObras.length} obras e ${exemplaresSalvos.length} exemplares.`,
  );
  await AppDataSource.destroy();
}

semear().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});