'use strict';

const dns = require('node:dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const { GoogleGenAI } = require('@google/genai');

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * The Gemini model used for ArchFlow communication analysis.
 * - gemini-3.6-flash: Latest Google GenAI flash model, fast, cost-efficient, multimodal.
 *   Ideal for summarization and structured extraction on a hackathon budget.
 *
 * Change only this constant to switch models across the entire service.
 */
const GEMINI_MODEL = 'gemini-3.6-flash';

// ─── Client Initialization ────────────────────────────────────────────────────

let _client = null;

/**
 * Returns a lazily-initialized GoogleGenAI client.
 * Throws a clear error if the API key is not configured.
 *
 * The client is created once and reused — creating it per-request is wasteful.
 */
function getClient() {
  if (_client) return _client;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is not configured. ' +
      'Add it to your backend/.env file. ' +
      'See backend/.env.example for the expected format.'
    );
  }

  _client = new GoogleGenAI({ apiKey });
  return _client;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function normalizeDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

// ─── System Prompt for Communication Analysis ─────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `You are ArchFlow AI, an expert architectural and construction project intelligence engine.
Analyze the provided communication and extract project intelligence strictly as JSON.

OUTPUT SCHEMA:
Return a JSON object with this exact structure:
{
  "summary": "Concise 1-3 sentence project-focused summary preserving original meaning without assumptions",
  "actions": [
    {
      "title": "Short title of the task or requested work",
      "description": "Clear description of what needs to be performed",
      "assignee": null,
      "priority": null,
      "deadline": null
    }
  ],
  "decisions": [
    {
      "title": "Short title of the approved choice or decision",
      "description": "Clear description of what was decided or confirmed",
      "decidedBy": null,
      "decisionDate": null
    }
  ],
  "risks": [
    {
      "title": "Short title of the risk, blocker, delay, or uncertainty",
      "description": "Clear description of the risk or dependency",
      "severity": null,
      "impact": null
    }
  ]
}

EXTRACTION RULES:
1. SUMMARY: 1-3 sentences. Stick strictly to facts in the message. Do not add background context or assume project details. Focus on useful project information.
2. ACTIONS: Extract ONLY when there is a clear task, request, required follow-up, or work to perform.
   - priority: must be one of "low", "medium", "high", or null. ONLY assign a priority if explicitly stated; otherwise null.
   - assignee: null unless explicitly specified by name or clear role in the text.
   - deadline: null unless explicitly stated.
3. DECISIONS: Extract ONLY when there is an explicit approval, confirmation, finalized choice, or explicit decision. Do NOT classify ordinary statements or updates as decisions.
   - decidedBy: null unless explicitly stated.
   - decisionDate: null unless explicitly stated.
4. RISKS: Extract ONLY when communication indicates a blocker, potential delay, dependency, unavailable material, unresolved clarification, or project-impacting uncertainty.
   - severity: must be one of "low", "medium", "high", "critical", or null. Do NOT guess severity unless explicitly stated; otherwise null.
   - impact: null unless explicitly stated.

