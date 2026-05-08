import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import urlRoutes from '../../routes/url.routes.js';
import { errorHandler } from '../../middlewares/errorHandler.js';
import { createRateLimiter } from '../../middlewares/rateLimiter.js'; // No existe aún — RED
import { prisma } from '../../core/db.js';

describe('[EC-06] Rate Limiting — POST /api/v1/urls', () => {
  // App de prueba aislada con límite estricto: max 3 requests por ventana
  // Permite validar el 429 sin afectar el estado de las otras suites
  const testApp = express();
  testApp.use(express.json());
  testApp.use(
    '/api/v1/urls',
    createRateLimiter({ max: 3, windowMs: 60_000 }),
    urlRoutes,
  );
  testApp.use(errorHandler);

  afterAll(async () => {
    // Limpiar solo los registros creados en esta suite
    await prisma.urlEntry.deleteMany({
      where: { originalUrl: { startsWith: 'https://rate-limit-test.example.com' } },
    });
    await prisma.$disconnect();
  });

  it('[EC-06] debe retornar 429 al exceder el límite de peticiones y el cuerpo debe contener "error"', async () => {
    const statusCodes: number[] = [];
    let limitedBody: Record<string, unknown> = {};

    // 4 requests secuenciales: el límite es 3, el 4to debe ser rechazado
    for (let i = 0; i < 4; i++) {
      const res = await request(testApp)
        .post('/api/v1/urls')
        .send({ originalUrl: `https://rate-limit-test.example.com/path-${i}` });

      statusCodes.push(res.status);

      if (res.status === 429) {
        limitedBody = res.body as Record<string, unknown>;
      }
    }

    // Los primeros 3 requests deben ser exitosos (URL nueva = 201)
    expect(statusCodes[0]).toBe(201);
    expect(statusCodes[1]).toBe(201);
    expect(statusCodes[2]).toBe(201);

    // El 4to debe ser bloqueado por el rate limiter
    expect(statusCodes[3]).toBe(429);

    // La respuesta del 429 debe ser JSON con la propiedad "error"
    expect(limitedBody).toHaveProperty('error');
  });
});
