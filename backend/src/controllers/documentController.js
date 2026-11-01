import {
  validateDocument,
  enhanceDocumentImage,
  getEnhancementPresets,
} from '../services/imageEnhanceService.js';

/**
 * Controller to handle POST /api/enhance
 * Accepts multipart/form-data with file field 'image' or 'document'.
 */
export const enhanceDocument = async (req, res, next) => {
  try {
    const file = req.file;

    // 1. Validation (MIME type, size limit, existence)
    const fileMetadata = validateDocument(file);

    // 2. Parse options from request body (e.g. preset, contrast, brightness, binarizeMode)
    const options = {
      preset: req.body.preset || 'balanced',
      contrast: req.body.contrast ? parseFloat(req.body.contrast) : undefined,
      brightness: req.body.brightness ? parseFloat(req.body.brightness) : undefined,
      denoise: req.body.denoise !== undefined ? req.body.denoise === 'true' || req.body.denoise === true : undefined,
      sharpen: req.body.sharpen !== undefined ? req.body.sharpen === 'true' || req.body.sharpen === true : undefined,
      binarizeMode: req.body.binarizeMode || undefined,
      adaptiveSensitivity: req.body.adaptiveSensitivity ? parseInt(req.body.adaptiveSensitivity, 10) : undefined,
    };

    // 3. Process image in-memory with real image processing
    const enhancementResult = await enhanceDocumentImage(file.buffer, options);

    // 4. Return response
    // If client requested raw binary output (e.g. Accept: image/png or query format=binary)
    if (req.query.format === 'binary' || req.headers.accept === 'image/png') {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="enhanced_${fileMetadata.originalName}"`);
      return res.status(200).send(enhancementResult.enhancedBuffer);
    }

    // Default: structured JSON response with base64 data URI and metadata
    return res.status(200).json({
      success: true,
      message: 'Document successfully enhanced for improved readability.',
      data: {
        enhancedImage: enhancementResult.base64DataUri,
        format: enhancementResult.format,
        dimensions: enhancementResult.dimensions,
        processingTimeMs: enhancementResult.processingTimeMs,
        operationsApplied: enhancementResult.operationsApplied,
        presetUsed: enhancementResult.presetUsed,
        originalDocument: fileMetadata,
      },
    });
  } catch (error) {
    // Pass to centralized error handler without exposing internal details
    next(error);
  }
};

/**
 * Controller to handle document validation and metadata in-memory.
 */
export const inspectDocument = (req, res, next) => {
  try {
    const metadata = validateDocument(req.file);

    res.status(200).json({
      success: true,
      data: {
        document: metadata,
        message: 'Document successfully received and verified in-memory.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get available enhancement presets.
 */
export const getPresets = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      presets: getEnhancementPresets(),
    },
  });
};
