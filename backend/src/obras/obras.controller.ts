
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { ObrasService } from './obras.service.js';

@Controller('obras')
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) {}

  @Get()
  listar() {
    return this.obrasService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.obrasService.buscarPorId(id);
  }
}
