import { Request, Response } from 'express';
import { UrlService } from '../services/url.service.js';
import { urlSchema } from '../core/urlValidator.js';

export class UrlController {
  static async createUrl(req: Request, res: Response) {
    try {
      const { originalUrl } = req.body;
      const validatedUrl = urlSchema.parse(originalUrl);
      
      const urlEntry = await UrlService.createUrl(validatedUrl);
      return res.status(201).json(urlEntry);
    } catch (error: any) {
      if (error.name === 'ZodError') {
         return res.status(400).json({ error: 'URL inválida o muy larga', details: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
