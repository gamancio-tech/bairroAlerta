import { JsonDatabase } from '../config/jsonDatabase';

export interface Alert {
  id: string;
  title: string;
  type: string;
  description: string;
  location: string;
  radiusKm: number;
  mapX: number;
  mapY: number;
  userId: string;
  createdAt: string;
}

export interface AlertWithUser extends Alert {
  user?: {
    name: string;
    email: string;
  };
}

const dbAlerts = new JsonDatabase<Alert>('alerts');
const dbUsers = new JsonDatabase<{ id: string; name: string; email: string; password: string; createdAt: string }>('users');

function attachUser(alert: Alert): AlertWithUser {
  const user = dbUsers.findById(alert.userId);
  return {
    ...alert,
    user: user ? { name: user.name, email: user.email } : undefined,
  };
}

export class AlertRepository {
  async create(data: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    return dbAlerts.create(data);
  }

  async findAll(): Promise<AlertWithUser[]> {
    const alerts = dbAlerts.findAll();
    const sorted = alerts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted.map(attachUser);
  }

  async findById(id: string): Promise<AlertWithUser | null> {
    const alert = dbAlerts.findById(id);
    if (!alert) return null;
    return attachUser(alert);
  }
}

export const alertRepository = new AlertRepository();
