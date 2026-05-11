import { Request, Response } from 'express';
import { UrlService } from '../services/url.service.js';
import { urlSchema } from '../core/urlValidator.js';
import { AuthRequest } from '../middlewares/requireAuth.js';

export class UrlController {
  static async createUrl(req: AuthRequest, res: Response) {
    const { originalUrl } = req.body;
    const userId = req.user?.userId;
    let validatedUrl: string;
    try {
      validatedUrl = urlSchema.parse(originalUrl);
    } catch (e: any) {
      throw e; // Zod handled validation
    }

    const parsedUrl = new URL(validatedUrl);
    const appDomains = process.env.APP_DOMAIN 
      ? process.env.APP_DOMAIN.split(',').map(d => d.trim()) 
      : ['localhost:3000', 'localhost:5173'];
    
    if (appDomains.includes(parsedUrl.host)) {
      return res.status(400).json({ error: "No se permite acortar URLs del propio dominio (Bucle detectado)" });
    }

    const { entry, created } = await UrlService.createUrl(validatedUrl, userId);
    const statusCode = created ? 201 : 200;
    
    return res.status(statusCode).json({
      id: entry.id,
      shortCode: entry.shortCode,
      originalUrl: entry.originalUrl,
      createdAt: entry.createdAt
    });
  }

  static async redirect(req: Request, res: Response) {
    const shortCode = Array.isArray(req.params.shortCode)
      ? req.params.shortCode[0]
      : req.params.shortCode;

    const urlEntry = await UrlService.resolveAndIncrement(shortCode);

    if (!urlEntry) {
      return res.status(404).json({ error: 'Enlace no encontrado' });
    }

    return res.redirect(302, urlEntry.originalUrl);
  }

  static async getStats(req: Request, res: Response) {
    // Prisma returns string[] for params, so we need to handle it
    const shortCode = Array.isArray(req.params.shortCode)
      ? req.params.shortCode[0]
      : req.params.shortCode;

    const stats = await UrlService.getStats(shortCode);

    if (!stats) {
      return res.status(404).json({ error: 'Enlace no encontrado' });
    }

    return res.status(200).json(stats);
  }
}

