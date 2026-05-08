import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../core/db.js';

describe('POST /api/v1/urls (Integración)', () => {
  beforeEach(async () => {
    // Limpiar antes de cada test para garantizar estado predecible
    await prisma.urlEntry.deleteMany();
  });

  afterAll(async () => {
    await prisma.urlEntry.deleteMany();
    await prisma.$disconnect();
  });

  it('debe retornar 201 y la estructura JSON correcta al enviar una URL válida', async () => {
    const payload = { originalUrl: 'https://example.com/integration-test' };

    const response = await request(app)
      .post('/api/v1/urls')
      .send(payload)
      .expect(201);

    // Validar estructura del JSON
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('shortCode');
    expect(response.body.shortCode.length).toBe(6);
    expect(response.body).toHaveProperty('originalUrl', payload.originalUrl);
    expect(response.body).toHaveProperty('createdAt');
  });

  it('debe retornar 400 y un mensaje de error al enviar una URL inválida', async () => {
    const payload = { originalUrl: 'invalid_url_format' };

    const response = await request(app)
      .post('/api/v1/urls')
      .send(payload)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  // T2.5.3 — Idempotencia (EC-07)
  it('[EC-07] debe retornar 200 con la entrada EXISTENTE al enviar una URL que ya fue acortada', async () => {
    const payload = { originalUrl: 'https://idempotent-test.example.com/same-url' };

    // Primera petición: crea la entrada → 201 Created
    const firstResponse = await request(app)
      .post('/api/v1/urls')
      .send(payload)
      .expect(201);

    const originalId = firstResponse.body.id;
    const originalShortCode = firstResponse.body.shortCode;

    // Segunda petición con la misma URL: debe ser idempotente → 200 OK
    const secondResponse = await request(app)
      .post('/api/v1/urls')
      .send(payload)
      .expect(200); // ← FALLA HOY: el sistema actualmente retorna 201

    // El cuerpo debe ser la entrada original, no una nueva
    expect(secondResponse.body.id).toBe(originalId);
    expect(secondResponse.body.shortCode).toBe(originalShortCode);
    expect(secondResponse.body.originalUrl).toBe(payload.originalUrl);

    // Verificar en DB que solo existe UNA entrada para esta URL
    const count = await prisma.urlEntry.count({
      where: { originalUrl: payload.originalUrl },
    });
    expect(count).toBe(1);
  });
});
