// Acrescenta o id do usuário autenticado ao Request do Express (preenchido pelo authMiddleware).
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
