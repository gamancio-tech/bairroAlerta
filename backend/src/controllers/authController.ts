import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { HttpStatusCode } from '../utils/httpStatusCodes';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'Nome, email e senha são obrigatórios.' });
        return;
      }

      const user = await authService.register({ name, email, password });
      res.status(HttpStatusCode.CREATED).json({
        message: 'User created successfully',
        user
      });
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'Email e senha são obrigatórios.' });
        return;
      }

      const data = await authService.login(email, password);
      res.status(HttpStatusCode.OK).json({
        message: 'Login successful',
        token: data.token,
        user: data.user
      });
    } catch (error: any) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
