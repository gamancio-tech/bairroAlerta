import { z } from 'zod';

// O bcrypt só considera os primeiros 72 bytes da senha.
const MAX_PASSWORD_BYTES = 72;

export const registerSchema = z.object({
  name: z
    .string({ error: 'Informe o nome.' })
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.'),
  email: z
    .string({ error: 'Informe o e-mail.' })
    .trim()
    .toLowerCase()
    .max(254, 'O e-mail é muito longo.')
    .email('Informe um e-mail válido.'),
  password: z
    .string({ error: 'Informe a senha.' })
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .refine((value) => Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES, 'A senha é longa demais.'),
});

export const loginSchema = z.object({
  email: z.string({ error: 'Informe o e-mail.' }).trim().toLowerCase().email('Informe um e-mail válido.'),
  password: z.string({ error: 'Informe a senha.' }).min(1, 'Informe a senha.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
