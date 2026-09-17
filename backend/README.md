# ArchFlow Backend

Node.js + Express + MongoDB Atlas backend for the ArchFlow project management platform.

---

## Current Phase

**Phase 3A — Backend Foundation**

This phase establishes the server infrastructure only.
Application APIs (projects, communications, actions, decisions, risks) and
Gemini AI integration are planned for later phases.

---

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Runtime    | Node.js ≥ 18                |
| Framework  | Express.js 4                |
| Database   | MongoDB Atlas               |
| ODM        | Mongoose 8                  |
| Config     | dotenv                      |
| CORS       | cors                        |
| Dev server | nodemon                     |

---

## Prerequisites

- **Node.js ≥ 18** — check with `node -v`
- A **MongoDB Atlas** cluster with a connection URI
- The frontend running on `http://localhost:5173` (or adjust `CLIENT_URL`)

---

## Installation

```bash
cd backend
npm install
```

---

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable       | Description                                       | Default                    |
|----------------|---------------------------------------------------|----------------------------|
| `PORT`         | Port the API listens on                           | `5000`                     |
| `MONGODB_URI`  | Full MongoDB Atlas connection string              | *(required)*               |
| `CLIENT_URL`   | Frontend origin allowed by CORS                   | `http://localhost:5173`    |
| `NODE_ENV`     | `development` or `production`                     | `development`              |

> **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## Running the Server

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

The server starts at: `http://localhost:5000`

---

## API Endpoints

### Health Check

```
GET /api/health
```

**Success response (200):**
```json
{
  "success": true,
  "message": "ArchFlow API is running",
  "data": {
    "status": "ok",
    "database": "connected",
    "environment": "development",
    "timestamp": "2026-09-16T00:00:00.000Z"
  }
}
```

**Degraded response (503 — DB not connected):**
```json
{
  "success": false,
  "message": "ArchFlow API is running but database is not connected",
  "data": {
    "status": "degraded",
    "database": "disconnected",
    ...
  }
}
```

### Unknown Routes

Any request to an unregistered `/api/*` path returns:

```
404 Not Found
```
```json
{
  "success": false,
  "message": "Route not found: GET /api/unknown"
}
```

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Stack traces are included only in `development` mode.

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       ← MongoDB Atlas connection
│   ├── controllers/          ← (populated in Phase 3B+)
│   ├── middleware/
│   │   ├── errorHandler.js   ← Centralized error handling
│   │   └── notFound.js       ← 404 for unknown routes
│   ├── models/               ← (populated in Phase 3B)
│   ├── routes/
│   │   └── health.js         ← GET /api/health
│   ├── services/             ← (populated in Phase 3B+)
│   ├── utils/                ← (populated as needed)
│   └── server.js             ← Entry point
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Running Both Servers

**Frontend** (from project root):
```bash
npm run dev
# → http://localhost:5173
```

**Backend** (from backend/ directory):
```bash
cd backend
npm install
npm run dev
# → http://localhost:5000
```

---

## Planned Phases

| Phase | Description |
|-------|-------------|
| 3A    | ✅ Backend foundation (this phase) |
| 3B    | Database schema design + Mongoose models |
| 3C    | Application REST APIs (projects, communications, actions…) |
| 3D    | Frontend ↔ backend integration (replace mock data) |
| 4     | Gemini AI integration |
| 5     | Authentication |
