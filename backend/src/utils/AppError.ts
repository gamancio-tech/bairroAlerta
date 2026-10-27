import { HttpStatusCode } from './httpStatusCodes';

/** Erro esperado da aplicação, com o status HTTP que deve ser devolvido. */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = HttpStatusCode.BAD_REQUEST,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
