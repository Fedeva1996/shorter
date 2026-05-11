import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../core/db.js';

describe('Auth API (Integración)', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  describe('POST /api/v1/auth/register', () => {
    it('Debe registrar un nuevo usuario y devolver un token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('Debe fallar si el email ya está registrado', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('El email ya está registrado');
    });

    it('Debe fallar si faltan campos o son inválidos', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'no-es-un-email', password: '123' });

      expect(response.status).toBe(400); // Error de Zod
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('Debe iniciar sesión correctamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(testUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('Debe fallar con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('Debe fallar con email no registrado', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });
  });
});
