import request from 'supertest';
import { prismaMock } from './prismaMock';
import app from '../src/app';
import { hashPassword } from '../src/utils/hash';
import { verifyToken } from '../src/utils/jwt';

const validUser = { name: 'Maria Silva', email: 'maria@email.com', password: 'senha-segura-123' };

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.resetAllMocks());

  it('cria o usuário, grava a senha com hash e não devolve a senha', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({
      id: 'user-1',
      createdAt: new Date(),
      ...data,
    }));

    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ id: 'user-1', name: 'Maria Silva', email: 'maria@email.com' });
    expect(res.body.user.password).toBeUndefined();

    const savedPassword = prismaMock.user.create.mock.calls[0][0].data.password;
    expect(savedPassword).not.toBe(validUser.password);
    expect(savedPassword.startsWith('$2')).toBe(true);
  });

  it('normaliza o e-mail (minúsculas e sem espaços)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({ id: 'u', createdAt: new Date(), ...data }));

    await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: '  Maria@Email.COM ' });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'maria@email.com' } });
  });

  it('rejeita dados inválidos com 400 e detalhes por campo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'M', email: 'email-invalido', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.details.map((d: { field: string }) => d.field)).toEqual(
      expect.arrayContaining(['name', 'email', 'password']),
    );
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('responde 409 quando o e-mail já está cadastrado', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', ...validUser });

    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('E-mail já cadastrado.');
  });

  it('responde 409 se o banco acusar e-mail duplicado (cadastros simultâneos)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockRejectedValue({ code: 'P2002' });

    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.resetAllMocks());

  it('devolve um token JWT com o id do usuário', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: validUser.name,
      email: validUser.email,
      password: await hashPassword(validUser.password),
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(verifyToken(res.body.token).userId).toBe('user-1');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejeita senha errada com 401', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: validUser.name,
      email: validUser.email,
      password: await hashPassword(validUser.password),
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'senha-errada' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas.');
  });

  it('usa a mesma resposta para e-mail inexistente', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ninguem@email.com', password: 'qualquer-senha' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas.');
  });

  it('rejeita corpo sem senha com 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: validUser.email });
    expect(res.status).toBe(400);
  });
});
