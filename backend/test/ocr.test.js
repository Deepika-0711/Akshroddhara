import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../src/app.js';
import { terminateWorker } from '../src/services/ocrService.js';
import { enhanceDocumentImage } from '../src/services/imageEnhanceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, 'fixtures');

let server;
let baseUrl;

test.before(async () => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`OCR Test server running on ${baseUrl}`);
      resolve();
    });
  });
});

test.after(async () => {
  await terminateWorker();
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
});

// Helper for HTTP requests
const makeRequest = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = request.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = null;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json,
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
};

const sendFileToOcr = async (fileBuffer, filename = 'test.png', mimeType = 'image/png', extraFields = {}) => {
  const boundary = '----WebKitFormBoundaryOcrTest' + Math.random().toString(36).substring(2);
  const parts = [];

  for (const [key, val] of Object.entries(extraFields)) {
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`
    );
  }

  const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(parts.join(''), 'utf-8'),
    Buffer.from(fileHeader, 'utf-8'),
    fileBuffer,
    Buffer.from(footer, 'utf-8'),
  ]);

  return await makeRequest('/api/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': bodyBuffer.length,
    },
    body: bodyBuffer,
  });
};

test('1. POST /api/ocr processes clear Kannada printed-text image', async () => {
  const imgPath = path.join(fixturesDir, 'clear_kannada.png');
  const buffer = fs.readFileSync(imgPath);

  const res = await sendFileToOcr(buffer, 'clear_kannada.png', 'image/png');

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.equal(res.json.language, 'kan');
  assert.equal(typeof res.json.text, 'string');
  assert.ok(res.json.text.length > 0, 'Expected detected text from clear Kannada image');
  assert.equal(res.json.detected, true);
  console.log('   -> Extracted Kannada text snippet:', JSON.stringify(res.json.text.slice(0, 40)));
});

test('2. POST /api/ocr processes enhanced Kannada document image', async () => {
  const imgPath = path.join(fixturesDir, 'clear_kannada.png');
  const rawBuffer = fs.readFileSync(imgPath);

  // Run enhancement first (as produced by our image enhancement feature)
  const enhancement = await enhanceDocumentImage(rawBuffer, { preset: 'balanced' });
  assert.ok(enhancement.enhancedBuffer);

  const res = await sendFileToOcr(enhancement.enhancedBuffer, 'enhanced_kannada.png', 'image/png');

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.equal(typeof res.json.text, 'string');
  assert.ok(res.json.text.length > 0);
  console.log('   -> OCR on Enhanced image extracted text snippet:', JSON.stringify(res.json.text.slice(0, 40)));
});

test('3. POST /api/ocr processes English text image with language parameter', async () => {
  const imgPath = path.join(fixturesDir, 'english_text.png');
  const buffer = fs.readFileSync(imgPath);

  const res = await sendFileToOcr(buffer, 'english_text.png', 'image/png', { language: 'eng' });

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.equal(res.json.language, 'eng');
  assert.ok(res.json.text.length > 0);
  console.log('   -> Extracted English text:', JSON.stringify(res.json.text));
});

test('4. POST /api/ocr on image with no detectable text returns empty string and detected=false', async () => {
  const imgPath = path.join(fixturesDir, 'blank_image.png');
  const buffer = fs.readFileSync(imgPath);

  const res = await sendFileToOcr(buffer, 'blank_image.png', 'image/png');

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.equal(res.json.text, '');
  assert.equal(res.json.detected, false);
  assert.ok(res.json.message.includes('ಯಾವುದೇ ಸ್ಪಷ್ಟ ಪಠ್ಯ'));
});

test('5. POST /api/ocr with unsupported file type returns 415 Unsupported Media Type', async () => {
  const fakePdf = Buffer.from('%PDF-1.4 mock pdf text');
  const res = await sendFileToOcr(fakePdf, 'document.pdf', 'application/pdf');

  assert.equal(res.status, 415);
  assert.equal(res.json.success, false);
  assert.ok(res.json.error.message.includes('Unsupported file format'));
});

test('6. POST /api/ocr with file exceeding 10 MB returns 413 Payload Too Large', async () => {
  const bigBuffer = Buffer.alloc(11 * 1024 * 1024, 0); // 11 MB
  const res = await sendFileToOcr(bigBuffer, 'oversized.png', 'image/png');

  assert.equal(res.status, 413);
  assert.equal(res.json.success, false);
  assert.equal(res.json.error.code, 'FILE_TOO_LARGE');
});

test('7. POST /api/ocr without file returns 400 Bad Request', async () => {
  const boundary = '----WebKitFormBoundaryEmpty';
  const body = `--${boundary}--\r\n`;

  const res = await makeRequest('/api/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  assert.equal(res.status, 400);
  assert.equal(res.json.success, false);
  assert.equal(res.json.error.code, 'FILE_MISSING');
});
