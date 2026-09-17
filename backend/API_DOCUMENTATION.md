# ArchFlow — API Documentation

> Phase 3C  
> Base URL: `http://localhost:5000`  
> All responses are JSON. All error responses follow `{ "success": false, "message": "..." }`.

---

## Project APIs

### POST /api/projects
Create a new project.

**Request body**
```json
{
  "name": "Modern Villa",
  "description": "Residential villa project",
  "status": "active",
  "clientName": "Rahul Sharma",
  "location": "Pune, Maharashtra"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | Max 200 chars |
| `description` | string | — | Max 2000 chars |
| `status` | string | — | `active` \| `completed` \| `archived` (default: `active`) |
| `clientName` | string | — | Max 200 chars |
| `location` | string | — | Max 300 chars |

**Success — HTTP 201**
```json
{
  "success": true,
  "data": {
    "_id": "6aaae89817517f38000d211f",
    "name": "Modern Villa",
    "description": "Residential villa project",
    "status": "active",
    "clientName": "Rahul Sharma",
    "location": "Pune, Maharashtra",
    "createdBy": null,
    "createdAt": "2026-09-16T19:06:00.664Z",
    "updatedAt": "2026-09-16T19:06:00.664Z"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | Validation error (e.g. missing name, invalid status enum) |

---

### GET /api/projects
Return all projects, newest first.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "Modern Villa", "status": "active", ... }
  ]
}
```

---

### GET /api/projects/:id
Return a single project by ID.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": { "_id": "...", "name": "Modern Villa", ... }
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | `Invalid project ID` — `:id` is not a valid ObjectId |
| 404 | `Project not found` — valid ObjectId but no matching document |

---

### PUT /api/projects/:id
Update project fields. Fields `_id`, `createdAt`, `updatedAt` are always stripped from the request.

**Request body** (any subset of writable fields)
```json
{
  "status": "completed",
  "description": "Updated description"
}
```

**Success — HTTP 200**
```json
{
  "success": true,
  "data": { "_id": "...", "status": "completed", ... }
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | Invalid project ID or validation failure |
| 404 | Project not found |

---

## Communication APIs

### POST /api/projects/:projectId/communications
Create a communication under a project.

> **Important:** `content` is stored exactly as submitted. It is never summarised, analysed, or modified by the server.

**Request body**
```json
{
  "senderName": "Rahul Sharma",
  "senderRole": "Client",
  "sourceType": "client",
  "subject": "Master Bathroom Tiles",
  "content": "Everything looks good except the master bathroom. Please change the tiles to the previous option.",
  "communicationDate": "2026-09-16T10:30:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `content` | string | ✅ | Original communication text, max 50 000 chars |
| `sourceType` | string | ✅ | See enum below |
| `senderName` | string | — | Max 150 chars |
| `senderRole` | string | — | Max 100 chars |
| `subject` | string | — | Max 500 chars |
| `communicationDate` | ISO date | — | Date of the actual communication |

**`sourceType` enum:** `client` · `architect` · `contractor` · `supplier` · `consultant` · `email` · `site_update` · `drawing_update` · `other`

**Success — HTTP 201**
```json
{
  "success": true,
  "data": {
    "_id": "6aaae8c217517f38000d2126",
    "projectId": "6aaae89817517f38000d211f",
    "senderName": "Rahul Sharma",
    "senderRole": "Client",
    "sourceType": "client",
    "subject": "Master Bathroom Tiles",
    "content": "Everything looks good except the master bathroom. Please change the tiles to the previous option.",
    "communicationDate": "2026-09-16T10:30:00.000Z",
    "createdAt": "2026-09-16T19:06:58.000Z",
    "updatedAt": "2026-09-16T19:06:58.000Z"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | `Invalid project ID` |
| 400 | Validation error (missing `content`, invalid `sourceType`, etc.) |
| 404 | `Project not found` |

---

### GET /api/projects/:projectId/communications
Return all communications for a project, newest first.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "projectId": "...", "sourceType": "drawing_update", "subject": "Drawing Revision", ... },
    { "_id": "...", "projectId": "...", "sourceType": "client",         "subject": "Master Bathroom Tiles", ... }
  ]
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | `Invalid project ID` |
| 404 | `Project not found` |

---

### GET /api/communications/:id
Return a single communication by its own ID.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "projectId": "...",
    "subject": "Master Bathroom Tiles",
    "content": "Everything looks good except the master bathroom...",
    ...
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | `Invalid communication ID` |
| 404 | `Communication not found` |

---

### DELETE /api/communications/:id
Delete a communication by ID.

> **Safety note (Phase 3C):** Dependent Insight, Action, Decision, and Risk records are NOT yet cascaded because AI analysis is not implemented until Phase 3D/3E. Once those phases are live, this endpoint must either check for and refuse deletion when dependents exist, or cascade the delete. This is documented to prevent it being overlooked.

**Success — HTTP 200**
```json
{
  "success": true,
  "message": "Communication deleted",
  "data": { "id": "6aaae8c217517f38000d2126" }
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | `Invalid communication ID` |
| 404 | `Communication not found` |

---

### POST /api/communications/:id/analyze
Analyze an existing communication using Gemini AI (`gemini-3.6-flash`), extract project intelligence (Summary, Actions, Decisions, Risks), persist the 1:1 Insight and associated items to MongoDB, and return the complete structured analysis.

**URL Parameter:** `:id` — valid 24-character hex MongoDB ObjectId of the communication.

**Headers:** None required.

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
      "createdAt": "2026-09-17T03:09:00.000Z",
      "updatedAt": "2026-09-17T03:09:00.000Z"
    },
    "insight": {
      "_id": "6aab0c8b79ed180d914a2e92",
      "projectId": "6aab0c8a79ed180d914a2e89",
      "communicationId": "6aab0c8a79ed180d914a2e8e",
      "summary": "A change request was submitted to revert the master bathroom tiles to the previously chosen option.",
      "model": "gemini-3.6-flash",
      "analyzedAt": "2026-09-17T03:09:02.000Z",
      "createdAt": "2026-09-17T03:09:02.000Z",
      "updatedAt": "2026-09-17T03:09:02.000Z"
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
        "status": "pending",
        "createdAt": "2026-09-17T03:09:02.000Z",
        "updatedAt": "2026-09-17T03:09:02.000Z"
      }
    ],
    "decisions": [],
    "risks": []
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | `Invalid communication ID` |
| 404 | `Communication not found` |
| 500 | `Gemini API key is not configured on the server` |
| 502 | `Failed to analyze communication with Gemini: <reason>` |

---

## Project Intelligence APIs (Phase 3F)

### GET /api/projects/:projectId/intelligence
Return all persisted AI intelligence records (Insights, Actions, Decisions, Risks) belonging to the requested project.

**URL Parameter:** `:projectId` — valid 24-character hex MongoDB ObjectId of the project.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "_id": "6aab0c8b79ed180d914a2e92",
        "projectId": "6aaae89817517f38000d211f",
        "communicationId": "6aaae8c217517f38000d2126",
        "summary": "Client requested master bathroom tile changes.",
        "model": "gemini-3.6-flash",
        "analyzedAt": "2026-09-17T03:09:02.000Z",
        "createdAt": "2026-09-17T03:09:02.000Z",
        "updatedAt": "2026-09-17T03:09:02.000Z"
      }
    ],
    "actions": [
      {
        "_id": "6aab0c8b79ed180d914a2e95",
        "projectId": "6aaae89817517f38000d211f",
        "communicationId": "6aaae8c217517f38000d2126",
        "insightId": "6aab0c8b79ed180d914a2e92",
        "title": "Change master bathroom tiles",
        "description": "Revert the tiles to the previously selected option.",
        "assignee": null,
        "priority": null,
        "deadline": null,
        "status": "pending",
        "createdAt": "2026-09-17T03:09:02.000Z",
        "updatedAt": "2026-09-17T03:09:02.000Z"
      }
    ],
    "decisions": [],
    "risks": []
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | `Invalid project ID` |
| 404 | `Project not found` |

---

### GET /api/projects/:projectId/insights
Return all Insights for a project.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "projectId": "...", "communicationId": "...", "summary": "...", ... }
  ]
}
```

---

### GET /api/projects/:projectId/actions
Return all Action items for a project.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "projectId": "...", "communicationId": "...", "insightId": "...", "title": "...", ... }
  ]
}
```

---

### GET /api/projects/:projectId/decisions
Return all Decision items for a project.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "projectId": "...", "communicationId": "...", "insightId": "...", "title": "...", ... }
  ]
}
```

