# ArchFlow — Database Schema

> Phase 3B  
> Last updated: September 2026

---

## Overview

ArchFlow's database is built around a single core traceability principle:

> Every AI-generated action, decision, and risk must be traceable back to the exact original communication that produced it.

All data belongs to a **Project**. Within a project, users capture **Communications**. Each communication is processed by AI to produce an **Insight**, from which **Actions**, **Decisions**, and **Risks** are extracted.

---

## Relationship Diagram

```
User
 │
 └── Project (createdBy → User)
       │
       └── Communication (projectId → Project)
              │
              └── Insight (projectId, communicationId)
                    │
                    ├── Action   (projectId, communicationId, insightId)
                    ├── Decision (projectId, communicationId, insightId)
                    └── Risk     (projectId, communicationId, insightId)
```

### Source Traceability Chain

```
Action / Decision / Risk
        │
        ├── communicationId ──→ Communication.content  (original text, never overwritten)
        │
        └── insightId ──→ Insight.summary  (AI-generated summary)
                               │
                               └── communicationId ──→ Communication.content
```

This makes it possible to answer: **"Why did ArchFlow create this action?"** by following `communicationId` back to the original text.

---

## Collections

### 1. `users`

Stores user identity. Authentication is not yet implemented.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required, max 100 chars |
| `email` | String | Required, unique, validated format |
| `role` | String | `admin` \| `member`, default `member` |
| `createdAt` | Date | Auto-managed by Mongoose |
| `updatedAt` | Date | Auto-managed by Mongoose |

---

### 2. `projects`

Top-level container. Every other collection references a project.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required, max 200 chars |
| `description` | String | Optional, max 2000 chars |
| `status` | String | `active` \| `completed` \| `archived` |
| `clientName` | String | Optional, max 200 chars |
| `location` | String | Optional, max 300 chars |
| `createdBy` | ObjectId → User | Null until auth is implemented |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

---

### 3. `communications`

**Most critical collection.** Stores the original source communication.

> **IMMUTABILITY RULE:** The `content` field must never be overwritten with AI-generated text. It represents the original communication verbatim.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `projectId` | ObjectId → Project | Required |
| `senderName` | String | Optional, max 150 chars |
| `senderRole` | String | Optional, max 100 chars |
| `sourceType` | String | Required — see enum below |
| `subject` | String | Optional, max 500 chars |
| `content` | String | Required — **original text, never AI-modified** |
| `communicationDate` | Date | Optional — date of the actual communication |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

**`sourceType` enum:**
`client` | `architect` | `contractor` | `supplier` | `consultant` | `email` | `site_update` | `drawing_update` | `other`

**Indexes:**
- `{ projectId: 1 }` — filter communications by project
- `{ communicationDate: -1 }` — sort by date
- `{ projectId: 1, communicationDate: -1 }` — compound (primary query pattern)

---

### 4. `insights`

AI analysis result. One Insight per Communication (1:1).

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `projectId` | ObjectId → Project | Required |
| `communicationId` | ObjectId → Communication | Required |
| `summary` | String | AI-generated summary, max 5000 chars, null until analyzed |
| `model` | String | AI model used, e.g. `gemini-2.0-flash`, null until analyzed |
| `analyzedAt` | Date | Timestamp of AI analysis, null until analyzed |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

**Indexes:**
- `{ projectId: 1 }` — filter by project
- `{ communicationId: 1 }` — look up insight for a communication
- `{ projectId: 1, communicationId: 1 }` — compound (primary query pattern)

---

### 5. `actions`

Action items extracted from communications via AI.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `projectId` | ObjectId → Project | Required |
| `communicationId` | ObjectId → Communication | Required — traceability |
| `insightId` | ObjectId → Insight | Required — traceability |
| `title` | String | Required, max 300 chars |
| `description` | String | Optional, max 5000 chars |
| `assignee` | String | **null if not in source** |
| `priority` | String | **null if not in source** — see enum |
| `deadline` | Date | **null if not in source** |
| `status` | String | `pending` \| `in_progress` \| `completed` |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

