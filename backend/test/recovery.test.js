import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'node:http';
import app from '../src/app.js';
import {
  validateRecoveryInput,
  generateRecoverySuggestions,
  MAX_SELECTED_TEXT_LENGTH,
} from '../src/services/recoveryService.js';

let server;
let baseUrl;

test.before(async () => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Recovery Test server running on ${baseUrl}`);
      resolve();
    });
  });
});

test.after(async () => {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
});

const makePost = (path, bodyObj) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const bodyStr = JSON.stringify(bodyObj);
    const req = request.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json;
          try {
            json = JSON.parse(data);
          } catch {
            json = null;
          }
          resolve({ status: res.statusCode, json });
        });
      }
    );
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
};

test('1. validateRecoveryInput validates non-empty selected Kannada text', () => {
  const result = validateRecoveryInput({
    selectedText: ' ಸಾಹಿತ್ಯ ',
    context: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸಮ್ಮೇಳನ',
    damageNote: 'ವೊವೆಲ್ ಸೈನ್ ಮಂಕಾಗಿದೆ',
  });
  assert.equal(result.selectedText, 'ಸಾಹಿತ್ಯ');
  assert.equal(result.context, 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸಮ್ಮೇಳನ');
  assert.equal(result.damageNote, 'ವೊವೆಲ್ ಸೈನ್ ಮಂಕಾಗಿದೆ');
});

test('2. validateRecoveryInput rejects empty or whitespace-only selection with 400', () => {
  assert.throws(
    () => validateRecoveryInput({ selectedText: '   ' }),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.equal(err.code, 'SELECTION_MISSING');
      return true;
    }
  );
});

test('3. validateRecoveryInput rejects excessively long selected text with 400', () => {
  const longText = 'ಕ'.repeat(MAX_SELECTED_TEXT_LENGTH + 10);
  assert.throws(
    () => validateRecoveryInput({ selectedText: longText }),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.equal(err.code, 'SELECTION_TOO_LONG');
      return true;
    }
  );
});

test('4. POST /api/recovery/suggest returns 503 AI_NOT_CONFIGURED when no API key is provided', async () => {
  // Ensure keys are unset in this subtest
  const oldGemini = process.env.GEMINI_API_KEY;
  const oldOpenAi = process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const res = await makePost('/api/recovery/suggest', {
      selectedText: 'ಸಾಹಿತ್ಯ',
      context: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸಮ್ಮೇಳನ',
    });

    assert.equal(res.status, 503);
    assert.equal(res.json.success, false);
    assert.equal(res.json.error.code, 'AI_NOT_CONFIGURED');
    assert.ok(res.json.error.setupGuide);
    assert.ok(Array.isArray(res.json.error.setupGuide.instructions));
  } finally {
    if (oldGemini) process.env.GEMINI_API_KEY = oldGemini;
    if (oldOpenAi) process.env.OPENAI_API_KEY = oldOpenAi;
  }
});

test('5. generateRecoverySuggestions parses and validates structured AI responses', async () => {
  const mockAiOutput = {
    status: 'needs_human_review',
    suggestions: [
      {
        text: 'ಸಾಹಿತ್ಯ',
        reason: "ಅಕ್ಷರ 'ಹಿ' ಯ ಮೇಲಿನ ಇ-ಕಾರದ ಸುರುಳಿ ಸವೆದುಹೋಗಿದೆ, ಸಂದರ್ಭವು 'ಸಾಹಿತ್ಯ'ವನ್ನು ಬಲವಾಗಿ ಸೂಚಿಸುತ್ತದೆ.",
      },
      {
        text: 'ಸಾಹಿತ್ಯಂ',
        reason: 'ಪ್ರಾಚೀನ ಹಳೆಗನ್ನಡ ಗ್ರಂಥಗಳಲ್ಲಿ ಅನುಸ್ವಾರಾಂತ ರೂಪ ಸಾಧ್ಯತೆ.',
      },
      {
        text: 'ಸಾಹಿತ್ಯದ',
        reason: 'ಷಷ್ಠೀ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯದ ಕುರುಹು ಇರಬಹುದು.',
      },
    ],
    explanation: 'ಮೊದಲ ಅಕ್ಷರ ಸ್ಪಷ್ಟವಾಗಿದೆ, ಎರಡನೆಯ ಅಕ್ಷರದಲ್ಲಿ ವೊವೆಲ್ ಸೈನ್ ತೇವಾಂಶದಿಂದ ಮಸುಕಾಗಿದೆ.',
  };

  const result = await generateRecoverySuggestions(
    {
      selectedText: 'ಸಾ..ತ್ಯ',
      context: 'ಕರ್ಣಾಟ ಸಾ..ತ್ಯ ಪರಂಪರೆ',
      damageNote: 'Water damage on second letter',
    },
    {
      mockCaller: async () => mockAiOutput,
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.selectedText, 'ಸಾ..ತ್ಯ');
  assert.equal(result.suggestions.length, 3);
  assert.equal(result.suggestions[0].text, 'ಸಾಹಿತ್ಯ');
  assert.ok(result.suggestions[0].reason.includes('ಇ-ಕಾರದ ಸುರುಳಿ'));
  assert.equal(result.status, 'needs_human_review');
  assert.ok(result.disclaimer.includes('ದೃಢೀಕರಿಸದ ಊಹೆ'));
});

test('6. generateRecoverySuggestions handles uninterpretable text cleanly without hallucinations', async () => {
  const mockUninterpretableOutput = {
    status: 'uninterpretable',
    suggestions: [],
    explanation: 'ಈ ಭಾಗದಲ್ಲಿ ತಾಳೆಗರಿಯು ಸಂಪೂರ್ಣ ಸುಟ್ಟುಹೋಗಿರುವುದರಿಂದ ಯಾವುದೇ ಅಕ್ಷರವನ್ನು ಊಹಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
  };

  const result = await generateRecoverySuggestions(
    {
      selectedText: '▒▒▒',
      context: '॥ ಶ್ರೀಮತ್ ▒▒▒ ಶಾಸನಂ',
      damageNote: 'Burnt hole on folio',
    },
    {
      mockCaller: async () => mockUninterpretableOutput,
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.status, 'uninterpretable');
  assert.equal(result.suggestions.length, 0);
  assert.ok(result.explanation.includes('ಯಾವುದೇ ಅಕ್ಷರವನ್ನು ಊಹಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ'));
});

test('7. generateRecoverySuggestions handles AI provider timeout with 504 AI_TIMEOUT', async () => {
  // Test simulated fetch timeout
  const mockTimeoutFetch = () =>
    new Promise((_, reject) => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      reject(err);
    });

  // Temporarily set dummy key to trigger callGeminiApi with mockTimeoutFetch
  process.env.GEMINI_API_KEY = 'test_dummy_key';
  try {
    await assert.rejects(
      async () => {
        await generateRecoverySuggestions(
          { selectedText: 'ಅಕ್ಷರ' },
          { customFetch: mockTimeoutFetch }
        );
      },
      (err) => {
        assert.equal(err.statusCode, 504);
        assert.equal(err.code, 'AI_TIMEOUT');
        return true;
      }
    );
  } finally {
    delete process.env.GEMINI_API_KEY;
  }
});

test('8. generateRecoverySuggestions handles AI provider 429 rate limit with 429 AI_RATE_LIMIT', async () => {
  const mockRateLimitFetch = async () => ({
    ok: false,
    status: 429,
    json: async () => ({ error: { message: 'Resource has been exhausted (rate limit)' } }),
  });

  process.env.GEMINI_API_KEY = 'test_dummy_key';
  try {
    await assert.rejects(
      async () => {
        await generateRecoverySuggestions(
          { selectedText: 'ಅಕ್ಷರ' },
          { customFetch: mockRateLimitFetch }
        );
      },
      (err) => {
        assert.equal(err.statusCode, 429);
        assert.equal(err.code, 'AI_RATE_LIMIT');
        return true;
      }
    );
  } finally {
    delete process.env.GEMINI_API_KEY;
  }
});
