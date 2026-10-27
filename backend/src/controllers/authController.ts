import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { HttpStatusCode } from '../utils/httpStatusCodes';

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const user = await authService.register(req.body);
    res.status(HttpStatusCode.CREATED).json({ message: 'User created successfully', user });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { user, token } = await authService.login(req.body);
    res.status(HttpStatusCode.OK).json({ message: 'Login successful', token, user });
  };
}

export const authController = new AuthController();
