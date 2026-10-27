import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
}

export const signToken = (userId: string): string =>
  jwt.sign({ userId }, env.jwtSecret, { algorithm: 'HS256', expiresIn: '1d' });

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
    throw new Error('Token malformado.');
  }
  return { userId: decoded.userId };
};
