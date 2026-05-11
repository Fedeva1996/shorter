import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../core/db.js';

describe('POST /api/v1/urls (Auth Integration)', () => {
  const testUser = {
    email: 'creator@example.com',
    password: 'password123',
  };
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.urlEntry.deleteMany();
    await prisma.user.deleteMany();

    // Registrar un usuario para obtener un token válido
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);
    
    token = registerRes.body.token;
    userId = registerRes.body.user.id;
  });

  it('Debe asociar la URL al usuario si se provee un token válido', async () => {
    const payload = { originalUrl: 'https://example.com/user-link' };

    const response = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(201);
    
    // Verificar en la base de datos
    const dbEntry = await prisma.urlEntry.findUnique({
      where: { id: response.body.id }
    });
    
    expect(dbEntry?.userId).toBe(userId);
  });

  it('Debe crear la URL con userId nulo si NO se provee token', async () => {
    const payload = { originalUrl: 'https://example.com/anon-link' };

    const response = await request(app)
      .post('/api/v1/urls')
      .send(payload);

    expect(response.status).toBe(201);
    
    const dbEntry = await prisma.urlEntry.findUnique({
      where: { id: response.body.id }
    });
    
    expect(dbEntry?.userId).toBeNull();
  });

  it('Debe crear la URL con userId nulo si el token es inválido (optionalAuth)', async () => {
    const payload = { originalUrl: 'https://example.com/invalid-token-link' };

    const response = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', 'Bearer invalid-token')
      .send(payload);

    expect(response.status).toBe(201);
    
    const dbEntry = await prisma.urlEntry.findUnique({
      where: { id: response.body.id }
    });
    
    expect(dbEntry?.userId).toBeNull();
  });
});
