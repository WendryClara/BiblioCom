import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import type { Obra } from './obra.entity.js';

@Entity('autores')
export class Autor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  nacionalidade: string | null;

  @ManyToMany('Obra', (obra: Obra) => obra.autores)
  obras: Obra[];
}