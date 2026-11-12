import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { TypeOrmExceptionFilter } from './typeorm-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new TypeOrmExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();