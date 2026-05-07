import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../core/db.js';
import { generateShortCode } from '../../core/codeGenerator.js';

describe('GET /api/v1/urls/:shortCode/stats (Integración)', () => {
  let createdUrlEntry: { id: string; originalUrl: string; shortCode: string; clicks: number; createdAt: Date; lastClickedAt: Date | null; };

  beforeAll(async () => {
    // Preparar un dato inicial para los tests
    createdUrlEntry = await prisma.urlEntry.create({
      data: {
        originalUrl: 'https://example.com/stats-target',
        shortCode: generateShortCode(),
        clicks: 5,
        lastClickedAt: new Date()
      }
    });
  });

  afterAll(async () => {
    // Limpieza
    await prisma.urlEntry.deleteMany();
    await prisma.$disconnect();
  });

  it('debe retornar 200 y las estadísticas correctas para un shortCode válido', async () => {
    const response = await request(app)
      .get(`/api/v1/urls/${createdUrlEntry.shortCode}/stats`)
      .expect(200);
      
    // Validar estructura y datos del JSON de respuesta según SPEC
    expect(response.body).toHaveProperty('shortCode', createdUrlEntry.shortCode);
    expect(response.body).toHaveProperty('originalUrl', createdUrlEntry.originalUrl);
    expect(response.body).toHaveProperty('clicks', 5);
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('lastClickedAt');
  });

  it('debe retornar 404 si el shortCode no existe', async () => {
    const response = await request(app)
      .get('/api/v1/urls/nonExistentStatsCode/stats')
      .expect(404);
      
    expect(response.body).toHaveProperty('error');
  });
});
