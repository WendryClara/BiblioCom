import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { Obra } from './obra.entity.js';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @OneToMany('Obra', (obra: Obra) => obra.categoria)
  obras: Obra[];
}