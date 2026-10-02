import { alertRepository, Alert } from '../repositories/alertRepository';

export class AlertService {
  async create(data: Omit<Alert, 'id' | 'createdAt'>) {
    if (!data.title || !data.type || !data.description || !data.location || !data.severity || data.radiusKm === undefined || data.mapX === undefined || data.mapY === undefined) {
      throw new Error('Campos obrigatórios faltando.');
    }

    return await alertRepository.create(data);
  }

  async findAll() {
    return await alertRepository.findAll();
  }

  async findById(id: string) {
    return await alertRepository.findById(id);
  }
}

export const alertService = new AlertService();