CRITICAL ANTI-HALLUCINATION RULE:
- NEVER invent or fabricate information.
- If information is not in the text, the field MUST be null.
- If no items exist for a category, provide an empty array [].
- Return ONLY the JSON object.`;

// ─── Validation & Normalization ───────────────────────────────────────────────

/**
 * Validates and normalizes raw JSON returned by Gemini against ArchFlow requirements.
 * Ensures missing arrays become [] and missing optional attributes become null.
 *
 * @param  {Object} data   The parsed JSON from Gemini.
 * @returns {Object} Normalized analysis { summary, actions, decisions, risks }.
 * @throws  {Error} If required structure is missing or malformed.
 */
function validateAndNormalizeAnalysis(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('AI analysis response must be a non-null object');
  }

  // 1. Validate summary
  if (typeof data.summary !== 'string' || !data.summary.trim()) {
    throw new Error('AI analysis response must include a non-empty summary string');
  }
  const summary = data.summary.trim();

  // 2. Validate and normalize actions
  if (data.actions !== undefined && !Array.isArray(data.actions)) {
    throw new Error('Actions must be an array');
  }
  const rawActions = Array.isArray(data.actions) ? data.actions : [];
  const ALLOWED_PRIORITIES = ['low', 'medium', 'high', null];

  const actions = rawActions.map((act, idx) => {
    if (!act || typeof act !== 'object') {
      throw new Error(`Action at index ${idx} must be an object`);
    }
    if (typeof act.title !== 'string' || !act.title.trim()) {
      throw new Error(`Action at index ${idx} must have a non-empty title string`);
    }

    let priority = act.priority ? String(act.priority).toLowerCase().trim() : null;
    if (!ALLOWED_PRIORITIES.includes(priority)) {
      priority = null;
    }

    return {
      title: act.title.trim().slice(0, 300),
      description: typeof act.description === 'string' && act.description.trim() ? act.description.trim().slice(0, 5000) : null,
      assignee: typeof act.assignee === 'string' && act.assignee.trim() ? act.assignee.trim().slice(0, 150) : null,
      priority,
      deadline: act.deadline ? normalizeDate(act.deadline) : null,
    };
  });

  // 3. Validate and normalize decisions
  if (data.decisions !== undefined && !Array.isArray(data.decisions)) {
    throw new Error('Decisions must be an array');
  }
  const rawDecisions = Array.isArray(data.decisions) ? data.decisions : [];

  const decisions = rawDecisions.map((dec, idx) => {
    if (!dec || typeof dec !== 'object') {
      throw new Error(`Decision at index ${idx} must be an object`);
    }
    if (typeof dec.title !== 'string' || !dec.title.trim()) {
      throw new Error(`Decision at index ${idx} must have a non-empty title string`);
    }

    return {
      title: dec.title.trim().slice(0, 300),
      description: typeof dec.description === 'string' && dec.description.trim() ? dec.description.trim().slice(0, 5000) : null,
      decidedBy: typeof dec.decidedBy === 'string' && dec.decidedBy.trim() ? dec.decidedBy.trim().slice(0, 150) : null,
      decisionDate: dec.decisionDate ? normalizeDate(dec.decisionDate) : null,
    };
  });

  // 4. Validate and normalize risks
  if (data.risks !== undefined && !Array.isArray(data.risks)) {
    throw new Error('Risks must be an array');
  }
  const rawRisks = Array.isArray(data.risks) ? data.risks : [];
  const ALLOWED_SEVERITIES = ['low', 'medium', 'high', 'critical', null];

  const risks = rawRisks.map((rsk, idx) => {
    if (!rsk || typeof rsk !== 'object') {
      throw new Error(`Risk at index ${idx} must be an object`);
    }
    if (typeof rsk.title !== 'string' || !rsk.title.trim()) {
      throw new Error(`Risk at index ${idx} must have a non-empty title string`);
    }

    let severity = rsk.severity ? String(rsk.severity).toLowerCase().trim() : null;
    if (!ALLOWED_SEVERITIES.includes(severity)) {
      severity = null;
    }

    return {
      title: rsk.title.trim().slice(0, 300),
      description: typeof rsk.description === 'string' && rsk.description.trim() ? rsk.description.trim().slice(0, 5000) : null,
      severity,
      impact: typeof rsk.impact === 'string' && rsk.impact.trim() ? rsk.impact.trim().slice(0, 1000) : null,
    };
  });

  return { summary, actions, decisions, risks };
}

// ─── Core Service Functions ───────────────────────────────────────────────────

/**
 * generateText(prompt)
 *
 * Sends a text prompt to Gemini and returns the text response.
 *
 * @param  {string} prompt   The text prompt to send.
 * @returns {Promise<string>} The Gemini text response.
 * @throws  {Error}          If the API key is missing or the request fails.
 */
async function generateText(prompt) {
  const client = getClient(); // throws if key not configured

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  return response.text;
}

/**
 * analyzeCommunication(communication)
 *
 * Sends a communication document/data to Gemini, requests structured JSON,
 * validates and normalizes the response, and returns the project intelligence.
 *
 * Includes automatic retry for transient 503/429 errors.
 *
 * @param  {Object} communication   The Communication document or object.
 * @returns {Promise<Object>}       { summary, actions, decisions, risks }
 * @throws  {Error}                If API key is missing, call fails, or JSON is invalid.
 */
async function analyzeCommunication(communication) {
  if (!communication || !communication.content) {
    throw new Error('Communication must contain content for analysis');
  }

  const client = getClient(); // throws if key not configured

  // Build context payload
  let promptContext = `COMMUNICATION CONTENT:\n"""\n${communication.content}\n"""`;
  if (communication.sourceType) {
    promptContext = `SOURCE TYPE: ${communication.sourceType}\n` + promptContext;
  }
  if (communication.senderName || communication.senderRole) {
    const sender = [communication.senderName, communication.senderRole ? `(${communication.senderRole})` : '']
      .filter(Boolean)
      .join(' ');
    promptContext = `SENDER: ${sender}\n` + promptContext;
  }
  if (communication.subject) {
    promptContext = `SUBJECT: ${communication.subject}\n` + promptContext;
  }

  const fullPrompt = `${ANALYSIS_SYSTEM_PROMPT}\n\n${promptContext}`;

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      let rawData;
      try {
        rawData = JSON.parse(response.text);
      } catch (parseErr) {
        console.error('[gemini-service] Failed to parse JSON response:', response.text);
        throw new Error('Gemini response was not valid JSON: ' + parseErr.message);
      }

      return validateAndNormalizeAnalysis(rawData);
    } catch (err) {
      lastError = err;
      const isTransient = err.message && (err.message.includes('503') || err.message.includes('429') || err.message.includes('high demand'));
      if (isTransient && attempt < 2) {
        console.warn(`[gemini-service] Transient error on attempt ${attempt}, retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  generateText,
  analyzeCommunication,
  validateAndNormalizeAnalysis,
  GEMINI_MODEL,
};
