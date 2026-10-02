import { Request, Response } from 'express';
import { alertService } from '../services/alertService';
import { HttpStatusCode } from '../utils/httpStatusCodes';

interface AuthRequest extends Request {
  userId?: string;
}

export class AlertController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, type, description, location, radiusKm, mapX, mapY } = req.body;
      const userId = req.userId;

      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ error: 'Usuário não autenticado.' });
        return;
      }

      if (!title || !type || !description || !location || radiusKm === undefined || mapX === undefined || mapY === undefined) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'Todos os campos são obrigatórios.' });
        return;
      }

      const alert = await alertService.create({
        title,
        type,
        description,
        location,
        radiusKm: Number(radiusKm),
        mapX: Number(mapX),
        mapY: Number(mapY),
        userId
      });

      res.status(HttpStatusCode.CREATED).json(alert);
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await alertService.findAll();
      res.status(HttpStatusCode.OK).json(alerts);
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Erro ao buscar alertas.' });
    }
  }
}

export const alertController = new AlertController();
