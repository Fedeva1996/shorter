import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import urlRoutes from './routes/url.routes.js';
import { UrlController } from './controllers/url.controller.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { rateLimiter } from './middlewares/rateLimiter.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiter aplicado solo al grupo de rutas de creación (EC-06)
app.use('/api/v1/urls', rateLimiter, urlRoutes);
app.get('/:shortCode', UrlController.redirect);

// Middleware global de manejo de errores
app.use(errorHandler);
