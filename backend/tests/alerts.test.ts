import jwt from 'jsonwebtoken';
import request from 'supertest';
import { prismaMock } from './prismaMock';
import app from '../src/app';
import { signToken } from '../src/utils/jwt';

const validAlert = {
  title: 'Rua alagada',
  type: 'ENCHENTE',
  description: 'Água subindo rápido na avenida principal',
  location: 'Rua das Flores',
  radiusKm: 1.5,
  severity: 'ALTA',
  mapX: 45.2,
  mapY: 60.1,
};

const storedAlert = {
  id: 'alert-1',
  ...validAlert,
  createdAt: new Date('2026-10-01T12:00:00Z'),
  userId: 'user-1',
};

describe('GET /api/alerts', () => {
  beforeEach(() => jest.resetAllMocks());

  it('é público, devolve o autor pelo nome e nunca expõe o e-mail', async () => {
    prismaMock.alert.findMany.mockResolvedValue([
      { ...storedAlert, user: { name: 'Maria Silva', email: 'maria@email.com' } },
    ]);

    const res = await request(app).get('/api/alerts');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].author).toBe('Maria Silva');
    expect(res.body[0].user).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('maria@email.com');
  });

  it('pede ao banco apenas o nome do autor, ordenado do mais recente', async () => {
    prismaMock.alert.findMany.mockResolvedValue([]);

    await request(app).get('/api/alerts');

    expect(prismaMock.alert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    );
  });
});

describe('GET /api/alerts/:id', () => {
  beforeEach(() => jest.resetAllMocks());

  it('devolve o alerta encontrado', async () => {
    prismaMock.alert.findUnique.mockResolvedValue({ ...storedAlert, user: { name: 'Maria Silva' } });

    const res = await request(app).get('/api/alerts/alert-1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('alert-1');
    expect(res.body.author).toBe('Maria Silva');
  });

  it('responde 404 quando não existe', async () => {
    prismaMock.alert.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/alerts/inexistente');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/alerts', () => {
  beforeEach(() => jest.resetAllMocks());

  const auth = () => ({ Authorization: `Bearer ${signToken('user-1')}` });

  it('exige autenticação (401 sem token)', async () => {
    const res = await request(app).post('/api/alerts').send(validAlert);
    expect(res.status).toBe(401);
    expect(prismaMock.alert.create).not.toHaveBeenCalled();
  });

  it('rejeita token inválido', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', 'Bearer token-invalido')
      .send(validAlert);
    expect(res.status).toBe(401);
  });

  it('rejeita token assinado com outra chave', async () => {
    const forged = jwt.sign({ userId: 'user-1' }, 'outra-chave-qualquer-com-mais-de-32-caracteres');
    const res = await request(app).post('/api/alerts').set('Authorization', `Bearer ${forged}`).send(validAlert);
    expect(res.status).toBe(401);
  });

  it('cria o alerta usando o usuário do token, não um userId enviado no corpo', async () => {
    prismaMock.alert.create.mockImplementation(async ({ data }) => ({
      id: 'alert-2',
      createdAt: new Date(),
      ...data,
      user: { name: 'Maria Silva' },
    }));

    const res = await request(app)
      .post('/api/alerts')
      .set(auth())
      .send({ ...validAlert, userId: 'outro-usuario' });

    expect(res.status).toBe(201);
    expect(prismaMock.alert.create.mock.calls[0][0].data.userId).toBe('user-1');
    expect(res.body.author).toBe('Maria Silva');
  });

  it.each([
    ['tipo inválido', { type: 'TERREMOTO' }],
    ['gravidade inválida', { severity: 'ALTISSIMA' }],
    ['raio acima do limite', { radiusKm: 500 }],
    ['posição fora do mapa', { mapX: 150 }],
    ['título vazio', { title: '   ' }],
    ['descrição muito longa', { description: 'a'.repeat(301) }],
  ])('rejeita %s com 400', async (_label, override) => {
    const res = await request(app)
      .post('/api/alerts')
      .set(auth())
      .send({ ...validAlert, ...override });

    expect(res.status).toBe(400);
    expect(prismaMock.alert.create).not.toHaveBeenCalled();
  });

  it('rejeita campos obrigatórios ausentes com 400', async () => {
    const res = await request(app).post('/api/alerts').set(auth()).send({ title: 'Só o título' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(1);
  });
});
