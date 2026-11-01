/**
 * Damage-Aware Text Recovery Service for Aksharoddhaara
 * 
 * Provides algorithmic hypotheses for unclear or damaged Kannada text
 * using configured AI providers (Google Gemini or OpenAI) while upholding
 * strict digital preservation ethics: suggestions are explicitly unverified hypotheses
 * and require human scholar review.
 */

export const MAX_SELECTED_TEXT_LENGTH = 200;
export const MAX_CONTEXT_LENGTH = 1000;
export const MAX_DAMAGE_NOTE_LENGTH = 500;
export const REQUEST_TIMEOUT_MS = 15000;

export const SYSTEM_INSTRUCTION = `You are an expert specialist in Kannada epigraphy, paleography, and historical manuscript preservation for the Aksharoddhaara (ಅಕ್ಷರೋದ್ಧಾರ) project.
Your task is to analyze damaged, weathered, or unclear Kannada characters/words extracted from historical documents and suggest plausible alternative readings.

STRICT DIGITAL PRESERVATION RULES:
1. Treat this task strictly as speculative, uncertain text interpretation, NOT factual recovery. You CANNOT know with certainty what the original damaged manuscript stated.
2. Preserve authentic Kannada script (Unicode) correctly.
3. Suggest up to three (1 to 3) plausible alternative readings ONLY when there is a reasonable paleographic or contextual basis (e.g., visual glyph similarities in Kannada script such as 'ರ' vs 'ದ', 'ವ' vs 'ಮ', 'ಬ' vs 'ಭ', faded 'ಕಾಗುಣಿತ' vowel signs like ಿ/ೀ/ು/ೂ/ೆ/ೇ, or eroded virama/halant).
4. Consider the surrounding context passage without inventing unsupported historical facts.
5. Provide a brief reason for each plausible suggestion explaining the paleographical or contextual rationale.
6. If the selected text is completely destroyed, uninterpretable, or pure noise, return an empty suggestions list and state that the text cannot be interpreted reliably.
7. NEVER describe a suggestion as the verified original wording.

You must respond in valid JSON matching this schema:
{
  "status": "needs_human_review" | "uninterpretable",
  "suggestions": [
    {
      "text": "<Plausible Kannada reading in authentic Unicode>",
      "reason": "<Brief paleographical or contextual explanation>"
    }
  ],
  "explanation": "<Brief overall assessment of the unclear passage>"
}`;

/**
 * Validates the user input for recovery suggestions.
 */
export const validateRecoveryInput = ({ selectedText, context = '', damageNote = '' }) => {
  if (!selectedText || typeof selectedText !== 'string' || selectedText.trim().length === 0) {
    const error = new Error('ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಲು ಅಸ್ಪಷ್ಟ ಕನ್ನಡ ಪದ ಅಥವಾ ಅಕ್ಷರವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Please select an unclear Kannada word or passage).');
    error.statusCode = 400;
    error.code = 'SELECTION_MISSING';
    throw error;
  }

  const trimmedSelected = selectedText.trim();
  if (trimmedSelected.length > MAX_SELECTED_TEXT_LENGTH) {
    const error = new Error(`ಆಯ್ಕೆಮಾಡಿದ ಪಠ್ಯವು ಗರಿಷ್ಠ ${MAX_SELECTED_TEXT_LENGTH} ಅಕ್ಷರಗಳ ಮಿತಿಯನ್ನು ಮೀರಿದೆ (Selected text exceeds the ${MAX_SELECTED_TEXT_LENGTH} character limit).`);
    error.statusCode = 400;
    error.code = 'SELECTION_TOO_LONG';
    throw error;
  }

  const trimmedContext = typeof context === 'string' ? context.trim().slice(0, MAX_CONTEXT_LENGTH) : '';
  const trimmedDamage = typeof damageNote === 'string' ? damageNote.trim().slice(0, MAX_DAMAGE_NOTE_LENGTH) : '';

  return {
    selectedText: trimmedSelected,
    context: trimmedContext,
    damageNote: trimmedDamage,
  };
};

/**
 * Calls Google Gemini API for structured JSON recovery suggestions.
 */
async function callGeminiApi(apiKey, { selectedText, context, damageNote }, customFetch = fetch) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const promptContent = `Here is the unclear Kannada text from a historical document:
- Selected Unclear Text: "${selectedText}"
${context ? `- Surrounding Context: "${context}"` : ''}
${damageNote ? `- User Damage Observation: "${damageNote}"` : ''}

Analyze this passage and provide up to 3 plausible alternative readings with reasons in structured JSON.`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: promptContent }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await customFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = errBody?.error?.message || `Gemini API returned HTTP ${response.status}`;
      const err = new Error(`AI Provider Error: ${message}`);
      err.statusCode = response.status === 429 ? 429 : 502;
      err.code = response.status === 429 ? 'AI_RATE_LIMIT' : 'AI_PROVIDER_ERROR';
      throw err;
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('No candidate content returned by AI provider.');
    }

    return JSON.parse(candidateText);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('AI request timed out after 15 seconds. Please try again.');
      timeoutErr.statusCode = 504;
      timeoutErr.code = 'AI_TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Calls OpenAI API as a secondary configurable provider.
 */
