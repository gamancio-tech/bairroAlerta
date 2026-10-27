import type { Alert } from '@prisma/client';
import { prisma } from '../config/prisma';

export type { Alert };

export type NewAlert = Omit<Alert, 'id' | 'createdAt'>;

export type AlertResponse = Alert & { author: string };

const MAX_ALERTS_PER_LIST = 200;

// Apenas o nome do autor é buscado: o e-mail nunca deve sair em uma rota pública.
const withAuthorName = { user: { select: { name: true } } } as const;

type AlertWithAuthor = Alert & { user: { name: string } };

const toResponse = ({ user, ...alert }: AlertWithAuthor): AlertResponse => ({
  ...alert,
  author: user?.name || 'Morador da comunidade',
});

export class AlertRepository {
  async create(data: NewAlert): Promise<AlertResponse> {
    const alert = await prisma.alert.create({
      data: {
        title: data.title,
        type: data.type,
        description: data.description,
        location: data.location,
        radiusKm: data.radiusKm,
        severity: data.severity,
        mapX: data.mapX,
        mapY: data.mapY,
        userId: data.userId,
      },
      include: withAuthorName,
    });

    return toResponse(alert);
  }

  async findAll(): Promise<AlertResponse[]> {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: MAX_ALERTS_PER_LIST,
      include: withAuthorName,
    });

    return alerts.map(toResponse);
  }

  async findById(id: string): Promise<AlertResponse | null> {
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: withAuthorName,
    });

    return alert ? toResponse(alert) : null;
  }
}

export const alertRepository = new AlertRepository();
