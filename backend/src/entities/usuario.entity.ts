import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Emprestimo } from './emprestimo.entity.js';

export enum PerfilUsuario {
  LEITOR = 'LEITOR',
  BIBLIOTECARIO = 'BIBLIOTECARIO',
  ADMIN = 'ADMIN',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 30, unique: true, nullable: false })
  matricula: string;

  @Column({
    type: 'enum',
    enum: PerfilUsuario,
    default: PerfilUsuario.LEITOR,
    nullable: false,
  })
  perfil: PerfilUsuario;

  @Column({ type: 'boolean', default: true, nullable: false })
  ativo: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'criado_em' })
  criadoEm: Date;

  @OneToMany(() => Emprestimo, (emprestimo) => emprestimo.usuario)
  emprestimos: Emprestimo[];
}