async function callOpenAiApi(apiKey, { selectedText, context, damageNote }, customFetch = fetch) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const promptContent = `Here is the unclear Kannada text from a historical document:
- Selected Unclear Text: "${selectedText}"
${context ? `- Surrounding Context: "${context}"` : ''}
${damageNote ? `- User Damage Observation: "${damageNote}"` : ''}

Analyze this passage and provide up to 3 plausible alternative readings with reasons in structured JSON.`;

  const requestBody = {
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: promptContent },
    ],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await customFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = errBody?.error?.message || `OpenAI API returned HTTP ${response.status}`;
      const err = new Error(`AI Provider Error: ${message}`);
      err.statusCode = response.status === 429 ? 429 : 502;
      err.code = response.status === 429 ? 'AI_RATE_LIMIT' : 'AI_PROVIDER_ERROR';
      throw err;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No completion returned by AI provider.');
    }

    return JSON.parse(content);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('AI request timed out after 15 seconds. Please try again.');
      timeoutErr.statusCode = 504;
      timeoutErr.code = 'AI_TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Main Service: Generate damage-aware text recovery suggestions.
 */
export const generateRecoverySuggestions = async (input, testOptions = {}) => {
  const validated = validateRecoveryInput(input);

  // Check configured AI Provider
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  let provider = null;
  let rawAiOutput = null;

  // Support test mock caller for isolated unit/integration tests without external network
  if (testOptions.mockCaller) {
    provider = 'mock_provider_for_testing';
    rawAiOutput = await testOptions.mockCaller(validated);
  } else if (geminiKey && geminiKey.trim().length > 0 && geminiKey !== 'your_gemini_api_key_here') {
    provider = 'gemini';
    rawAiOutput = await callGeminiApi(geminiKey.trim(), validated, testOptions.customFetch || fetch);
  } else if (openAiKey && openAiKey.trim().length > 0 && openAiKey !== 'your_openai_api_key_here') {
    provider = 'openai';
    rawAiOutput = await callOpenAiApi(openAiKey.trim(), validated, testOptions.customFetch || fetch);
  } else {
    // Neither provider is configured
    const error = new Error(
      'AI Provider is not configured. Please set GEMINI_API_KEY (or OPENAI_API_KEY) in backend/.env to enable live damage-aware recovery suggestions.'
    );
    error.statusCode = 503;
    error.code = 'AI_NOT_CONFIGURED';
    error.setupGuide = {
      recommendedProvider: 'Google Gemini (Free tier available at Google AI Studio)',
      instructions: [
        '1. Obtain a free Gemini API key from https://aistudio.google.com',
        '2. Open backend/.env in your project',
        '3. Set GEMINI_API_KEY=your_key_here',
        '4. Restart the backend server.',
      ],
    };
    throw error;
  }

  // Validate and sanitize AI response structure
  const rawSuggestions = Array.isArray(rawAiOutput?.suggestions) ? rawAiOutput.suggestions : [];
  const sanitizedSuggestions = rawSuggestions
    .filter((s) => s && typeof s.text === 'string' && s.text.trim().length > 0)
    .slice(0, 3)
    .map((s) => ({
      text: s.text.trim(),
      reason: s.reason ? String(s.reason).trim() : 'ಸಂದರ್ಭಾನುಸಾರ ಅಥವಾ ಲಿಪಿ ಹೋಲಿಕೆಯ ಆಧಾರದ ಸಂಭಾವ್ಯ ಓದು (Plausible reading based on glyph similarity or context).',
    }));

  const hasSuggestions = sanitizedSuggestions.length > 0;
  const status = hasSuggestions ? (rawAiOutput.status || 'needs_human_review') : 'uninterpretable';

  return {
    success: true,
    selectedText: validated.selectedText,
    context: validated.context,
    damageNote: validated.damageNote,
    status,
    suggestions: sanitizedSuggestions,
    explanation: rawAiOutput?.explanation || (hasSuggestions ? 'ಸಂಭಾವ್ಯ ಪರ್ಯಾಯ ಓದುಗಳು ಲಭ್ಯವಿವೆ.' : 'ಈ ಅಸ್ಪಷ್ಟ ಪಠ್ಯಕ್ಕೆ ವಿಶ್ವಾಸಾರ್ಹ ಪರ್ಯಾಯಗಳನ್ನು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.'),
    provider,
    disclaimer: 'ದೃಢೀಕರಿಸದ ಊಹೆ — ಮಾನವ ಪರಿಶೀಲನೆ ಅಗತ್ಯ (Unverified suggestion — human review required. These readings are algorithmic hypotheses and must not be treated as authoritative historical text).',
  };
};
