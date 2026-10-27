import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

/** Valida e normaliza o corpo da requisição. Em caso de erro, o errorHandler responde 400. */
export const validate =
  (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
