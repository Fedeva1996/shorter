import { Router } from 'express';
import { UrlController } from '../controllers/url.controller.js';

const router = Router();

router.post('/', UrlController.createUrl);
router.get('/:shortCode/stats', UrlController.getStats);

export default router;