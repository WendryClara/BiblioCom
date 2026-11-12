import {
  Controller,
  Get,
  Post,
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

  @Get(':id')
  buscarPorId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.obrasService.buscarPorId(id);
  }

  @Post()
  criar(
    @Body()
    corpo: {
      titulo: string;
      isbn: string;
      anoPublicacao: number;
      editora?: string;
      categoriaId: string;
      autoresIds?: string[];
    },
  ) {
    return this.obrasService.criar(corpo);
  }

  @Delete(':id')
  remover(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.obrasService.remover(id);
  }
}