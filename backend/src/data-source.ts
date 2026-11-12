import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Usuario } from './entities/usuario.entity.js';
import { Categoria } from './entities/categoria.entity.js';
import { Autor } from './entities/autor.entity.js';
import { Obra } from './entities/obra.entity.js';
import { Exemplar } from './entities/exemplar.entity.js';
import { Emprestimo } from './entities/emprestimo.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'bibliocom',
  synchronize: false,
  logging: true,
  entities: [Usuario, Categoria, Autor, Obra, Exemplar, Emprestimo],
  migrations: [import.meta.dirname + '/migracoes/*{.ts,.js}'],
});