import { prisma } from '../config/prisma';
import { Alert } from '@prisma/client';

export { Alert };

export interface AlertWithUser extends Alert {
  author?: string;
  user?: {
    name: string;
    email: string;
  };
}

export class AlertRepository {
  async create(data: Omit<Alert, 'id' | 'createdAt'>): Promise<AlertWithUser> {
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
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      ...alert,
      author: alert.user?.name || 'Morador da comunidade',
    };
  }

  async findAll(): Promise<AlertWithUser[]> {
    const alerts = await prisma.alert.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return alerts.map((alert) => ({
      ...alert,
      author: alert.user?.name || 'Morador da comunidade',
    }));
  }

  async findById(id: string): Promise<AlertWithUser | null> {
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!alert) return null;

    return {
      ...alert,
      author: alert.user?.name || 'Morador da comunidade',
    };
  }
}

export const alertRepository = new AlertRepository();
