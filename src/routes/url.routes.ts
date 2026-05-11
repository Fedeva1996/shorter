import { Router } from 'express';
import { UrlController } from '../controllers/url.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

router.post('/', optionalAuth, UrlController.createUrl);
router.get('/my-links', requireAuth, UrlController.getUserLinks);
router.post('/sync', requireAuth, UrlController.syncLinks);
router.get('/:shortCode/stats', UrlController.getStats);

export default router;