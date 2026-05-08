import rateLimit, { type Options } from 'express-rate-limit';

/**
 * Fábrica de rate limiters configurable.
 * Permite crear instancias con parámetros distintos en producción y en tests.
 * El handler retorna siempre JSON { error } para satisfacer la interfaz de la API.
 */
export const createRateLimiter = (options?: Partial<Options>) =>
  rateLimit({
    windowMs: 15 * 60 * 1_000, // 15 minutos por defecto
    max: 20,                    // 20 requests por ventana por defecto
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: 'Too Many Requests' });
    },
    ...options,
  });

/** Instancia de producción — se conecta en app.ts */
export const rateLimiter = createRateLimiter();
