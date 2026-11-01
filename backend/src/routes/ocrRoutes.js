import { Router } from 'express';
import { runOcr } from '../controllers/ocrController.js';
import { flexibleUpload } from './documentRoutes.js';

const router = Router();

// POST /api/ocr
router.post('/', flexibleUpload, runOcr);

export default router;
