import { Request, Response, NextFunction } from 'express';
import { AuthService, authSchema } from '../services/auth.service.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedData = authSchema.parse(req.body);
      const result = await AuthService.register(parsedData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'El email ya está registrado') {
        res.status(409).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedData = authSchema.parse(req.body);
      const result = await AuthService.login(parsedData);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Credenciales inválidas') {
        res.status(401).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}
