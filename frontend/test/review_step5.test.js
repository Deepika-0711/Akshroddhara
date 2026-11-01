import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenizeText, computeTextDiff } from '../src/services/diffUtils.js';
import {
  buildReportData,
  generateHtmlReportString,
  MANDATORY_DISCLAIMER,
} from '../src/services/reportGenerator.js';

test('1. Kannada Unicode tokenization preserves complex glyphs and whitespace', () => {
  const sample = 'ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ, ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ!';
  const tokens = tokenizeText(sample);

  // Tokens should preserve intact Kannada words without separating diacritics
  assert.ok(tokens.includes('ಸಿರಿಗನ್ನಡಂ'));
  assert.ok(tokens.includes('ಗೆಲ್ಗೆ'));
  assert.ok(tokens.includes('ಬಾಳ್ಗೆ'));
  assert.ok(tokens.includes(','));
  assert.ok(tokens.includes('!'));
});

test('2. computeTextDiff detects replacements, additions, and deletions in Kannada text', () => {
  const ocrOriginal = 'ಕರ್ನಾಟಕ ಇತಿಹಾಸದ ಪುರಾತನ ದಾಖಲ';
  const humanEdited = 'ಕರ್ನಾಟಕ ಇತಿಹಾಸದ ಪುರಾತನ ದಾಖಲೆಗಳು';

  const diff = computeTextDiff(ocrOriginal, humanEdited);

  assert.ok(diff.chunks.length > 0);
  assert.ok(diff.stats.additions > 0 || diff.stats.deletions > 0);

  // Unchanged part should be preserved
  const unchangedChunks = diff.chunks.filter((c) => c.type === 'unchanged');
  assert.ok(unchangedChunks.some((c) => c.value.includes('ಕರ್ನಾಟಕ')));

  // Modified part 'ದಾಖಲೆಗಳು' should reflect addition
  const addedChunks = diff.chunks.filter((c) => c.type === 'added');
  assert.ok(addedChunks.some((c) => c.value.includes('ದಾಖಲೆಗಳು')));
});

test('3. computeTextDiff correctly handles identical text', () => {
  const text = 'ಕನ್ನಡ ನಾಡು ನುಡಿ';
  const diff = computeTextDiff(text, text);

  assert.equal(diff.stats.additions, 0);
  assert.equal(diff.stats.deletions, 0);
  assert.equal(diff.chunks.length, 1);
  assert.equal(diff.chunks[0].type, 'unchanged');
  assert.equal(diff.chunks[0].value, text);
});

