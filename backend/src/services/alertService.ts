import { alertRepository, NewAlert } from '../repositories/alertRepository';

export class AlertService {
  // Os dados já chegam validados pelo schema (createAlertSchema) na rota.
  async create(data: NewAlert) {
    return alertRepository.create(data);
  }

  async findAll() {
    return alertRepository.findAll();
  }

  async findById(id: string) {
    return alertRepository.findById(id);
  }
}

export const alertService = new AlertService();