**`priority` enum:** `low` | `medium` | `high` | `null`

**Indexes:**
- `{ projectId: 1, status: 1 }` — primary query pattern

---

### 6. `decisions`

Decisions extracted from communications via AI.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `projectId` | ObjectId → Project | Required |
| `communicationId` | ObjectId → Communication | Required — traceability |
| `insightId` | ObjectId → Insight | Required — traceability |
| `title` | String | Required, max 300 chars |
| `description` | String | Optional, max 5000 chars |
| `status` | String | `open` \| `decided` |
| `decidedBy` | String | **null if not in source** |
| `decisionDate` | Date | **null if not in source** |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

**Indexes:**
- `{ projectId: 1, status: 1 }` — primary query pattern

---

### 7. `risks`

Risks extracted from communications via AI.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `projectId` | ObjectId → Project | Required |
| `communicationId` | ObjectId → Communication | Required — traceability |
| `insightId` | ObjectId → Insight | Required — traceability |
| `title` | String | Required, max 300 chars |
| `description` | String | Optional, max 5000 chars |
| `severity` | String | **null if not in source** — see enum |
| `impact` | String | **null if not in source**, max 1000 chars |
| `status` | String | `open` \| `monitoring` \| `resolved` |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

**`severity` enum:** `low` | `medium` | `high` | `critical` | `null`

**Indexes:**
- `{ projectId: 1, status: 1 }` — primary query pattern

---

## Null Handling Policy

This is a hard rule for data integrity:

> If the original communication does not explicitly state a value, the field remains `null`. AI must never fabricate assignees, dates, priorities, severity levels, or decision makers.

| Field | Set to null when... |
|-------|---------------------|
| `Action.assignee` | No responsible party mentioned in communication |
| `Action.deadline` | No date or timeframe mentioned |
| `Action.priority` | No urgency indicator mentioned |
| `Decision.decidedBy` | Decision maker not identified |
| `Decision.decisionDate` | Date of decision not mentioned |
| `Risk.severity` | Severity not characterised in communication |
| `Risk.impact` | Impact not described in communication |

---

## Enum Reference

| Model | Field | Allowed Values |
|-------|-------|----------------|
| User | `role` | `admin`, `member` |
| Project | `status` | `active`, `completed`, `archived` |
| Communication | `sourceType` | `client`, `architect`, `contractor`, `supplier`, `consultant`, `email`, `site_update`, `drawing_update`, `other` |
| Action | `priority` | `low`, `medium`, `high`, `null` |
| Action | `status` | `pending`, `in_progress`, `completed` |
| Decision | `status` | `open`, `decided` |
| Risk | `severity` | `low`, `medium`, `high`, `critical`, `null` |
| Risk | `status` | `open`, `monitoring`, `resolved` |

---

## Index Summary

| Collection | Index | Purpose |
|------------|-------|---------|
| `communications` | `{ projectId: 1 }` | Filter by project |
| `communications` | `{ communicationDate: -1 }` | Sort by date |
| `communications` | `{ projectId: 1, communicationDate: -1 }` | Project communications sorted by date |
| `insights` | `{ projectId: 1 }` | Filter by project |
| `insights` | `{ communicationId: 1 }` | Look up insight for a communication |
| `insights` | `{ projectId: 1, communicationId: 1 }` | Compound lookup |
| `actions` | `{ projectId: 1, status: 1 }` | Project actions filtered by status |
| `decisions` | `{ projectId: 1, status: 1 }` | Project decisions filtered by status |
| `risks` | `{ projectId: 1, status: 1 }` | Project risks filtered by status |

---

## Architecture Notes

- **No business logic in models.** Schemas define structure, validation, and indexes only. Controllers and services handle logic.
- **No embedded sub-documents.** All entities are top-level collections with ObjectId references. This keeps the schema flat and queries efficient.
- **`timestamps: true`** is used on every schema. Do not manually add `createdAt`/`updatedAt` logic.
- **Model names** map to collection names automatically via Mongoose pluralisation: `User` → `users`, `Communication` → `communications`, etc.