---

### GET /api/projects/:projectId/risks
Return all Risk items for a project.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "projectId": "...", "communicationId": "...", "insightId": "...", "title": "...", ... }
  ]
}
```

---

### GET /api/insights/:id
Return a single Insight by its own `_id` or by its linked `communicationId`.

**Success — HTTP 200**
```json
{
  "success": true,
  "data": {
    "_id": "6aab0c8b79ed180d914a2e92",
    "projectId": "6aaae89817517f38000d211f",
    "communicationId": "6aaae8c217517f38000d2126",
    "summary": "...",
    "model": "gemini-3.6-flash",
    "analyzedAt": "..."
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| 400 | `Invalid insight ID` |
| 404 | `Insight not found` |

---

## Dev / Test APIs (Removed in Phase 3F)

> **Note:** The `/api/test/gemini` endpoint used during initial Phase 3D foundation verification has been removed from server route registration in Phase 3F for production cleanliness. All AI operations are now handled exclusively via `POST /api/communications/:id/analyze`.

---

## Standard Error Shape

All error responses follow this shape regardless of endpoint:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Stack traces are included only in `NODE_ENV=development` and are never sent in production.

---

## HTTP Status Code Reference

| Code | Meaning |
|------|---------|
| 200 | Successful GET / PUT / DELETE |
| 201 | Successful POST (resource created) |
| 400 | Invalid request — bad ObjectId format, missing required field, invalid enum |
| 404 | Resource not found — valid ID but no matching document |
| 409 | Conflict — duplicate unique field (e.g. duplicate Insight for same Communication) |
| 500 | Unexpected server error |
