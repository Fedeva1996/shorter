import { prisma } from '../core/db.js';
import { generateShortCode } from '../core/codeGenerator.js';

export class UrlService {
  static async createUrl(originalUrl: string) {
    let retries = 0;
    while (retries < 3) {
      const shortCode = generateShortCode();
      try {
        const urlEntry = await prisma.urlEntry.create({
          data: {
            originalUrl,
            shortCode,
          },
        });
        return urlEntry;
      } catch (error: any) {
        // P2002 es el código de error de Prisma para fallas de "Unique constraint"
        if (error.code === 'P2002') {
          retries++;
          continue;
        }
        throw error;
      }
    }
    throw new Error('No se pudo generar un shortCode único después de 3 intentos');
  }

  static async resolveAndIncrement(shortCode: string) {
    try {
      const urlEntry = await prisma.urlEntry.update({
        where: { shortCode },
        data: {
          clicks: { increment: 1 },
          lastClickedAt: new Date(),
        },
      });
      return urlEntry;
    } catch (error: any) {
      if (error.code === 'P2025') {
        // P2025: Record to update not found
        return null;
      }
      throw error;
    }
  }
}
