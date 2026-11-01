import { createWorker } from 'tesseract.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TESSDATA_DIR = path.resolve(__dirname, '../../tessdata');

// Singleton worker cache
let workerInstance = null;
let currentLanguage = null;
let isInitializing = false;
let initPromise = null;

// Mutex queue to prevent concurrent recognizes on the same worker
let recognitionQueue = Promise.resolve();

/**
 * Ensures Tesseract worker is initialized and reuses it safely across requests.
 */
export const getWorker = async (language = 'kan') => {
  // If already initialized with matching language, reuse it
  if (workerInstance && currentLanguage === language) {
    return workerInstance;
  }

  // If another initialization is currently in-flight, await it
  if (isInitializing && initPromise) {
    await initPromise;
    if (workerInstance && currentLanguage === language) {
      return workerInstance;
    }
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      // Terminate previous worker if language changed
      if (workerInstance) {
        try {
          await workerInstance.terminate();
        } catch (e) {
          console.warn('Error terminating previous OCR worker:', e);
        }
        workerInstance = null;
      }

      // Check if traineddata exists locally
      const primaryLang = language.split('+')[0];
      const trainedDataGz = path.join(TESSDATA_DIR, `${primaryLang}.traineddata.gz`);
      const trainedDataRaw = path.join(TESSDATA_DIR, `${primaryLang}.traineddata`);
      const hasLocalData = fs.existsSync(trainedDataGz) || fs.existsSync(trainedDataRaw);

      const workerOptions = {
        langPath: TESSDATA_DIR,
        cachePath: TESSDATA_DIR,
        cacheMethod: hasLocalData ? 'readOnly' : 'refresh',
        gzip: true,
      };

      console.log(`[OCR] Initializing Tesseract worker for '${language}' with local tessdata...`);
      const worker = await createWorker(language, 1, workerOptions);
      workerInstance = worker;
      currentLanguage = language;
      console.log(`[OCR] Tesseract worker ready for '${language}'.`);
      return worker;
    } finally {
      isInitializing = false;
      initPromise = null;
    }
  })();

  return await initPromise;
};

/**
 * Safely executes OCR recognition using queued worker.
 */
export const extractTextFromBuffer = async (imageBuffer, options = {}) => {
  const language = options.language || 'kan';

  if (!imageBuffer || imageBuffer.length === 0) {
    const error = new Error('No image buffer provided for text extraction.');
    error.statusCode = 400;
    error.code = 'BUFFER_EMPTY';
    throw error;
  }

  // Queue recognition calls to guarantee thread-safe worker reuse
  return new Promise((resolve, reject) => {
    recognitionQueue = recognitionQueue
      .then(async () => {
        try {
          const worker = await getWorker(language);
          const startTime = Date.now();

          const result = await worker.recognize(imageBuffer);
          const durationMs = Date.now() - startTime;

          const rawText = result?.data?.text || '';
          // Clean up carriage returns while preserving genuine Kannada Unicode and line breaks
          const cleanedText = rawText.replace(/\r\n/g, '\n').trim();

          const lines = cleanedText ? cleanedText.split('\n').filter((l) => l.trim().length > 0) : [];

          resolve({
            text: cleanedText,
            language,
            detected: cleanedText.length > 0,
            durationMs,
            stats: {
              charCount: cleanedText.length,
              lineCount: lines.length,
            },
          });
        } catch (err) {
          reject(err);
        }
      })
      .catch((err) => {
        // In case previous queue job failed, don't stall the queue
        reject(err);
      });
  });
};

/**
 * Terminate worker on process exit or server shutdown.
 */
export const terminateWorker = async () => {
  if (workerInstance) {
    try {
      await workerInstance.terminate();
      workerInstance = null;
      currentLanguage = null;
    } catch (e) {
      console.warn('Error during OCR worker termination:', e);
    }
  }
};
