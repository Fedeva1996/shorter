import { describe, it, expect } from 'vitest';
import { urlSchema } from './urlValidator.js';

describe('urlValidator (Pure Core)', () => {
  it('debe validar y pasar exitosamente una URL correcta con protocolo http o https', () => {
    const validUrlHttps = 'https://example.com/very/long/path';
    const validUrlHttp = 'http://localhost:3000/test';
    
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
});
