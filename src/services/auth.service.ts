import { prisma } from '../core/db.js';
import { hashPassword, verifyPassword, generateToken } from '../core/auth.js';
import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type AuthInput = z.infer<typeof authSchema>;

export class AuthService {
  static async register(data: AuthInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id, user.email);

    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }

  static async login(data: AuthInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValid = await verifyPassword(data.password, user.password);

    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = generateToken(user.id, user.email);

    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }
}
