import { Request, Response } from 'express';
import { UrlService } from '../services/url.service.js';
import { urlSchema } from '../core/urlValidator.js';

export class UrlController {
  static async createUrl(req: Request, res: Response) {
    const { originalUrl } = req.body;
    const validatedUrl = urlSchema.parse(originalUrl);

    const { entry, created } = await UrlService.createUrl(validatedUrl);
    const statusCode = created ? 201 : 200;
    return res.status(statusCode).json(entry);
  }

  static async redirect(req: Request, res: Response) {
    const { shortCode } = req.params;
    const urlEntry = await UrlService.resolveAndIncrement(shortCode);
    
    if (!urlEntry) {
      return res.status(404).json({ error: 'Enlace no encontrado' });
    }
    
    return res.redirect(302, urlEntry.originalUrl);
  }

  static async getStats(req: Request, res: Response) {
    const { shortCode } = req.params;
    const stats = await UrlService.getStats(shortCode);

    if (!stats) {
      return res.status(404).json({ error: 'Enlace no encontrado' });
    }

    return res.status(200).json(stats);
  }
}

