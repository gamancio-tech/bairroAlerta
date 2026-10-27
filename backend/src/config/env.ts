import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_CORS_ORIGINS = [
  'https://bairroalerta-frontend.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}. Veja o arquivo .env.example.`);
  }
  return value;
}

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres.');
}

// Garante que o banco está configurado antes de subir o servidor.
required('DATABASE_URL');

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : DEFAULT_CORS_ORIGINS;

export const env = {
  port: Number(process.env.PORT) || 3333,
  jwtSecret,
  corsOrigins,
};
