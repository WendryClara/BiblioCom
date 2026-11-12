import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, ILike, IsNull, Like } from 'typeorm';
import { Obra } from '../entities/obra.entity.js';
import { Categoria } from '../entities/categoria.entity.js';
import { Autor } from '../entities/autor.entity.js';
import {
  Exemplar,
  EstadoConservacao,
} from '../entities/exemplar.entity.js';

@Injectable()
export class ObrasService {
  constructor(
    @InjectRepository(Obra)
    private readonly obraRepository: Repository<Obra>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Autor)
    private readonly autorRepository: Repository<Autor>,
    @InjectRepository(Exemplar)
    private readonly exemplarRepository: Repository<Exemplar>,
  ) {}

  // Etapas 1 a 4: Listagem paginada com teto de tamanho (máx 50)
  async listar(page = 1, limit = 10) {
    const limiteSeguro = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * limiteSeguro;

    const [dados, total] = await this.obraRepository.findAndCount({
      relations: {
        categoria: true,
        autores: true,
        exemplares: true,
      },
      order: { titulo: 'ASC' },
      skip,
      take: limiteSeguro,
    });

    return {
      dados,
      meta: {
        total,
        pagina: page,
        limite: limiteSeguro,
        totalPaginas: Math.ceil(total / limiteSeguro),
      },
    };
  }

  async buscarPorId(id: string) {
    const obra = await this.obraRepository.findOne({
      where: { id },
      relations: { categoria: true, autores: true, exemplares: true },
    });
    if (!obra) throw new NotFoundException('Obra não encontrada');
    return obra;
  }

  // Etapa 9: CRUD completo (create, save, update, delete)
  async criar(dados: {
    titulo: string;
    isbn?: string | null;
    anoPublicacao: number;
    editora?: string;
    categoriaId: string;
    autoresIds?: string[];
  }) {
    const categoria = await this.categoriaRepository.findOneBy({
      id: dados.categoriaId,
    });
    if (!categoria) throw new NotFoundException('Categoria não encontrada');

    const autores = dados.autoresIds?.length
      ? await this.autorRepository.findBy({ id: In(dados.autoresIds) })
      : [];

    const novaObra = this.obraRepository.create({
      titulo: dados.titulo,
      isbn: dados.isbn ?? null,
      anoPublicacao: dados.anoPublicacao,
      editora: dados.editora ?? null,
      categoria,
      autores,
    });

    return this.obraRepository.save(novaObra);
  }

  async atualizar(
    id: string,
    dados: { titulo?: string; editora?: string; anoPublicacao?: number },
  ) {
    const obra = await this.buscarPorId(id);
    Object.assign(obra, dados);
    return this.obraRepository.save(obra);
  }

  async remover(id: string) {
    const obra = await this.buscarPorId(id);
    await this.obraRepository.remove(obra);
    return { mensagem: 'Obra removida com sucesso' };
  }

  // Etapas 11 a 13: Busca com filtros opcionais via QueryBuilder (parametrizados)
  async buscarComFiltros(filtros: {
    titulo?: string;
    anoMax?: number;
    autorNome?: string;
  }) {
    const qb = this.obraRepository
      .createQueryBuilder('obra')
      .leftJoinAndSelect('obra.categoria', 'categoria')
      .leftJoinAndSelect('obra.autores', 'autor');

    if (filtros.titulo) {
      qb.andWhere('obra.titulo ILIKE :titulo', {
        titulo: `%${filtros.titulo}%`,
      });
    }

    if (filtros.anoMax) {
      qb.andWhere('obra.anoPublicacao <= :anoMax', {
        anoMax: filtros.anoMax,
      });
    }

    if (filtros.autorNome) {
      qb.andWhere('autor.nome ILIKE :autorNome', {
        autorNome: `%${filtros.autorNome}%`,
      });
    }

    return qb.orderBy('obra.anoPublicacao', 'DESC').getMany();
  }

  // E06.1: As 8 consultas com o Repository
  async executarConsultasE061() {
    // 1. Obras publicadas antes de 1900
    const antesDe1900 = await this.obraRepository.find({
      where: { anoPublicacao: LessThan(1900) },
    });

    // 2. Título contendo "sertão" (case-insensitive)
    const tituloSertao = await this.obraRepository.find({
      where: { titulo: ILike('%sertão%') },
    });

    // 3. Obras de um autor específico com o autor carregado
    const obrasMachado = await this.obraRepository.find({
      where: { autores: { nome: ILike('%Machado de Assis%') } },
      relations: { autores: true },
    });

    // 4. Exemplares DESGASTADO ou DESCARTADO
    const exemplaresCriticos = await this.exemplarRepository.find({
      where: {
        estadoConservacao: In([
          EstadoConservacao.DESGASTADO,
          EstadoConservacao.DESCARTADO,
        ]),
      },
    });

    // 5. Obras sem ISBN
    const obrasSemIsbn = await this.obraRepository.find({
      where: { isbn: IsNull() },
    });

    // 6. As 10 obras mais recentes
    const dezMaisRecentes = await this.obraRepository.find({
      order: { anoPublicacao: 'DESC' },
      take: 10,
    });

    // 7. Autores começando com "Machado"
    const autoresMachado = await this.autorRepository.find({
      where: { nome: Like('Machado%') },
    });

    // 8. Total de obras com count()
    const totalObras = await this.obraRepository.count();

    return {
      resumo: {
        antesDe1900: antesDe1900.length,
        tituloSertao: tituloSertao.length,
        obrasMachado: obrasMachado.length,
        exemplaresCriticos: exemplaresCriticos.length,
        obrasSemIsbn: obrasSemIsbn.length,
        dezMaisRecentes: dezMaisRecentes.length,
        autoresMachado: autoresMachado.length,
        totalObras,
      },
      amostras: {
        antesDe1900,
        tituloSertao,
        autoresMachado,
      },
    };
  }

  // E06.2: Versão RUIM (N+1 proposital buscando autores dentro de um laço)
  async listar50ComNPlusOne() {
    const inicio = performance.now();

    const obras = await this.obraRepository.find({ take: 50 });
    const resultado = [];
    for (const obra of obras) {
      const autores = await this.autorRepository
        .createQueryBuilder('autor')
        .innerJoin('autor.obras', 'o', 'o.id = :obraId', { obraId: obra.id })
        .getMany();
      resultado.push({ ...obra, autores });
    }

    const fim = performance.now();
    return {
      versao: 'RUIM (N+1)',
      quantidadeObras: resultado.length,
      consultasDisparadas: 1 + obras.length,
      tempoMs: Number((fim - inicio).toFixed(2)),
    };
  }

  // E06.2: Versão BOA (Carregamento com relations em consultas fixas)
  async listar50SemNPlusOne() {
    const inicio = performance.now();

    const obras = await this.obraRepository.find({
      relations: { autores: true },
      take: 50,
    });

    const fim = performance.now();
    return {
      versao: 'BOA (Eager/Relations)',
      quantidadeObras: obras.length,
      consultasDisparadas: 1,
      tempoMs: Number((fim - inicio).toFixed(2)),
    };
  }

  // ⭐ E06.3: Relatórios com QueryBuilder (LEFT JOIN ... IS NULL vs NOT IN)
  async relatoriosE063() {
    // 1A. Autores sem obra usando LEFT JOIN ... IS NULL
    const t1Inicio = performance.now();
    const autoresSemObraLeftJoin = await this.autorRepository
      .createQueryBuilder('autor')
      .leftJoin('autor.obras', 'obra')
      .where('obra.id IS NULL')
      .getMany();
    const t1Fim = performance.now();

    // 1B. Autores sem obra usando Subquery NOT IN
    const t2Inicio = performance.now();
    const autoresSemObraNotIn = await this.autorRepository
      .createQueryBuilder('autor')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('oa.autor_id')
          .from('obras_autores', 'oa')
          .getQuery();
        return `autor.id NOT IN ${subQuery}`;
      })
      .getMany();
    const t2Fim = performance.now();

    // 2. Contagem de obras por categoria (GROUP BY)
    const obrasPorCategoria = await this.categoriaRepository
      .createQueryBuilder('cat')
      .leftJoin('cat.obras', 'obra')
      .select('cat.nome', 'categoria')
      .addSelect('COUNT(obra.id)', 'totalObras')
      .groupBy('cat.id')
      .addGroupBy('cat.nome')
      .getRawMany();

    // 3. Total de exemplares por estado de conservação
    const exemplaresPorEstado = await this.exemplarRepository
      .createQueryBuilder('ex')
      .select('ex.estadoConservacao', 'estado')
      .addSelect('COUNT(ex.id)', 'total')
      .groupBy('ex.estadoConservacao')
      .getRawMany();

    return {
      comparativoAutoresSemObra: {
        leftJoinIsNull: {
          encontrados: autoresSemObraLeftJoin.length,
          tempoMs: Number((t1Fim - t1Inicio).toFixed(2)),
          dados: autoresSemObraLeftJoin,
        },
        notInSubquery: {
          encontrados: autoresSemObraNotIn.length,
          tempoMs: Number((t2Fim - t2Inicio).toFixed(2)),
          dados: autoresSemObraNotIn,
        },
      },
      obrasPorCategoria,
      exemplaresPorEstado,
    };
  }
}