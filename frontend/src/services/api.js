/**
 * Frontend API service for Aksharoddhaara
 */

const API_BASE = '/api';
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
export const SUPPORTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/**
 * Validates file on client side before upload.
 */
export const validateFileClient = (file) => {
  if (!file) {
    return { valid: false, error: 'ದಯವಿಟ್ಟು ಚಿತ್ರದ ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Please select an image file).' };
  }

  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime = SUPPORTED_MIME_TYPES.includes(mime);

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `ಬೆಂಬಲವಿಲ್ಲದ ಕಡತ ಮಾದರಿ (${file.type || 'unknown'}). ದಯವಿಟ್ಟು PNG, JPG, JPEG, ಅಥವಾ WEBP ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Unsupported file format. Please upload PNG, JPG, JPEG, or WEBP).`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `ಕಡತದ ಗಾತ್ರವು (${sizeMB} MB) ನಿಗದಿತ ಮಿತಿಯಾದ ${MAX_FILE_SIZE_MB} MB ಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ (File size exceeds the ${MAX_FILE_SIZE_MB} MB limit).`,
    };
  }

  return { valid: true };
};

/**
 * Check backend health
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      throw new Error(`Health check returned status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend health check error:', error);
    return { status: 'offline', error: error.message };
  }
};

/**
 * Fetch available enhancement presets from backend
 */
export const fetchPresets = async () => {
  try {
    const response = await fetch(`${API_BASE}/documents/presets`);
    if (response.ok) {
      const data = await response.json();
      return data.data?.presets || [];
    }
  } catch (error) {
    console.warn('Could not fetch presets from backend:', error);
  }
  return [];
};

/**
 * Send image to backend for enhancement
 */
export const enhanceDocumentApi = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('image', file);

  if (options.preset) formData.append('preset', options.preset);
  if (options.contrast !== undefined) formData.append('contrast', options.contrast);
  if (options.brightness !== undefined) formData.append('brightness', options.brightness);
  if (options.denoise !== undefined) formData.append('denoise', options.denoise);
  if (options.sharpen !== undefined) formData.append('sharpen', options.sharpen);
  if (options.binarizeMode) formData.append('binarizeMode', options.binarizeMode);
  if (options.adaptiveSensitivity) formData.append('adaptiveSensitivity', options.adaptiveSensitivity);

  const response = await fetch(`${API_BASE}/enhance`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || `ಚಿತ್ರ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ (Server error: ${response.status})`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.code = data?.error?.code;
    throw error;
  }

  return data.data;
};

/**
 * Send image to backend for Kannada OCR text extraction
 */
export const extractOcrApi = async (fileOrBlob, options = {}) => {
  const formData = new FormData();
  formData.append('image', fileOrBlob);

  if (options.language) {
    formData.append('language', options.language);
  }

  const response = await fetch(`${API_BASE}/ocr`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.error?.message ||
      `ಕನ್ನಡ ಅಕ್ಷರ ಗುರುತಿಸುವಿಕೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ (OCR processing failed: ${response.status})`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.code = data?.error?.code;
    throw error;
  }

  return {
    success: data.success,
    text: data.text || '',
    language: data.language || 'kan',
    detected: data.detected ?? (data.text?.length > 0),
    message: data.message,
    stats: data.data?.stats,
    durationMs: data.data?.durationMs,
  };
};

/**
 * Request AI-assisted text recovery suggestions for user-selected unclear Kannada text
 */
export const suggestRecoveryApi = async ({ selectedText, context = '', damageNote = '' }) => {
  const response = await fetch(`${API_BASE}/recovery/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedText, context, damageNote }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data?.error?.message ||
        `ಮರುಪಡೆಯುವಿಕೆ ಸಲಹೆ ಪಡೆಯುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ (Recovery request failed: ${response.status})`
    );
    error.statusCode = response.status;
    error.code = data?.error?.code;
    error.setupGuide = data?.error?.setupGuide;
    throw error;
  }

  return data;
};
