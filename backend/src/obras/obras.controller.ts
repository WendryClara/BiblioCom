import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ObrasService } from './obras.service.js';

@Controller('obras')
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) {}

  @Get()
  listar(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.obrasService.listar(page, limit);
  }

  @Get('busca/filtros')
  buscarComFiltros(
    @Query('titulo') titulo?: string,
    @Query('anoMax') anoMax?: string,
    @Query('autorNome') autorNome?: string,
  ) {
    return this.obrasService.buscarComFiltros({
      titulo,
      anoMax: anoMax ? Number(anoMax) : undefined,
      autorNome,
    });
  }

  @Get('exercicios/e06-1')
  executarE061() {
    return this.obrasService.executarConsultasE061();
  }

  @Get('exercicios/e06-2/ruim')
  testarNPlusOneRuim() {
    return this.obrasService.listar50ComNPlusOne();
  }

  @Get('exercicios/e06-2/boa')
  testarNPlusOneBoa() {
    return this.obrasService.listar50SemNPlusOne();
  }

  @Get('exercicios/e06-3')
  executarE063() {
    return this.obrasService.relatoriosE063();
  }

  @Get(':id')
  buscarPorId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.obrasService.buscarPorId(id);
  }

  @Post()
  criar(
    @Body()
    corpo: {
      titulo: string;
      isbn?: string | null;
      anoPublicacao: number;
      editora?: string;
      categoriaId: string;
      autoresIds?: string[];
    },
  ) {
    return this.obrasService.criar(corpo);
  }

  @Patch(':id')
  atualizar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body()
    corpo: { titulo?: string; editora?: string; anoPublicacao?: number },
  ) {
    return this.obrasService.atualizar(id, corpo);
  }

  @Delete(':id')
  remover(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.obrasService.remover(id);
  }
}