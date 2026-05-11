import { Router } from 'express';
import { UrlController } from '../controllers/url.controller.js';
import { optionalAuth } from '../middlewares/requireAuth.js';

const router = Router();

router.post('/', optionalAuth, UrlController.createUrl);
router.get('/:shortCode/stats', UrlController.getStats);

export default router;