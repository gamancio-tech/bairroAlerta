import request from 'supertest';
import './prismaMock';
import app from '../src/app';

describe('Rotas básicas', () => {
  it('GET /health responde 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('rota inexistente responde 404 em JSON', async () => {
    const res = await request(app).get('/rota-que-nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('JSON malformado responde 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ isto não é json');
    expect(res.status).toBe(400);
  });
});
