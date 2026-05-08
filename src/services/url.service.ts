import { prisma } from '../core/db.js';
import { generateShortCode } from '../core/codeGenerator.js';

export class UrlService {
  static async createUrl(originalUrl: string): Promise<{ entry: Awaited<ReturnType<typeof prisma.urlEntry.findUniqueOrThrow>>; created: boolean }> {
    // EC-07: Idempotencia — si la URL ya existe, retornar la entrada existente
    const existing = await prisma.urlEntry.findUnique({
      where: { originalUrl },
    });

    if (existing) {
      return { entry: existing, created: false };
    }

    // URL nueva: intentar crear con reintentos por colisión de shortCode (EC-03)
    let retries = 0;
    while (retries < 3) {
      const shortCode = generateShortCode();
      try {
        const urlEntry = await prisma.urlEntry.create({
          data: { originalUrl, shortCode },
        });
        return { entry: urlEntry, created: true };
      } catch (error: any) {
        // P2002: Unique constraint failed (colisión de shortCode)
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

  static async getStats(shortCode: string) {
    const urlEntry = await prisma.urlEntry.findUnique({
      where: { shortCode },
      select: {
        shortCode: true,
        originalUrl: true,
        clicks: true,
        createdAt: true,
        lastClickedAt: true
      }
    });
    return urlEntry;
  }
}
