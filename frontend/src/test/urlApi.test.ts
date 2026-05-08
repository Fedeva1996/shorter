import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShortUrl } from '../api/urlApi'; // No existe aún — RED

// Mock the global fetch API
global.fetch = vi.fn();

describe('urlApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createShortUrl llama a fetch con los parámetros correctos', async () => {
    const mockResponse = {
      id: '123',
      originalUrl: 'https://example.com/test',
      shortCode: 'aB3x9Z',
      clicks: 0,
      createdAt: new Date().toISOString(),
      lastClickedAt: null,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createShortUrl('https://example.com/test');

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/urls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ originalUrl: 'https://example.com/test' }),
    });
    expect(result).toEqual(mockResponse);
  });

  it('createShortUrl lanza un error cuando la respuesta no es ok', async () => {
    const errorResponse = {
      error: 'URL inválida o muy larga',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => errorResponse,
    });

    await expect(createShortUrl('no-es-una-url')).rejects.toThrow('URL inválida o muy larga');
  });

  it('createShortUrl lanza un error genérico si el backend falla sin un cuerpo JSON descriptivo', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new Error('No JSON'); },
      statusText: 'Internal Server Error',
    });

    await expect(createShortUrl('https://example.com')).rejects.toThrow('Error al crear la URL acortada');
  });
});
