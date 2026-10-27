import { z } from 'zod';

export const ALERT_TYPES = [
  'ENCHENTE',
  'ALAGAMENTO',
  'CHUVA',
  'DESLIZAMENTO',
  'TEMPESTADE',
  'VENDAVAL',
  'CALOR_EXTREMO',
  'OUTROS',
] as const;

export const ALERT_SEVERITIES = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'] as const;

const number = (message: string) => z.coerce.number({ error: message });

// Os limites seguem os mesmos valores dos formulários do front-end.
export const createAlertSchema = z.object({
  title: z
    .string({ error: 'Informe o título.' })
    .trim()
    .min(3, 'O título deve ter pelo menos 3 caracteres.')
    .max(70, 'O título deve ter no máximo 70 caracteres.'),
  type: z.enum(ALERT_TYPES, { error: 'Tipo de alerta inválido.' }),
  description: z
    .string({ error: 'Informe a descrição.' })
    .trim()
    .min(5, 'A descrição deve ter pelo menos 5 caracteres.')
    .max(300, 'A descrição deve ter no máximo 300 caracteres.'),
  location: z
    .string({ error: 'Informe o local.' })
    .trim()
    .min(2, 'O local deve ter pelo menos 2 caracteres.')
    .max(80, 'O local deve ter no máximo 80 caracteres.'),
  radiusKm: number('Informe o raio em km.')
    .min(0.1, 'O raio mínimo é 0,1 km.')
    .max(50, 'O raio máximo é 50 km.'),
  severity: z.enum(ALERT_SEVERITIES, { error: 'Gravidade inválida.' }),
  mapX: number('Informe a posição horizontal no mapa.')
    .min(0, 'A posição horizontal deve estar entre 0 e 100.')
    .max(100, 'A posição horizontal deve estar entre 0 e 100.'),
  mapY: number('Informe a posição vertical no mapa.')
    .min(0, 'A posição vertical deve estar entre 0 e 100.')
    .max(100, 'A posição vertical deve estar entre 0 e 100.'),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
