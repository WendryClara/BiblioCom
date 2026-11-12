import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Exemplar } from './exemplar.entity.js';

export enum StatusEmprestimo {
  ATIVO = 'ATIVO',
  DEVOLVIDO = 'DEVOLVIDO',
  ATRASADO = 'ATRASADO',
}

@Entity('emprestimos')
@Index(['usuario', 'exemplar', 'status'])
export class Emprestimo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', name: 'data_retirada', nullable: false })
  dataRetirada: Date;

  @Column({
    type: 'timestamptz',
    name: 'data_prevista_devolucao',
    nullable: false,
  })
  dataPrevistaDevolucao: Date;

  @Column({ type: 'timestamptz', name: 'data_devolucao', nullable: true })
  dataDevolucao: Date | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'valor_multa',
    default: 0,
    nullable: false,
  })
  valorMulta: string;

  @Column({
    type: 'enum',
    enum: StatusEmprestimo,
    default: StatusEmprestimo.ATIVO,
    nullable: false,
  })
  status: StatusEmprestimo;

  @ManyToOne(() => Usuario, (usuario) => usuario.emprestimos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Exemplar, (exemplar) => exemplar.emprestimos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'exemplar_id' })
  exemplar: Exemplar;
}