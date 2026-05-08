import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UrlService } from '../../services/url.service';
import { prisma } from '../../core/db';
import * as codeGenerator from '../../core/codeGenerator';

vi.mock('../../core/db', () => ({
  prisma: {
    urlEntry: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../../core/codeGenerator', () => ({
  generateShortCode: vi.fn(),
}));

describe('UrlService - Colisiones y Race Conditions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('EC-03: Debe reintentar hasta 3 veces si hay colisión de shortCode y fallar si persisten', async () => {
    (prisma.urlEntry.findUnique as any).mockResolvedValue(null);
    
    // Simulamos que el create siempre falla con P2002 por culpa del shortCode
    (prisma.urlEntry.create as any).mockRejectedValue({
      code: 'P2002',
      meta: { target: ['shortCode'] }
    });

    (codeGenerator.generateShortCode as any)
      .mockReturnValueOnce('colis1')
      .mockReturnValueOnce('colis2')
      .mockReturnValueOnce('colis3');

    await expect(UrlService.createUrl('https://example.com/retry')).rejects.toThrow(
      'No se pudo generar un shortCode único después de 3 intentos'
    );

    expect(codeGenerator.generateShortCode).toHaveBeenCalledTimes(3);
    expect(prisma.urlEntry.create).toHaveBeenCalledTimes(3);
  });

  it('Race Condition: Debe retornar el existente si P2002 es por originalUrl (colisión concurrente)', async () => {
    // Primer findUnique no encuentra nada
    (prisma.urlEntry.findUnique as any).mockResolvedValueOnce(null);
    
    // El create falla porque otra petición ya insertó la misma originalUrl
    (prisma.urlEntry.create as any).mockRejectedValueOnce({
      code: 'P2002',
      meta: { target: ['originalUrl'] }
    });

    // El segundo findUnique (el fallback) sí lo encuentra
    const existingEntry = { id: 'uuid', shortCode: 'exist1', originalUrl: 'https://example.com/race' };
    (prisma.urlEntry.findUnique as any).mockResolvedValueOnce(existingEntry);

    const result = await UrlService.createUrl('https://example.com/race');

    expect(result.created).toBe(false);
    expect(result.entry).toEqual(existingEntry);
    expect(prisma.urlEntry.create).toHaveBeenCalledTimes(1);
  });
});
