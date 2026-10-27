import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { HttpStatusCode } from '../utils/httpStatusCodes';

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(HttpStatusCode.NOT_FOUND).json({ error: 'Rota não encontrada.' });
};

// O Express só reconhece um handler de erros se ele declarar os 4 parâmetros.
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(HttpStatusCode.BAD_REQUEST).json({ error: details[0]?.message ?? 'Dados inválidos.', details });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // JSON malformado no corpo da requisição (lançado pelo express.json).
  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.parse.failed') {
    res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'JSON inválido no corpo da requisição.' });
    return;
  }

  console.error(err);
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Erro interno do servidor.' });
};
