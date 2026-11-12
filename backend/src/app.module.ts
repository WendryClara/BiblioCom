import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ObrasModule } from './obras/obras.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234', // Troque pela senha do seu PostgreSQL
      database: 'bibliocom',              // Nome do banco de dados
      entities: [import.meta.dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Cria e atualiza as tabelas automaticamente em desenvolvimento
    }),
    ObrasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}