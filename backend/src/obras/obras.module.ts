import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObrasController } from './obras.controller.js';
import { ObrasService } from './obras.service.js';
import { Obra } from '../entities/obra.entity.js';
import { Categoria } from '../entities/categoria.entity.js';
import { Autor } from '../entities/autor.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Obra, Categoria, Autor])],
  controllers: [ObrasController],
  providers: [ObrasService],
})
export class ObrasModule {}