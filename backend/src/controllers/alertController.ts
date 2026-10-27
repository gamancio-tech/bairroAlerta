import { Request, Response } from 'express';
import { alertService } from '../services/alertService';
import { AppError } from '../utils/AppError';
import { HttpStatusCode } from '../utils/httpStatusCodes';

export class AlertController {
  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AppError('Usuário não autenticado.', HttpStatusCode.UNAUTHORIZED);
    }

    const alert = await alertService.create({ ...req.body, userId: req.userId });
    res.status(HttpStatusCode.CREATED).json(alert);
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const alerts = await alertService.findAll();
    res.status(HttpStatusCode.OK).json(alerts);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const alert = await alertService.findById(String(req.params.id));

    if (!alert) {
      throw new AppError('Alerta não encontrado.', HttpStatusCode.NOT_FOUND);
    }

    res.status(HttpStatusCode.OK).json(alert);
  };
}

export const alertController = new AlertController();
