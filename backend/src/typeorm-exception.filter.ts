import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Response } from 'express';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const driverError = exception.driverError as {
      code?: string;
      detail?: string;
    };

    // 23505 = unique_violation | 23503 = foreign_key_violation (RESTRICT)
    if (driverError?.code === '23505') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        erro: 'Conflito de unicidade (UNIQUE)',
        mensagem:
          'Já existe um registro cadastrado com este valor único no banco de dados.',
        detalhe: driverError.detail,
      });
    }

    if (driverError?.code === '23503') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        erro: 'Violação de integridade referencial (RESTRICT)',
        mensagem:
          'Operação bloqueada porque existem registros dependentes vinculados a este item.',
        detalhe: driverError.detail,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      mensagem: 'Erro interno no banco de dados.',
    });
  }
}