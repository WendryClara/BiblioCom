import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Obra } from './obra.entity.js';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @OneToMany(() => Obra, (obra) => obra.categoria)
  obras: Obra[];
}