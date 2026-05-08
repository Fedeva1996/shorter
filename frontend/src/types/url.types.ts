/**
 * Interfaces TypeScript compartidas — Shorty URL Shortener
 * Fuente de verdad: SPEC.md §3.2
 */

/** Modelo completo de una entrada de URL acortada */
export interface UrlEntry {
  id: string;              // UUID v4
  originalUrl: string;     // URL completa válida
  shortCode: string;       // Código de 6 caracteres (ej. aB3x9Z)
  clicks: number;          // Contador de clics
  createdAt: string;       // ISO 8601
  lastClickedAt: string | null; // ISO 8601, null si nunca se ha hecho click
}

/** Respuesta de POST /api/v1/urls → 201 Created o 200 OK (idempotente) */
export type CreateUrlResponse = UrlEntry;

/** Respuesta de GET /api/v1/urls/{shortCode}/stats → 200 OK */
export type UrlStatsResponse = Omit<UrlEntry, 'id'>;

/** Respuesta de error genérica de la API */
export interface ApiErrorResponse {
  error: string;
}
