import { generateRecoverySuggestions } from '../services/recoveryService.js';

/**
 * Controller to handle POST /api/recovery/suggest
 * Accepts JSON body: { selectedText, context, damageNote }
 */
export const suggestRecovery = async (req, res, next) => {
  try {
    const { selectedText, context, damageNote } = req.body || {};

    const result = await generateRecoverySuggestions({
      selectedText,
      context,
      damageNote,
    });

    return res.status(200).json(result);
  } catch (error) {
    // If AI credentials are not configured, return meaningful configuration error with setup guide
    if (error.code === 'AI_NOT_CONFIGURED') {
      return res.status(error.statusCode || 503).json({
        success: false,
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: error.message,
          setupGuide: error.setupGuide,
        },
      });
    }

    // Forward other errors to centralized error handler
    next(error);
  }
};
