import { z } from 'zod';

export const urlSchema = z.string().url().max(2048)
  .refine((url) => {
    return url.startsWith('http://') || url.startsWith('https://');
  }, {
    message: "La URL debe comenzar con http:// o https://"
  })
  .refine((url) => {
    try {
      const parsedUrl = new URL(url);
      const appDomains = process.env.APP_DOMAIN 
        ? process.env.APP_DOMAIN.split(',').map(d => d.trim()) 
        : ['localhost:3000', 'localhost:5173'];
      
      return !appDomains.includes(parsedUrl.host);
    } catch {
      return false;
    }
  }, {
    message: "No se permite acortar URLs del propio dominio (Bucle detectado)"
  });