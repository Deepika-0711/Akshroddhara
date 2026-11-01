import Jimp from 'jimp';

export const SUPPORTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

export const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Validates document buffer and basic file constraints.
 */
export const validateDocument = (file) => {
  if (!file || !file.buffer || file.buffer.length === 0) {
    const error = new Error('No document file was provided. Please upload an image.');
    error.statusCode = 400;
    error.code = 'FILE_MISSING';
    throw error;
  }

  const mime = file.mimetype ? file.mimetype.toLowerCase() : '';
  if (!SUPPORTED_MIME_TYPES.includes(mime)) {
    const error = new Error(
      `Unsupported file format '${file.mimetype || 'unknown'}'. Please upload a PNG, JPG, JPEG, or WEBP image.`
    );
    error.statusCode = 415;
    error.code = 'UNSUPPORTED_MEDIA_TYPE';
    throw error;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const error = new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit of ${MAX_FILE_SIZE_MB} MB.`
    );
    error.statusCode = 413;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    sizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
  };
};

/**
 * Computes Otsu's optimal global binarization threshold from pixel data.
 */
export const computeOtsuThreshold = (image) => {
  const histogram = new Array(256).fill(0);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const totalPixels = width * height;

  image.scan(0, 0, width, height, (x, y, idx) => {
    const gray = image.bitmap.data[idx]; // Assumes grayscale
    histogram[gray]++;
  });

  let sum = 0;
  for (let t = 0; t < 256; t++) {
    sum += t * histogram[t];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let bestThresholds = [];

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varianceBetween = wB * wF * (mB - mF) * (mB - mF);

    if (varianceBetween > maxVariance) {
      maxVariance = varianceBetween;
      bestThresholds = [t];
    } else if (varianceBetween === maxVariance && maxVariance > 0) {
      bestThresholds.push(t);
    }
  }

  // If there is a flat plateau (common between two distant peaks), take the midpoint
  if (bestThresholds.length > 0) {
    const midIndex = Math.floor(bestThresholds.length / 2);
    return bestThresholds[midIndex];
  }

  return 128;
};

/**
 * Applies Bradley-Roth local adaptive thresholding using integral image.
 * Superior for uneven illumination in palm leaves and weathered stone rubbings.
 */
export const applyLocalAdaptiveThreshold = (image, windowFraction = 0.125, sensitivityPercent = 15) => {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const data = image.bitmap.data;

  // 1. Build integral image for fast local area sums
  const integral = new Float64Array(width * height);

  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = data[idx];
      rowSum += gray;
      if (y === 0) {
        integral[y * width + x] = rowSum;
      } else {
        integral[y * width + x] = integral[(y - 1) * width + x] + rowSum;
      }
    }
  }

  const s = Math.max(3, Math.floor(width * windowFraction));
  const s2 = Math.floor(s / 2);
  const factor = 1 - sensitivityPercent / 100;

  // 2. Perform local thresholding
  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - s2);
    const y2 = Math.min(height - 1, y + s2);

    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - s2);
      const x2 = Math.min(width - 1, x + s2);

      const count = (x2 - x1 + 1) * (y2 - y1 + 1);

      let sumRegion = integral[y2 * width + x2];
      if (x1 > 0) sumRegion -= integral[y2 * width + (x1 - 1)];
      if (y1 > 0) sumRegion -= integral[(y1 - 1) * width + x2];
      if (x1 > 0 && y1 > 0) sumRegion += integral[(y1 - 1) * width + (x1 - 1)];

      const localMean = sumRegion / count;
      const idx = (y * width + x) * 4;
      const pixelVal = data[idx];

      const binaryVal = pixelVal <= localMean * factor ? 0 : 255;
      data[idx] = binaryVal;
      data[idx + 1] = binaryVal;
      data[idx + 2] = binaryVal;
    }
  }
};

/**
 * Applies unsharp mask convolution kernel to sharpen eroded character edges.
 */
export const applySharpenKernel = (image, strength = 1.0) => {
  // 3x3 convolution matrix
  const center = 1 + 4 * (0.5 * strength);
  const edge = -0.5 * strength;
  const kernel = [
    [0, edge, 0],
    [edge, center, edge],
    [0, edge, 0],
  ];
  image.convolute(kernel);
};

/**
 * Main Image Processing Engine.
 * Takes in an image buffer, validates it, applies real mathematical transformations,
 * and outputs the enhanced image buffer and metadata.
 */
export const enhanceDocumentImage = async (fileBuffer, options = {}) => {
  const {
    preset = 'balanced',
    contrast = 0.35,      // -1 to 1
    brightness = 0.05,    // -1 to 1
    denoise = true,       // boolean
    sharpen = true,       // boolean
    binarizeMode = 'none', // 'none' | 'otsu' | 'adaptive'
    adaptiveSensitivity = 14,
  } = options;

  const startTime = Date.now();
  const operationsApplied = [];

  // Read image directly into memory using Jimp
  let image;
  try {
    image = await Jimp.read(fileBuffer);
  } catch (err) {
    const error = new Error('Failed to decode image data. The file may be corrupted.');
    error.statusCode = 422;
    error.code = 'IMAGE_DECODE_ERROR';
    throw error;
  }

  const originalWidth = image.bitmap.width;
  const originalHeight = image.bitmap.height;

  // 1. Grayscale conversion: eliminates color aging/paper yellowing/stains
  image.grayscale();
  operationsApplied.push('grayscale_conversion');

  // Handle Preset configurations
  let effectiveContrast = contrast;
  let effectiveBrightness = brightness;
  let effectiveDenoise = denoise;
  let effectiveSharpen = sharpen;
  let effectiveBinarize = binarizeMode;
  let effectiveSensitivity = adaptiveSensitivity;

  if (preset === 'palm-leaf') {
    // Palm leaves have dark brownish backgrounds and incised letters
    effectiveContrast = 0.55;
    effectiveBrightness = 0.15;
    effectiveDenoise = true;
    effectiveSharpen = true;
    effectiveBinarize = 'adaptive';
    effectiveSensitivity = 16;
  } else if (preset === 'stone-rubbing') {
    // Stone inscription paper estampage (inked rubbings)
    effectiveContrast = 0.65;
    effectiveBrightness = -0.05;
    effectiveDenoise = false;
    effectiveSharpen = true;
    effectiveBinarize = 'otsu';
  } else if (preset === 'faded-ink') {
    // Faded ink on old paper
    effectiveContrast = 0.45;
    effectiveBrightness = 0.08;
    effectiveDenoise = true;
    effectiveSharpen = true;
    effectiveBinarize = 'adaptive';
    effectiveSensitivity = 12;
  } else if (preset === 'high-contrast') {
    // High contrast enhancement without bi-level binarization
    effectiveContrast = 0.5;
    effectiveBrightness = 0.05;
    effectiveDenoise = true;
    effectiveSharpen = true;
    effectiveBinarize = 'none';
  }

  // 2. Noise Reduction: smooth grain and surface irregularities
  if (effectiveDenoise) {
    // Light Gaussian blur to eliminate speckle noise
    image.gaussian(1);
    operationsApplied.push('gaussian_denoise');
  }

  // 3. Contrast & Brightness Adjustment
  if (effectiveContrast !== 0) {
    image.contrast(Math.max(-1, Math.min(1, effectiveContrast)));
    operationsApplied.push(`contrast_adjustment_${effectiveContrast}`);
  }

  if (effectiveBrightness !== 0) {
    image.brightness(Math.max(-1, Math.min(1, effectiveBrightness)));
    operationsApplied.push(`brightness_adjustment_${effectiveBrightness}`);
  }

  // 4. Edge Sharpening (Unsharp Mask)
  if (effectiveSharpen && effectiveBinarize === 'none') {
    applySharpenKernel(image, 1.2);
    operationsApplied.push('edge_sharpening_convolution');
  }

  // 5. Thresholding / Binarization (if requested or by preset)
  if (effectiveBinarize === 'otsu') {
    const otsuThresh = computeOtsuThreshold(image);
    image.scan(0, 0, originalWidth, originalHeight, (x, y, idx) => {
      const v = image.bitmap.data[idx] <= otsuThresh ? 0 : 255;
      image.bitmap.data[idx] = v;
      image.bitmap.data[idx + 1] = v;
      image.bitmap.data[idx + 2] = v;
    });
    operationsApplied.push(`otsu_binarization_thresh_${otsuThresh}`);
  } else if (effectiveBinarize === 'adaptive') {
    applyLocalAdaptiveThreshold(image, 0.12, effectiveSensitivity);
    operationsApplied.push(`local_adaptive_threshold_sens_${effectiveSensitivity}`);
  }

  // Export processed image to PNG buffer in-memory
  const enhancedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
  const processingTimeMs = Date.now() - startTime;

  return {
    enhancedBuffer,
    base64DataUri: `data:image/png;base64,${enhancedBuffer.toString('base64')}`,
    format: 'image/png',
    dimensions: {
      width: originalWidth,
      height: originalHeight,
    },
    processingTimeMs,
    operationsApplied,
    presetUsed: preset,
  };
};

/**
 * Return enhancement pipeline specifications supported by Aksharoddhaara.
 */
export const getEnhancementPresets = () => {
  return [
    {
      id: 'balanced',
      name: 'Balanced Restoration / ಸಮತೋಲಿತ ಸುಧಾರಣೆ',
      description: 'Grayscale normalization, contrast dynamic stretching, and edge sharpening for aged paper.',
      recommendedFor: 'General faded documents, old textbooks, and manuscripts.',
    },
    {
      id: 'palm-leaf',
      name: 'Palm-Leaf / ತಾಳೆಗರಿ Manuscript Mode',
      description: 'Local adaptive thresholding tuned for uneven illumination and brown background suppression on palm-leaf folios.',
      recommendedFor: 'Tale-gari (palm leaf) manuscripts with stylus incisions.',
    },
    {
      id: 'stone-rubbing',
      name: 'Stone Inscription / ಶಿಲಾಶಾಸನ Estampage Mode',
      description: 'Otsu binarization and surface texture attenuation for paper ink impressions of stone inscriptions.',
      recommendedFor: 'Epigraphical rubbings and high-contrast ink imprints.',
    },
    {
      id: 'faded-ink',
      name: 'Faded Ink Recovery / ಅಳಿಸಿಹೋದ ಶಾಯಿ ಪುನಶ್ಚೇತನ',
      description: 'High-sensitivity adaptive thresholding to bring out faint, water-damaged, or iron-gall ink strokes.',
      recommendedFor: 'Water-stained or heavily faded historical letters.',
    },
    {
      id: 'high-contrast',
      name: 'High-Contrast Grayscale / ತೀಕ್ಷ್ಣ ಕಪ್ಪು-ಬಿಳುಪು',
      description: 'Smooth grayscale contrast expansion preserving tonal gradients without bi-level binarization.',
      recommendedFor: 'Photographs of carvings, inscriptions with subtle lighting.',
    },
  ];
};
