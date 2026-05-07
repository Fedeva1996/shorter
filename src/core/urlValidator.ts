import { z } from 'zod';

export const urlSchema = z.string().url().max(2048).refine((url) => {
  return url.startsWith('http://') || url.startsWith('https://');
}, {
  message: "La URL debe comenzar con http:// o https://"
});