test('4. buildReportData constructs complete 6-layer preservation data model', () => {
  const mockSession = {
    file: { name: 'halmidi_inscription.png', size: 1048576, type: 'image/png' },
    dimensions: { width: 1200, height: 800 },
    preset: 'stone-rubbing',
    enhancedResult: {
      presetUsed: 'stone-rubbing',
      processingTimeMs: 145,
      operationsApplied: ['grayscale', 'clahe_contrast', 'denoise_bilateral', 'adaptive_otsu'],
    },
    originalOcrText: 'ಶ್ರೀ ವಿಜಯ ಶಿವಮಂದಾರ',
    workingText: 'ಶ್ರೀ ವಿಜಯ ಶಿವಮಂದಾರವರ್ಮ',
    ocrSourceUsed: 'enhanced',
    acceptedCorrections: [
      {
        id: 'c1',
        originalSnippet: 'ಶಿವಮಂದಾರ',
        replacementText: 'ಶಿವಮಂದಾರವರ್ಮ',
        reason: 'ಕದಂಬ ರಾಜನ ಸಂಪೂರ್ಣ ಹೆಸರು',
        confidenceScore: 0.88,
        timestamp: '2026-10-23T18:00:00.000Z',
      },
    ],
    rejectedSuggestions: [
      {
        id: 'r1',
        originalSnippet: 'ಶ್ರೀ',
        rejectedText: 'ಶ್ರೀಮತ್',
        reason: 'ಶಾಸನದಲ್ಲಿ ಅಕ್ಷರ ಕಾಣಿಸುತ್ತಿಲ್ಲ',
        timestamp: '2026-10-23T17:55:00.000Z',
      },
    ],
    sessionHistory: [
      {
        id: 'h1',
        type: 'DOCUMENT_UPLOADED',
        title: 'ಹೊಸ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ',
        displayTime: '17:50:00',
        timestamp: '2026-10-23T17:50:00.000Z',
      },
    ],
  };

  const report = buildReportData(mockSession);

  // Verify Project identity
  assert.equal(report.project, 'ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara)');
  assert.equal(report.tagline, 'ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ');

  // Layer 1: Original file metadata
  assert.equal(report.document.filename, 'halmidi_inscription.png');
  assert.equal(report.document.sizeMB, 1);
  assert.equal(report.document.dimensions.width, 1200);

  // Layer 2: Enhancement
  assert.equal(report.restorationPipeline.enhancementApplied, true);
  assert.equal(report.restorationPipeline.presetUsed, 'stone-rubbing');

  // Layer 3: Pristine OCR Text
  assert.equal(report.ocrExtraction.rawOcrText, 'ಶ್ರೀ ವಿಜಯ ಶಿವಮಂದಾರ');
  assert.equal(report.ocrExtraction.sourceUsed, 'enhanced');

  // Layer 4: Working Human-Edited Text
  assert.equal(report.humanReviewAndCorrection.finalWorkingText, 'ಶ್ರೀ ವಿಜಯ ಶಿವಮಂದಾರವರ್ಮ');

  // Layer 5 & 6: Accepted & Rejected AI suggestions
  assert.equal(report.acceptedCorrections.length, 1);
  assert.equal(report.acceptedCorrections[0].replacementText, 'ಶಿವಮಂದಾರವರ್ಮ');
  assert.equal(report.rejectedSuggestions.length, 1);
  assert.equal(report.rejectedSuggestions[0].rejectedText, 'ಶ್ರೀಮತ್');

  // Audit trail
  assert.equal(report.sessionAuditTrail.length, 1);

  // Mandatory preservation disclaimer
  assert.ok(report.disclaimer.includes('algorithmic hypotheses'));
  assert.ok(report.disclaimer.includes('ಗಮನಿಸಿ'));
});

test('5. generateHtmlReportString creates standalone valid HTML with visual diff and tables', () => {
  const mockSession = {
    file: { name: 'test_palm_leaf.jpg', size: 500000, type: 'image/jpeg' },
    originalOcrText: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಪರಿಷತ್',
    workingText: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಪರಿಷತ್ತು',
    acceptedCorrections: [
      {
        originalSnippet: 'ಪರಿಷತ್',
        replacementText: 'ಪರಿಷತ್ತು',
        reason: 'ಆಧುನಿಕ ಪ್ರಮಾಣಿತ ರೂಪ',
        timestamp: '2026-10-23 18:30',
      },
    ],
    rejectedSuggestions: [],
    sessionHistory: [
      {
        displayTime: '18:25',
        title: 'OCR Extraction',
        details: { summary: 'Completed' },
      },
    ],
  };

  const { report, html } = generateHtmlReportString(mockSession);

  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('<html lang="kn">'));
  assert.ok(html.includes('ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara)'));
  assert.ok(html.includes('« ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ »'));
  assert.ok(html.includes('test_palm_leaf.jpg'));
  assert.ok(html.includes('ಕನ್ನಡ ಸಾಹಿತ್ಯ ಪರಿಷತ್ತು'));
  assert.ok(html.includes('ಪರಿಷತ್'));
  assert.ok(html.includes('ಆಧುನಿಕ ಪ್ರಮಾಣಿತ ರೂಪ'));
  assert.ok(html.includes('ಪ್ರಮುಖ ಸಂರಕ್ಷಣಾ ಹೊಣೆಗಾರಿಕೆ ಸೂಚನೆ'));
  assert.ok(html.includes(MANDATORY_DISCLAIMER));
});
