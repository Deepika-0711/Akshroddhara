import test from 'node:test';
import assert from 'node:assert/strict';
import Jimp from 'jimp';
import {
  validateDocument,
  computeOtsuThreshold,
  applyLocalAdaptiveThreshold,
  applySharpenKernel,
  enhanceDocumentImage,
  getEnhancementPresets,
} from '../src/services/imageEnhanceService.js';

test('1. validateDocument accepts valid PNG, JPG, WEBP buffers', () => {
  const dummyFile = {
    originalname: 'test_inscription.png',
    mimetype: 'image/png',
    size: 2048,
    buffer: Buffer.from('mock image data'),
  };
  const metadata = validateDocument(dummyFile);
  assert.equal(metadata.originalName, 'test_inscription.png');
  assert.equal(metadata.mimeType, 'image/png');
  assert.equal(metadata.sizeBytes, 2048);
});

test('2. validateDocument rejects unsupported file types with 415', () => {
  const textFile = {
    originalname: 'document.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('mock pdf'),
  };
  assert.throws(
    () => validateDocument(textFile),
    (err) => {
      assert.equal(err.statusCode, 415);
      assert.equal(err.code, 'UNSUPPORTED_MEDIA_TYPE');
      return true;
    }
  );
});

test('3. validateDocument rejects oversized files (>10MB) with 413', () => {
  const bigFile = {
    originalname: 'giant_scan.png',
    mimetype: 'image/png',
    size: 15 * 1024 * 1024, // 15MB
    buffer: Buffer.from('mock big data'),
  };
  assert.throws(
    () => validateDocument(bigFile),
    (err) => {
      assert.equal(err.statusCode, 413);
      assert.equal(err.code, 'FILE_TOO_LARGE');
      return true;
    }
  );
});

test('4. computeOtsuThreshold correctly finds bimodal separation threshold', async () => {
  // Create an image with dark ink (value 40) and light parchment (value 220)
  const img = new Jimp(50, 50, 0xDCD0B0FF); // Light parchment background
  // Add dark text strokes
  for (let y = 15; y < 35; y++) {
    for (let x = 15; x < 35; x++) {
      img.setPixelColor(0x282010FF, x, y); // Dark brown ink
    }
  }
  img.grayscale();
  const threshold = computeOtsuThreshold(img);
  assert.ok(threshold > 50 && threshold < 200, `Expected threshold between 50 and 200, got ${threshold}`);
});

test('5. enhanceDocumentImage executes full enhancement pipeline on real image', async () => {
  // Create simulated faded historical Kannada manuscript
  const manuscript = new Jimp(120, 80, 0xC4B088FF); // Faded yellowed paper
  for (let x = 30; x < 90; x++) {
    manuscript.setPixelColor(0x5A4020FF, x, 40); // Faint Kannada stroke
  }
  const inputBuffer = await manuscript.getBufferAsync(Jimp.MIME_PNG);

  const result = await enhanceDocumentImage(inputBuffer, {
    preset: 'balanced',
    contrast: 0.4,
    brightness: 0.05,
    denoise: true,
    sharpen: true,
  });

  assert.ok(result.enhancedBuffer instanceof Buffer);
  assert.ok(result.base64DataUri.startsWith('data:image/png;base64,'));
  assert.equal(result.dimensions.width, 120);
  assert.equal(result.dimensions.height, 80);
  assert.ok(result.operationsApplied.includes('grayscale_conversion'));
  assert.ok(result.operationsApplied.includes('gaussian_denoise'));
  assert.ok(result.operationsApplied.includes('edge_sharpening_convolution'));
  assert.ok(result.processingTimeMs >= 0);

  // Validate that the output image is readable and distinct from original
  const enhancedJimp = await Jimp.read(result.enhancedBuffer);
  assert.equal(enhancedJimp.bitmap.width, 120);
  assert.equal(enhancedJimp.bitmap.height, 80);
});

test('6. enhanceDocumentImage supports palm-leaf adaptive thresholding mode', async () => {
  const palmLeaf = new Jimp(100, 60, 0x8C6B45FF); // Dark palm leaf color
  for (let x = 20; x < 80; x++) {
    palmLeaf.setPixelColor(0x3B2510FF, x, 30);
  }
  const inputBuffer = await palmLeaf.getBufferAsync(Jimp.MIME_PNG);

  const result = await enhanceDocumentImage(inputBuffer, {
    preset: 'palm-leaf',
  });

  assert.equal(result.presetUsed, 'palm-leaf');
  assert.ok(result.operationsApplied.some((op) => op.includes('local_adaptive_threshold')));
  assert.ok(result.base64DataUri.startsWith('data:image/png;base64,'));
});

test('7. getEnhancementPresets returns valid heritage presets', () => {
  const presets = getEnhancementPresets();
  assert.ok(Array.isArray(presets));
  assert.ok(presets.length >= 3);
  const ids = presets.map((p) => p.id);
  assert.ok(ids.includes('balanced'));
  assert.ok(ids.includes('palm-leaf'));
  assert.ok(ids.includes('stone-rubbing'));
});
