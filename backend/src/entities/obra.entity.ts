import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { Categoria } from './categoria.entity.js';
import { Autor } from './autor.entity.js';
import { Exemplar } from './exemplar.entity.js';

@Entity('obras')
@Index(['titulo', 'editora', 'anoPublicacao'], { unique: true })
export class Obra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  titulo: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  isbn: string;

  @Column({ type: 'int', name: 'ano_publicacao', nullable: false })
  anoPublicacao: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  editora: string | null;

  @ManyToOne(() => Categoria, (categoria) => categoria.obras, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @ManyToMany(() => Autor, (autor) => autor.obras)
  @JoinTable({
    name: 'obras_autores',
    joinColumn: { name: 'obra_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'autor_id', referencedColumnName: 'id' },
  })
  autores: Autor[];

  @OneToMany(() => Exemplar, (exemplar) => exemplar.obra)
  exemplares: Exemplar[];
}