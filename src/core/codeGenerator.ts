import { randomBytes } from 'crypto';

const BASE62_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Genera un código alfanumérico aleatorio (Base62) de longitud especificada.
 * @param length La longitud del código a generar (por defecto 6).
 * @returns Un string alfanumérico.
 */
export function generateShortCode(length: number = 6): string {
  let result = '';
  // Se generan bytes suficientes. Para evitar sesgo de módulo se podría usar un algoritmo más complejo,
  // pero para un generador rápido base62 de 6 chars esto es suficiente y criptográficamente aleatorio.
  const bytes = randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += BASE62_ALPHABET[bytes[i] % 62];
  }
  
  return result;
}