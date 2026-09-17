'use strict';

const { generateText, GEMINI_MODEL } = require('../services/geminiService');

const TEST_PROMPT = 'Reply with exactly: ArchFlow Gemini connection successful';

/**
 * GET /api/test/gemini
 *
 * DEVELOPMENT TEST ENDPOINT — NOT a production feature.
 *
 * Verifies that:
 *   1. GEMINI_API_KEY is configured
 *   2. The Gemini client initialises successfully
 *   3. A live Gemini request round-trips without error
 *
 * Never returns the API key or any sensitive data.
 * Remove or protect this route before any public deployment.
 */
async function testGeminiConnection(req, res) {
  // Check key exists before attempting a live call
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(400).json({
      success: false,
      message: 'GEMINI_API_KEY is not configured. Add it to backend/.env',
    });
  }

  try {
    const text = await generateText(TEST_PROMPT);

    return res.json({
      success: true,
      message: 'Gemini connection successful',
      model: GEMINI_MODEL,
      response: text.trim(), // safe to return — it's just the echo
    });
  } catch (err) {
    // Log the error internally but don't expose raw Gemini errors to callers
    console.error('[gemini-test] Gemini request failed:', err.message);

    return res.status(502).json({
      success: false,
      message: 'Gemini connection test failed. Check GEMINI_API_KEY and network access.',
    });
  }
}

module.exports = { testGeminiConnection };
