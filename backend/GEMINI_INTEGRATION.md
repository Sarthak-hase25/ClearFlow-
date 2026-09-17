# ArchFlow — Gemini Integration Documentation

> **Phases:** 3D-1 (Foundation) & 3D-2 (Real Communication Analysis & Structured Extraction)  
> **Status:** Complete & Verified  
> **Service Location:** `backend/src/services/geminiService.js`  
> **Controller Location:** `backend/src/controllers/communicationController.js`  

---

## 1. Purpose

In ArchFlow, Google Gemini is utilized exclusively on the backend to analyze unstructured architectural and construction project communications (such as client emails, site inspection memos, change requests, drawings notes, and contractor WhatsApp messages). The AI engine processes raw communication content and converts it into structured, actionable project intelligence:
- Concise Project Summaries
- Action Items (tasks, follow-ups, requested work)
- Decisions (approvals, confirmations, finalized choices)
- Risks (blockers, potential delays, material shortages, unresolved dependencies)

ArchFlow maintains full source traceability through stored projectId, communicationId, and insightId references.

---

## 2. Gemini Integration Architecture

- **Backend-Only Execution:** The Gemini API is called exclusively from the Node.js Express backend service layer. The frontend never communicates directly with Gemini and possesses no AI credentials.
- **Environment Configuration:** The API key is securely loaded from the environment variable:
  ```env
  GEMINI_API_KEY
  ```
- **Client Lifecycle:** The Google GenAI client (`@google/genai`) is instantiated lazily upon first invocation via `getClient()` and reused across requests.
- **Configured Model:**
  ```javascript
  const GEMINI_MODEL = 'gemini-3.6-flash';
  ```
  The service utilizes `gemini-3.6-flash`, Google's multimodal Flash model featuring low latency, high throughput, and balanced cost.
- **Transient Error Resilience:** The service includes an automatic retry loop with backoff for transient upstream issues (such as temporary 503 high demand or 429 rate limit spikes).

---

## 3. Communication Analysis Flow (Phase 3D-2)

The real end-to-end AI workflow operates as follows:

```
Client Request (POST /api/communications/:id/analyze)
                ↓
Controller validates communication ID & fetches Communication document
                ↓
Backend Gemini Service (`analyzeCommunication(communication)`)
                ↓
Prompt construction with content, sender, subject, and sourceType
                ↓
Google Gemini API (`gemini-3.6-flash` with JSON output mode)
                ↓
Parse raw JSON & validate with `validateAndNormalizeAnalysis()`
                ↓
Database Persistence (`persistAnalysis(communication, analysis)`):
  • Create or update 1:1 Insight document (unique on communicationId)
  • Reconcile / replace existing Actions, Decisions, and Risks
  • Link every record with projectId, communicationId, insightId
                ↓
Return complete unified intelligence response to caller (HTTP 200)
```

The original `content` of the `Communication` is **never overwritten or altered**.

---

## 4. Required AI Structured Output Schema

The Gemini model is instructed to return strictly valid JSON matching this schema:

```json
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
```

---

## 5. Anti-Hallucination & Extraction Rules

### Critical Rule: No Fabrication
Gemini must **NEVER** invent information.
- Missing optional information **MUST be `null`**.
- Missing arrays **MUST be `[]`**.
- Do **not** invent: assignee, deadline, priority, decision maker, decision date, severity, or impact.

### 1. Summary
- 1–3 concise sentences focusing strictly on factual project information.
- Preserves the original intent without adding unstated background context.

### 2. Action Items
- Created **only** when communication contains an actionable request, task, follow-up, or work to perform.
- `priority`: Allowed values are `'low'`, `'medium'`, `'high'`, or `null`. Priority is `null` unless explicitly stated in the communication.
- `assignee`: `null` unless a specific person or role is assigned in the text.
- `deadline`: `null` unless explicitly stated.

### 3. Decisions
- Created **only** when communication contains an approval, confirmation, finalized choice, or explicit decision.
- Ordinary statements and progress updates must **not** be classified as decisions.
- `decidedBy`: `null` unless explicitly stated.
- `decisionDate`: `null` unless explicitly stated.

### 4. Risks
- Created when communication indicates a blocker, potential delay, dependency, unavailable material, unresolved clarification, or project-impacting uncertainty.
- `severity`: Allowed values are `'low'`, `'medium'`, `'high'`, `'critical'`, or `null`. Never guessed; `null` unless explicitly supported.
- `impact`: `null` unless explicitly described.

---

## 6. Structured Output Validation & Normalization

All raw JSON returned by the model is validated by `validateAndNormalizeAnalysis()` prior to database writes:
1. **Type Checks:** Ensures `summary` is a non-empty string, and `actions`, `decisions`, and `risks` are valid arrays.
2. **Field Normalization:**
   - Missing arrays are normalized to `[]`.
   - Missing or empty strings for optional attributes (`description`, `assignee`, `impact`) are normalized to `null`.
   - `priority` values not in `['low', 'medium', 'high', null]` are normalized to `null`.
   - `severity` values not in `['low', 'medium', 'high', 'critical', null]` are normalized to `null`.
   - Dates (`deadline`, `decisionDate`) are validated and converted to Date objects or `null`.
