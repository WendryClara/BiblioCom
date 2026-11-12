import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import type { Obra } from './obra.entity.js';
import type { Emprestimo } from './emprestimo.entity.js';

export enum StatusExemplar {
  DISPONIVEL = 'DISPONIVEL',
  EMPRESTADO = 'EMPRESTADO',
  MANUTENCAO = 'MANUTENCAO',
  BAIXADO = 'BAIXADO',
}

export enum EstadoConservacao {
  NOVO = 'NOVO',
  BOM = 'BOM',
  DESGASTADO = 'DESGASTADO',
  DESCARTADO = 'DESCARTADO',
  DANIFICADO = 'DANIFICADO',
}

@Entity('exemplares')
export class Exemplar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'codigo_tombo',
    unique: true,
    nullable: false,
  })
  codigoTombo: string;

  @Column({
    type: 'enum',
    enum: EstadoConservacao,
    name: 'estado_conservacao',
    default: EstadoConservacao.BOM,
    nullable: false,
  })
  estadoConservacao: EstadoConservacao;

  @Column({
    type: 'enum',
    enum: StatusExemplar,
    default: StatusExemplar.DISPONIVEL,
    nullable: false,
  })
  status: StatusExemplar;

  @ManyToOne('Obra', (obra: Obra) => obra.exemplares, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'obra_id' })
  obra: Obra;

  @OneToMany('Emprestimo', (emprestimo: Emprestimo) => emprestimo.exemplar)
  emprestimos: Emprestimo[];
}