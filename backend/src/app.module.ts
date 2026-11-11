import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ObrasModule } from './obras/obras.module.js';

@Module({
  imports: [ObrasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
