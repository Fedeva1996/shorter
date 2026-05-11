import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Aplicamos el rate limiter también al login/registro para prevenir ataques de fuerza bruta
router.post('/register', rateLimiter, AuthController.register);
router.post('/login', rateLimiter, AuthController.login);

export default router;
