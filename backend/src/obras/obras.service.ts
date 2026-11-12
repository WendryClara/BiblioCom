import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Obra } from '../entities/obra.entity.js';
import { Categoria } from '../entities/categoria.entity.js';
import { Autor } from '../entities/autor.entity.js';

@Injectable()
export class ObrasService {
  constructor(
    @InjectRepository(Obra)
    private readonly obraRepository: Repository<Obra>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Autor)
    private readonly autorRepository: Repository<Autor>,
  ) {}

  // Listagem com relações, paginada e sem problema N+1
  async listar(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [dados, total] = await this.obraRepository.findAndCount({
      relations: {
        categoria: true,
        autores: true,
        exemplares: true,
      },
      order: { titulo: 'ASC' },
      skip,
      take: limit,
    });

    return {
      dados,
      meta: {
        total,
        pagina: page,
        limite: limit,
        totalPaginas: Math.ceil(total / limit),
      },
    };
  }

  async buscarPorId(id: string) {
    const obra = await this.obraRepository.findOne({
      where: { id },
      relations: {
        categoria: true,
        autores: true,
        exemplares: true,
      },
    });

    if (!obra) {
      throw new NotFoundException('Obra não encontrada');
    }

    return obra;
  }

  async criar(dados: {
    titulo: string;
    isbn: string;
    anoPublicacao: number;
    editora?: string;
    categoriaId: string;
    autoresIds?: string[];
  }) {
    const categoria = await this.categoriaRepository.findOneBy({
      id: dados.categoriaId,
    });
    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const autores = dados.autoresIds?.length
      ? await this.autorRepository.findBy({ id: In(dados.autoresIds) })
      : [];

    const novaObra = this.obraRepository.create({
      titulo: dados.titulo,
      isbn: dados.isbn,
      anoPublicacao: dados.anoPublicacao,
      editora: dados.editora ?? null,
      categoria,
      autores,
    });

    return this.obraRepository.save(novaObra);
  }

  async remover(id: string) {
    const obra = await this.buscarPorId(id);
    await this.obraRepository.remove(obra);
    return { mensagem: 'Obra removida com sucesso' };
  }
}