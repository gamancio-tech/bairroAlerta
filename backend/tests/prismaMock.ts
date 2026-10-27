// Substitui o PrismaClient por funções simuladas: os testes não precisam de banco de dados.
export const prismaMock = {
  user: { findUnique: jest.fn(), create: jest.fn() },
  alert: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
};

jest.mock('../src/config/prisma', () => ({ prisma: prismaMock }));
