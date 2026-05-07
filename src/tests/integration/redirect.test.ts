import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../core/db.js';
import { generateShortCode } from '../../core/codeGenerator.js';

describe('GET /:shortCode (Integración)', () => {
  let createdUrlEntry: { id: string; originalUrl: string; shortCode: string; clicks: number; };

  beforeAll(async () => {
    // Preparar un dato inicial para los tests
    createdUrlEntry = await prisma.urlEntry.create({
      data: {
        originalUrl: 'https://example.com/redirect-target',
        shortCode: generateShortCode(),
      }
    });
  });

  afterAll(async () => {
    // Limpieza
    await prisma.urlEntry.deleteMany();
    await prisma.$disconnect();
  });

  it('debe retornar 302 y header Location correcto para un shortCode válido (RN-02)', async () => {
    const response = await request(app)
      .get(`/${createdUrlEntry.shortCode}`)
      .expect(302);
      
    // Verifica que el Location apunte a la URL original
    expect(response.headers.location).toBe(createdUrlEntry.originalUrl);

    // Verificar en BD que clics sumó 1 y lastClickedAt se actualizó
    const dbEntry = await prisma.urlEntry.findUnique({
      where: { shortCode: createdUrlEntry.shortCode }
    });
    expect(dbEntry?.clicks).toBe(1);
    expect(dbEntry?.lastClickedAt).not.toBeNull();
  });

  it('debe ejecutar 10 requests concurrentes y actualizar clics de forma atómica a +10 (EC-05)', async () => {
    // Creamos otra entrada fresca para probar concurrencia atómica
    const concurrentEntry = await prisma.urlEntry.create({
      data: {
        originalUrl: 'https://example.com/concurrent',
        shortCode: generateShortCode(),
      }
    });

    // Lanzar 10 requests al mismo tiempo sin hacer await uno por uno
    const requests = Array.from({ length: 10 }).map(() => 
      request(app).get(`/${concurrentEntry.shortCode}`).expect(302)
    );

    await Promise.all(requests);

    const dbEntry = await prisma.urlEntry.findUnique({
      where: { shortCode: concurrentEntry.shortCode }
    });

    // Como partió en 0 y hubo 10 peticiones exitosas atómicas, el valor DEBE ser 10 exactos.
    expect(dbEntry?.clicks).toBe(10);
  });

  it('debe retornar 404 si el shortCode no existe (EC-04)', async () => {
    const response = await request(app)
      .get('/nonExistentCode')
      .expect(404);
      
    expect(response.body).toHaveProperty('error');
  });
});
