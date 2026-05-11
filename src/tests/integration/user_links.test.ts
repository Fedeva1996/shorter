import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../core/db.js';

describe('User Links API (Integración)', () => {
  const userA = { email: 'userA@test.com', password: 'password123' };
  const userB = { email: 'userB@test.com', password: 'password123' };
  let tokenA: string;
  let tokenB: string;

  beforeEach(async () => {
    await prisma.urlEntry.deleteMany();
    await prisma.user.deleteMany();

    const resA = await request(app).post('/api/v1/auth/register').send(userA);
    const resB = await request(app).post('/api/v1/auth/register').send(userB);
    tokenA = resA.body.token;
    tokenB = resB.body.token;
  });

  describe('GET /api/v1/urls/my-links', () => {
    it('Debe devolver solo los links del usuario autenticado', async () => {
      // Crear link para Usuario A
      await request(app).post('/api/v1/urls').set('Authorization', `Bearer ${tokenA}`).send({ originalUrl: 'https://a.com' });
      // Crear link para Usuario B
      await request(app).post('/api/v1/urls').set('Authorization', `Bearer ${tokenB}`).send({ originalUrl: 'https://b.com' });
      // Crear link anónimo
      await request(app).post('/api/v1/urls').send({ originalUrl: 'https://anon.com' });

      const response = await request(app)
        .get('/api/v1/urls/my-links')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].originalUrl).toBe('https://a.com');
    });

    it('Debe retornar 401 si no hay token', async () => {
      const response = await request(app).get('/api/v1/urls/my-links');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/urls/sync', () => {
    it('Debe asociar links anónimos al usuario autenticado', async () => {
      // Crear links anónimos
      const res1 = await request(app).post('/api/v1/urls').send({ originalUrl: 'https://anon1.com' });
      const res2 = await request(app).post('/api/v1/urls').send({ originalUrl: 'https://anon2.com' });
      const shortCodes = [res1.body.shortCode, res2.body.shortCode];

      const syncRes = await request(app)
        .post('/api/v1/urls/sync')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ shortCodes });

      expect(syncRes.status).toBe(200);
      expect(syncRes.body.message).toMatch(/sincronizados/i);

      // Verificar que ahora pertenecen al Usuario A
      const myLinks = await request(app)
        .get('/api/v1/urls/my-links')
        .set('Authorization', `Bearer ${tokenA}`);
      
      expect(myLinks.body).toHaveLength(2);
    });

    it('No debe permitir reclamar un link que ya pertenece a otro usuario', async () => {
      // Usuario B crea un link
      const resB = await request(app).post('/api/v1/urls').set('Authorization', `Bearer ${tokenB}`).send({ originalUrl: 'https://userB.com' });
      const shortCode = resB.body.shortCode;

      // Usuario A intenta sincronizarlo
      const syncRes = await request(app)
        .post('/api/v1/urls/sync')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ shortCodes: [shortCode] });

      expect(syncRes.status).toBe(200); // El endpoint responde éxito por el proceso general
      
      // Usuario A no debe tener el link de B
      const myLinks = await request(app)
        .get('/api/v1/urls/my-links')
        .set('Authorization', `Bearer ${tokenA}`);
      
      expect(myLinks.body).toHaveLength(0);
    });
  });
});
