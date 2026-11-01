import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'node:http';
import app from '../src/app.js';
import Jimp from 'jimp';

let server;
let baseUrl;

test.before(async () => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running on ${baseUrl}`);
      resolve();
    });
  });
});

test.after(async () => {
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

test('1. GET /api/health returns 200 OK and valid health metadata', async () => {
  const res = await makeRequest('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.json.status, 'ok');
  assert.equal(res.json.service, 'Aksharoddhaara (ಅಕ್ಷರೋದ್ಧಾರ) API');
  assert.equal(res.json.tagline, 'ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ');
});

test('2. POST /api/enhance without file returns 400 Bad Request', async () => {
  // Empty multipart request
  const boundary = '----WebKitFormBoundaryTest123';
  const body = `--${boundary}--\r\n`;
  const res = await makeRequest('/api/enhance', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });
  assert.equal(res.status, 400);
  assert.equal(res.json.success, false);
  assert.ok(res.json.error.message.includes('No document file was provided'));
});

test('3. POST /api/enhance with unsupported file type returns 415 Unsupported Media Type', async () => {
  const boundary = '----WebKitFormBoundaryTest123';
  const fileContent = 'PDF or plain text simulation';
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="image"; filename="document.txt"',
    'Content-Type: text/plain',
    '',
    fileContent,
    `--${boundary}--`,
    '',
  ].join('\r\n');

  const res = await makeRequest('/api/enhance', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  assert.equal(res.status, 415);
  assert.equal(res.json.success, false);
  assert.ok(res.json.error.message.includes('Unsupported file format'));
});

test('4. POST /api/enhance with valid simulated historical Kannada document processes and returns enhanced image', async () => {
  // Create a real 64x64 test image with text-like dark strokes on a low-contrast parchment background
  const testImg = new Jimp(100, 50, 0xD4C4A8FF); // Faded brownish parchment color
  // Draw some dark pixel strokes simulating Kannada letter curves
  for (let x = 20; x < 80; x++) {
    testImg.setPixelColor(0x6B5840FF, x, 25); // Faint brown line
  }
  const imgBuffer = await testImg.getBufferAsync(Jimp.MIME_PNG);

  const boundary = '----WebKitFormBoundaryTest456';
  const header = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="image"; filename="faded_kannada_palmleaf.png"',
    'Content-Type: image/png',
    '',
    '',
  ].join('\r\n');

  const footer = `\r\n--${boundary}--\r\n`;
  const bodyBuffer = Buffer.concat([
    Buffer.from(header, 'utf-8'),
    imgBuffer,
    Buffer.from(footer, 'utf-8'),
  ]);

  const res = await makeRequest('/api/enhance', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': bodyBuffer.length,
    },
    body: bodyBuffer,
  });

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.ok(res.json.data.enhancedImage.startsWith('data:image/png;base64,'));
  assert.equal(res.json.data.dimensions.width, 100);
  assert.equal(res.json.data.dimensions.height, 50);
  assert.ok(Array.isArray(res.json.data.operationsApplied));
  assert.ok(res.json.data.operationsApplied.includes('grayscale_conversion'));
  assert.ok(res.json.data.processingTimeMs >= 0);
});

test('5. POST /api/enhance with palm-leaf preset applies adaptive thresholding', async () => {
  const testImg = new Jimp(60, 40, 0x8B7355FF);
  const imgBuffer = await testImg.getBufferAsync(Jimp.MIME_PNG);

  const boundary = '----WebKitFormBoundaryTest789';
  const presetField = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="preset"',
    '',
    'palm-leaf',
    '',
  ].join('\r\n');

  const fileFieldHeader = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="image"; filename="talagari_sample.png"',
    'Content-Type: image/png',
    '',
    '',
  ].join('\r\n');

  const footer = `\r\n--${boundary}--\r\n`;
  const bodyBuffer = Buffer.concat([
    Buffer.from(presetField, 'utf-8'),
    Buffer.from(fileFieldHeader, 'utf-8'),
    imgBuffer,
    Buffer.from(footer, 'utf-8'),
  ]);

  const res = await makeRequest('/api/enhance', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': bodyBuffer.length,
    },
    body: bodyBuffer,
  });

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.equal(res.json.data.presetUsed, 'palm-leaf');
  const hasAdaptive = res.json.data.operationsApplied.some((op) => op.includes('local_adaptive_threshold'));
  assert.ok(hasAdaptive, 'Expected local_adaptive_threshold operation for palm-leaf preset');
});

test('6. POST /api/enhance with oversized file returns 413 Payload Too Large', async () => {
  const boundary = '----WebKitFormBoundaryTestOversize';
  // Create simulated 11MB file buffer
  const bigBuffer = Buffer.alloc(11 * 1024 * 1024, 0);

  const header = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="image"; filename="oversized_scan.png"',
    'Content-Type: image/png',
    '',
    '',
  ].join('\r\n');

  const footer = `\r\n--${boundary}--\r\n`;
  const bodyBuffer = Buffer.concat([
    Buffer.from(header, 'utf-8'),
    bigBuffer,
    Buffer.from(footer, 'utf-8'),
  ]);

  const res = await makeRequest('/api/enhance', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': bodyBuffer.length,
    },
    body: bodyBuffer,
  });

  assert.equal(res.status, 413);
  assert.equal(res.json.success, false);
  assert.equal(res.json.error.code, 'FILE_TOO_LARGE');
});

test('7. POST /api/enhance with corrupted image buffer returns 422 Unprocessable Entity', async () => {
  const boundary = '----WebKitFormBoundaryCorrupted';
  const corruptBuffer = Buffer.from('not a real png or jpeg content');

  const header = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="image"; filename="corrupted_file.png"',
    'Content-Type: image/png',
    '',
    '',
  ].join('\r\n');

  const footer = `\r\n--${boundary}--\r\n`;
  const bodyBuffer = Buffer.concat([
    Buffer.from(header, 'utf-8'),
    corruptBuffer,
    Buffer.from(footer, 'utf-8'),
  ]);

  const res = await makeRequest('/api/enhance', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': bodyBuffer.length,
    },
    body: bodyBuffer,
  });

  assert.equal(res.status, 422);
  assert.equal(res.json.success, false);
  assert.equal(res.json.error.code, 'IMAGE_DECODE_ERROR');
});