3. **Safety Guarantee:** If the response structure is corrupt or unparseable, an error is thrown and **nothing is saved to the database**.

---

## 7. Database Persistence & Source Traceability

Every extracted record maintains full referential traceability:

```
Project (projectId)
  ↓
Communication (communicationId) — Original Immutable Content
  ↓
Insight (insightId) — 1:1 Relationship (unique: communicationId)
  ↓
Actions (projectId, communicationId, insightId)
Decisions (projectId, communicationId, insightId)
Risks (projectId, communicationId, insightId)
```

- **Traceability Guarantee:** Any Action, Decision, or Risk can trace directly back to its parent `Insight`, the source `Communication`, and the associated `Project`.
- **Immutability:** The source communication's `content` is never modified.

---

## 8. Duplicate Protection (Idempotent Re-analysis)

A communication may be analyzed more than once (e.g. user clicks "Re-analyze"). To prevent duplicate accumulations:
1. The `Insight` collection enforces a unique compound index on `{ communicationId: 1 }`.
2. On re-analysis:
   - The existing `Insight` is updated with the new `summary`, `model`, and `analyzedAt`.
   - Existing `Action`, `Decision`, and `Risk` records referencing that `communicationId` are removed.
   - Newly extracted intelligence records are inserted with fresh references.
3. Database transactions / rollback cleanup prevent orphan records or partial writes if any failure occurs during persistence.

---

## 9. API Endpoints

### POST /api/communications/:id/analyze
Analyzes an existing communication with Gemini, extracts structured intelligence, and persists the results.

**Request:**
- URL parameter: `:id` (valid MongoDB ObjectId)
- Body: None required

**Success — HTTP 200**
```json
{
  "success": true,
  "data": {
    "communication": {
      "_id": "6aab0c8a79ed180d914a2e8e",
      "projectId": "6aab0c8a79ed180d914a2e89",
      "sourceType": "client",
      "senderName": "Client",
      "content": "Please change the tiles in the master bathroom to the previous option.",
      "createdAt": "2026-09-17T03:09:00.000Z"
    },
    "insight": {
      "_id": "6aab0c8b79ed180d914a2e92",
      "projectId": "6aab0c8a79ed180d914a2e89",
      "communicationId": "6aab0c8a79ed180d914a2e8e",
      "summary": "A change request was submitted to revert the master bathroom tiles to the previously chosen option.",
      "model": "gemini-3.6-flash",
      "analyzedAt": "2026-09-17T03:09:02.000Z"
    },
    "actions": [
      {
        "_id": "6aab0c8b79ed180d914a2e95",
        "projectId": "6aab0c8a79ed180d914a2e89",
        "communicationId": "6aab0c8a79ed180d914a2e8e",
        "insightId": "6aab0c8b79ed180d914a2e92",
        "title": "Change master bathroom tiles",
        "description": "Revert the master bathroom tiles to the previously selected option.",
        "assignee": null,
        "priority": null,
        "deadline": null,
        "status": "pending"
      }
    ],
    "decisions": [],
    "risks": []
  }
}
```

**Errors**

| Status | Reason |
|--------|--------|
| 400 | `Invalid communication ID` |
| 404 | `Communication not found` |
| 500 | `Gemini API key is not configured on the server` |
| 502 | `Failed to analyze communication with Gemini` |

### GET /api/test/gemini
Dev-only test endpoint verifying basic Gemini SDK connectivity (echo test).

---

## 10. Security Guidelines

- **Zero Credential Exposure:** `GEMINI_API_KEY` is read strictly from `backend/.env`.
- **Never Committed:** `backend/.env` is never committed to source control or distributed.
- **Documentation Safety:** Actual API keys are never included in documentation, test files, or screenshots.
- **Response Safety:** API responses never echo keys, tokens, or internal stack traces.
- **Example Safe:** Only `backend/.env.example` contains the placeholder:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  ```

---

## 11. Testing & Verification

The automated test suite in [`backend/scripts/test-phase3d2.js`](file:///d:/Hackathon%20Project/backend/scripts/test-phase3d2.js) exercises 37 assertions:
- **T1:** Invalid ObjectId returns HTTP 400.
- **T2:** Nonexistent communication returns HTTP 404.
- **T3:** Missing `GEMINI_API_KEY` throws a clean error without crashing.
- **T4:** Real Gemini analysis smoke test succeeds with valid JSON.
- **T5:** Insight persists with correct `communicationId`, `projectId`, and `model`.
- **T6:** Action persists with `communicationId`, `insightId`, `projectId`.
- **T7:** Decision persists with `communicationId`, `insightId`.
- **T8:** Risk persists with `communicationId`, `insightId`.
- **T9:** Unspecified attributes (`assignee`, `priority`, `deadline`, `severity`, `impact`) remain strictly `null`.
- **T10:** Re-analyzing the same communication updates the Insight and reconciles actions/decisions/risks without creating duplicates.
- **T11:** Original communication content remains completely immutable.
- **T12:** Malformed or non-JSON model outputs are rejected safely.
