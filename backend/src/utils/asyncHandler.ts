import { NextFunction, Request, RequestHandler, Response } from 'express';

/** Encaminha erros de handlers assíncronos para o errorHandler (o Express 4 não faz isso sozinho). */
export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };
