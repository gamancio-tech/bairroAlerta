import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Token não fornecido ou em formato inválido.', HttpStatusCode.UNAUTHORIZED));
    return;
  }

  try {
    req.userId = verifyToken(authHeader.slice('Bearer '.length)).userId;
    next();
  } catch {
    next(new AppError('Token inválido ou expirado.', HttpStatusCode.UNAUTHORIZED));
  }
};
