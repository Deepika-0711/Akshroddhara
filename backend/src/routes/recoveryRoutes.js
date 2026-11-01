import { Router } from 'express';
import { suggestRecovery } from '../controllers/recoveryController.js';

const router = Router();

// POST /api/recovery/suggest
router.post('/suggest', suggestRecovery);

export default router;
