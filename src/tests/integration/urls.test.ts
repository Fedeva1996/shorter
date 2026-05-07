import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../core/db.js';

describe('POST /api/v1/urls (Integración)', () => {
  afterAll(async () => {
    // Limpieza de datos después de la suite para evitar colisiones en otras pruebas
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
});
