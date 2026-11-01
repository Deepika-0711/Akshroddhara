import { Router } from 'express';
import multer from 'multer';
import {
  enhanceDocument,
  inspectDocument,
  getPresets,
} from '../controllers/documentController.js';
import { MAX_FILE_SIZE_BYTES } from '../services/imageEnhanceService.js';

const router = Router();

// Configure multer with memory storage (no permanent disk/database persistence)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 1 },
]);

const flexibleUpload = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const customErr = new Error(
          `File size exceeds the maximum limit of ${process.env.MAX_FILE_SIZE_MB || 10} MB.`
        );
        customErr.statusCode = 413;
        customErr.code = 'FILE_TOO_LARGE';
        return next(customErr);
      }
      return next(err);
    }

    // Normalize req.file from either 'image' or 'document'
    if (req.files) {
      req.file = req.files['image']?.[0] || req.files['document']?.[0] || null;
    }
    next();
  });
};

// GET /api/documents/presets and GET /api/presets
router.get('/presets', getPresets);

// POST /api/documents/enhance
router.post('/enhance', flexibleUpload, enhanceDocument);

// POST /api/documents/inspect (In-memory validation)
router.post('/inspect', flexibleUpload, inspectDocument);

export { flexibleUpload };
export default router;
