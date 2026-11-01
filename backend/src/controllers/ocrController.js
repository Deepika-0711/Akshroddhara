import { validateDocument } from '../services/imageEnhanceService.js';
import { extractTextFromBuffer } from '../services/ocrService.js';

/**
 * Controller to handle POST /api/ocr
 * Accepts multipart/form-data with file field 'image' or 'document'.
 */
export const runOcr = async (req, res, next) => {
  try {
    const file = req.file;

    // 1. Validate file existence, supported MIME type, and 10MB size limit
    const fileMetadata = validateDocument(file);

    // 2. Determine target language (default 'kan', allow 'kan+eng' or 'eng')
    const requestedLanguage = req.body.language || req.query.language || 'kan';
    const language = ['kan', 'eng', 'kan+eng'].includes(requestedLanguage)
      ? requestedLanguage
      : 'kan';

    // 3. Run real OCR in-memory
    const ocrResult = await extractTextFromBuffer(file.buffer, { language });

    // 4. Craft response
    const hasText = ocrResult.text.length > 0;
    const message = hasText
      ? 'ಕನ್ನಡ ಪಠ್ಯವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಹೊರತೆಗೆಯಲಾಗಿದೆ (Text successfully extracted).'
      : 'ಚಿತ್ರದಲ್ಲಿ ಯಾವುದೇ ಸ್ಪಷ್ಟ ಪಠ್ಯ ಪತ್ತೆಯಾಗಿಲ್ಲ (No visible text was detected in the document).';

    return res.status(200).json({
      success: true,
      text: ocrResult.text,
      language: ocrResult.language,
      detected: ocrResult.detected,
      message,
      data: {
        text: ocrResult.text,
        language: ocrResult.language,
        detected: ocrResult.detected,
        durationMs: ocrResult.durationMs,
        stats: ocrResult.stats,
        originalDocument: {
          originalName: fileMetadata.originalName,
          mimeType: fileMetadata.mimeType,
          sizeMB: fileMetadata.sizeMB,
        },
      },
    });
  } catch (error) {
    // Centralized error handler sanitizes stack traces and internal paths
    next(error);
  }
};
