import { createWorker } from 'tesseract.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tessdataDir = path.resolve(__dirname, '../tessdata');
const kannadaImgPath = path.resolve(__dirname, 'fixtures/clear_kannada.png');

console.log('Testing Tesseract.js with Kannada image:', kannadaImgPath);

async function run() {
  const worker = await createWorker('kan', 1, {
    langPath: tessdataDir,
    cachePath: tessdataDir,
    cacheMethod: 'readOnly',
    gzip: true,
  });

  const imgBuf = fs.readFileSync(kannadaImgPath);
  console.log('Recognizing Kannada text...');
  const result = await worker.recognize(imgBuf);
  console.log('------------------------------------');
  console.log('Extracted Kannada text:');
  console.log(result.data.text.trim());
  console.log('------------------------------------');
  console.log('Confidence:', result.data.confidence);

  await worker.terminate();
}

run().catch((err) => {
  console.error('OCR test failed:', err);
  process.exit(1);
});
