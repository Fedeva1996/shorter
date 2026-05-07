import { describe, it, expect } from 'vitest';
import { generateShortCode } from './codeGenerator.js';

describe('codeGenerator (Pure Core)', () => {
  it('debe retornar un string de exactamente 6 caracteres (RN-01)', () => {
    const code = generateShortCode();
    expect(code.length).toBe(6);
  });

  it('debe contener únicamente caracteres alfanuméricos (a-z, A-Z, 0-9)', () => {
    const code = generateShortCode();
    const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(code);
    expect(isAlphanumeric).toBe(true);
  });

  it('debe generar códigos razonablemente aleatorios y únicos', () => {
    const code1 = generateShortCode();
    const code2 = generateShortCode();
    expect(code1).not.toBe(code2);
  });
});
