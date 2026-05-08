import { describe, it, expect } from 'vitest';
import { urlSchema } from './urlValidator.js';

describe('urlValidator (Pure Core)', () => {
  it('debe validar y pasar exitosamente una URL correcta con protocolo http o https', () => {
    const validUrlHttps = 'https://example.com/very/long/path';
    const validUrlHttp = 'http://some-other-domain.com/test';
    
    expect(() => urlSchema.parse(validUrlHttps)).not.toThrow();
    expect(() => urlSchema.parse(validUrlHttp)).not.toThrow();
  });

  it('debe fallar si la originalUrl no incluye http:// o https://, o es inválida (EC-01)', () => {
    const invalidFormat = 'not_a_url';
    const wrongProtocol = 'ftp://example.com';
    const noProtocol = 'example.com/test';

    expect(() => urlSchema.parse(invalidFormat)).toThrow();
    expect(() => urlSchema.parse(wrongProtocol)).toThrow();
    expect(() => urlSchema.parse(noProtocol)).toThrow();
  });

  it('debe fallar si la originalUrl excede los 2048 caracteres (EC-02)', () => {
    const veryLongUrl = 'https://example.com/' + 'a'.repeat(2048);
    expect(() => urlSchema.parse(veryLongUrl)).toThrow();
  });

  it('debe fallar si la originalUrl pertenece al propio dominio de la aplicación para evitar bucles (RN-03)', () => {
    // Simulamos el dominio base de la aplicación (por defecto localhost:3000 o localhost:5173 en dev)
    const loopUrl1 = 'http://localhost:3000/aB3x9Z';
    const loopUrl2 = 'http://localhost:5173/aB3x9Z';
    
    // Esto asegura que la config cargue una variable APP_DOMAIN o similar si es requerida en la impl.
    process.env.APP_DOMAIN = 'localhost:3000,localhost:5173';
    
    expect(() => urlSchema.parse(loopUrl1)).toThrow(/bucle/i);
    expect(() => urlSchema.parse(loopUrl2)).toThrow(/bucle/i);
    
    // Un dominio que contiene localhost pero no es exactamente debe pasar
    const safeUrl = 'http://notlocalhost:3000/test';
    expect(() => urlSchema.parse(safeUrl)).not.toThrow();
  });
});
