import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'URL inválida o muy larga',
      details: err.issues,
    });
  }

  console.error(err);
  return res.status(500).json({
    error: err.message || 'Error interno del servidor',
  });
};
