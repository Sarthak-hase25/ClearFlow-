# ArchFlow — Project Understanding

This document summarizes my understanding of the ArchFlow project based on the provided hackathon brief.
It is not a specification. It is a record of what has been agreed and what I understand the project to be.

---

## 1. Hackathon Context

This project is being built for the **ArchScale Guild — Intern Technology Hackathon 2026**.

The hackathon is focused on solving real problems in the architecture, engineering, construction, and design industry.
It is not a theoretical exercise. The goal is to identify a genuine problem, understand how it currently works, and build a practical working prototype that could realistically be useful.

What the hackathon values:
- A clear understanding of the problem
- Strong product thinking
- A working prototype with good UI/UX
- Meaningful use of AI
- The ability to explain technical decisions

The hackathon strongly values **one strong working workflow** over many unfinished features.
AI coding tools are allowed and encouraged, but the team must understand the code and be able to explain every decision.

---

## 2. Selected Problem

We have selected problem statement **AS-02 — Make Project Communication Intelligent, Not Overwhelming**.

In simple terms, AS-02 is about the fact that project teams in architecture and construction communicate constantly, but the sheer volume of communication creates a new problem: important information gets buried and people miss what they need to act on.

The three key areas defined by AS-02 are:
1. **Conversation Capture** — collecting communication from various sources
2. **Intelligent Summarization** — understanding what the communication actually means
3. **Action Extraction** — identifying what needs to be done as a result

Our product must stay connected to all three of these areas.

---

## 3. Problem We Are Solving

In architecture and construction projects, communication happens across many channels:
- Client messages and approvals
- Contractor updates
- Supplier confirmations or delays
- Consultant instructions
- Site updates
- Emails referencing drawing revisions
- Internal team messages

The problem is not that people are not communicating.
The problem is that **there is too much communication**, and it becomes very difficult to identify:
- What actually matters
- What has changed
- What needs to be done
- Who needs to do it
- Whether there is a risk or a pending decision

Important instructions and changes get buried in long threads, and people miss them.
This leads to delays, errors, and miscommunication on projects.

---

## 4. Our Solution

**ArchFlow** is an AI-powered project communication intelligence tool for architecture, construction, and design projects.

Tagline: *"Turn project conversations into clear actions."*

How it solves the problem:
1. A team member adds a raw project communication into ArchFlow (a client message, a contractor update, a site note, etc.)
2. ArchFlow sends that communication to the Gemini AI (via the backend)
3. Gemini analyzes the communication and returns structured information
4. ArchFlow displays a clean, organized summary with extracted actions, decisions, and risks
5. Every extracted item links back to the original communication so nothing appears to be invented
6. The project dashboard shows the team what actually needs their attention right now

ArchFlow is not a chatbot.
ArchFlow is not a task manager.
It is an intelligence layer that sits on top of project communication and helps teams see clearly.

---

## 5. Target Users

Primary users:
- Architects
- Interior designers
- Project managers and coordinators
- Contractors
- Other project stakeholders (consultants, suppliers, site supervisors)

For the MVP, we are not building separate complicated workflows for different user types.
The focus is on solving the communication problem for the team as a whole.

---

## 6. Core User Workflow

The main workflow from start to finish:

```
1. User opens a project (e.g., Modern Villa)

2. User adds a new communication:
   - Selects the source (Client, Contractor, Supplier, etc.)
   - Enters the sender name
   - Types or pastes the message

3. User clicks "Analyze Communication"

4. Frontend sends the communication to the Node.js/Express backend

5. Backend sends the communication text to the Gemini API

6. Gemini analyzes the text and returns structured JSON:
   - Summary
   - Actions (with title, assignee, priority, deadline)
   - Decisions (items requiring approval or a choice)
   - Risks (potential project risks with severity)

7. Backend validates the Gemini response and saves to MongoDB

8. Frontend displays the AI analysis result:
   - Clean summary paragraph
   - List of extracted actions
   - List of decisions
   - List of risks
   - Original source communication shown below for traceability

9. Dashboard updates to show the current project state:
   - Total communications
   - Pending actions
   - Open decisions
   - Active risks
   - Items that need immediate attention

10. User can click any action, decision, or risk and see:
    - The extracted item
    - The original communication it came from
    - The source (Client, Contractor, etc.)
    - The sender and timestamp
```

This is the single most important workflow. Everything else is secondary.

---

## 7. MVP Features

These are the features we have agreed to build:

**A. Projects**
- Create and open projects
- Each project has a name, description, created date, and status
- Each project has its own communications and AI-generated intelligence
- No overcomplicated project management

**B. Communication Capture**
- Add a communication with: source, sender name, and message text
- Possible sources: Client, Architect, Contractor, Supplier, Consultant, Site Update, Email, Other
- Support adding multiple communications to the same project
- Bulk input is useful for the demo

**C. AI Analysis**
- "Analyze Communication" button sends the message to the backend
- Backend calls Gemini API and returns structured JSON
- Backend validates the response before saving
- Clear loading state while AI is processing
- Result shows: summary, actions, decisions, risks, and original source

**D. Project Intelligence Dashboard**
- Shows what needs attention right now
- Stats: total communications, pending actions, open decisions, active risks
- "Needs Attention" section showing high-priority items
- Recent communications feed
- Simple and focused — no unnecessary charts

**E. Action Center**
- Lists all AI-extracted actions across a project
- Each action shows: title, assignee, priority, deadline, status
- Statuses: Pending, In Progress, Completed
- User can update the status

**F. Decisions**
- Lists pending decisions extracted by AI
- A decision is something that needs to be chosen or approved (not just done)
- Status tracking: Pending / Resolved

**G. Risks**
- Lists potential project risks extracted by AI
- Each risk shows: title, description, severity (low/medium/high)

**H. Source Traceability**
- Every action, decision, and risk links to its original communication
- User can see: original message, source, sender, timestamp
- Prevents the AI output from appearing invented or random

**I. What Changed? (Secondary — only if time allows)**
- Identifies meaningful changes across communications (e.g., drawing revision updated, material changed)
- This feature is lower priority and should not be built at the expense of the main workflow

---

## 8. Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend framework | React | Component-based UI, good ecosystem |
| Frontend build tool | Vite | Fast development server |
| Frontend styling | Tailwind CSS | Utility-first, consistent design |
| Backend framework | Node.js + Express.js | Lightweight, familiar for the team |
| Database | MongoDB (MongoDB Atlas) | Document model suits flexible AI output structures |
| ODM | Mongoose | Schema validation and relationship management |
| AI | Gemini API | AI analysis and structured extraction |
| Frontend deployment | Vercel | Simple React/Vite deployment |
| Backend deployment | Render (or similar) | Node.js hosting |

**Note on MongoDB:**
MongoDB is an intentional and required choice because it is one of the skills relevant to the internship.
It must be used properly — not just as a requirement checkbox.

---

## 9. AI Strategy

**How Gemini will be used:**
- The Gemini API is called from the Node.js backend only
- The API key is stored as an environment variable and never exposed to the frontend
- The frontend sends the communication text to the backend
- The backend constructs a prompt and calls Gemini
- Gemini returns a structured JSON response

**What Gemini should extract:**
- A plain-language summary of the communication
- Actions (what needs to be done, by whom, with what priority, by when)
- Decisions (what needs to be approved or chosen)
- Risks (what could go wrong as a result of this communication)
- Other useful fields where clearly present: project area, people mentioned, changes detected

**Preventing invented information:**
- The Gemini prompt will explicitly instruct the model not to invent missing information
- If an assignee is not mentioned, the field returns null
- If a deadline is not mentioned, the field returns null
- The backend will validate the response structure before saving
- The frontend will display "Unknown" or "Not specified" for null fields — it will never display a made-up value
- Every extracted item will show its source communication so users can verify

**Example of correct AI behavior:**
```json
{
  "assignee": null,
  "deadline": null,
  "priority": "high"
}
```
This is correct. Inventing an assignee or deadline because one "seems likely" is not acceptable.

---

## 10. MongoDB Strategy

**Why MongoDB:**
- AI-generated insights have flexible, variable structures
- One communication might produce 3 actions and 2 risks
- Another might produce 0 actions and 1 decision
- MongoDB's document model handles this variation naturally without requiring nullable columns or complex joins
- MongoDB Atlas provides managed hosting with easy connection string configuration

**Expected collections:**

| Collection | Purpose |
|---|---|
| `users` | User accounts (basic, not complex role management) |
| `projects` | Project records (name, description, status, created date) |
| `communications` | Raw captured messages (source, sender, message, timestamp, project reference) |
| `insights` | The AI-generated analysis result for a communication (summary, project reference, communication reference) |
| `actions` | Extracted actions (title, assignee, priority, deadline, status, communication reference, project reference) |
| `decisions` | Extracted decisions (title, description, status, communication reference, project reference) |
| `risks` | Extracted risks (title, description, severity, communication reference, project reference) |

**Design principles:**
- Use Mongoose schemas with proper validation
- Use MongoDB ObjectId references between collections (not embedding everything into one giant document)
- Keep the schema practical and maintainable
- Evaluate embedded vs referenced documents during implementation based on actual query patterns

**Relationship structure:**
```
User -> Project -> Communication -> Insight -> Actions, Decisions, Risks
```
Every action, decision, and risk should carry a reference to both the project and the original communication.

---

## 11. UI/UX Direction

**Target feel:**
The application should look and feel like a real, professional SaaS product built for architects and project managers. It should feel clean, focused, and trustworthy.

**Design principles:**
- Clean and minimal layout with good whitespace
- Strong visual hierarchy — the most important information should be immediately obvious
- Modern typography (e.g., Inter or similar professional font)
- Subtle, purposeful animations (not flashy)
- Clear status indicators (priority levels, risk severity, action status)
- Responsive layout
- Consistent spacing and component sizing

**What to avoid:**
- Excessive gradients or glassmorphism
- Too many colors
- Fake analytics and charts that do not mean anything
- Every section looking like a card
- Generic AI dashboard aesthetic
- College project appearance
- Buttons that do not do anything
- 3D effects or overly animated elements

**Key screens:**
1. Dashboard — what needs attention right now
2. Project view — overview of a single project
3. Add communication — simple input form
4. AI analysis result — structured output after analysis
5. Action / Decision / Risk detail — with source traceability

---

## 12. Product Differentiator

**What ArchFlow is NOT:**
- Not a chatbot
- Not a to-do list application
- Not a CRM
- Not a generic project management tool

**What ArchFlow IS:**
An intelligence layer that sits on top of project communication.

The core positioning:

> Project teams do not have a communication problem.
> They have an information problem.
> ArchFlow turns messy conversations into clear project intelligence.

The differentiator is that communication is the **starting point** of every workflow.
The AI does not generate tasks randomly. It extracts them from real communication.
Every extracted item is traceable back to the exact message it came from.
The team can verify the AI output at any time.

This makes ArchFlow trustworthy, not just impressive-looking.

---

## 13. Hackathon Strategy

**Why we are focusing on one strong working workflow:**

We have a limited timeline (deadline: 16 September 2026).

Building many unfinished screens demonstrates poor product thinking and poor technical execution.
Building one complete, polished, working workflow demonstrates:
- That we understand the problem deeply
- That we can make product decisions (knowing what to cut)
- That our technical implementation is solid
- That the product is actually usable

The hackathon explicitly rewards this approach over quantity.

**Our priority order if time becomes limited:**
1. Communication capture
2. AI analysis
3. Structured action extraction
4. Dashboard
5. Source traceability
6. Decisions
7. Risks
8. What Changed?
9. Extra features

If a feature threatens the stability of the main workflow, we remove it.

---

## 14. Features We Should NOT Build

These are explicitly outside our scope:

- Generic chatbot or AI assistant interface
- Generic to-do or task management application
- CRM functionality
- Social features
- Payment or billing system
- Complex notification system
- Complex multi-role authentication and permissions
- Fake integrations with external tools
- Fake analytics dashboards with made-up numbers
- Unnecessary microservices or over-engineered architecture
- 20+ screens that are partially built
- Any feature that does not directly support the AS-02 communication intelligence problem

The test: does this feature help a project team go from raw communication to clear intelligence? If not, it does not belong in this MVP.

---

## 15. Development Phases

| Phase | Focus |
|---|---|
| Phase 1 | Project structure and frontend foundation (React + Vite + Tailwind setup, folder structure, routing) |
| Phase 2 | UI/UX refinement (design system, layout, typography, component library) |
| Phase 3 | Node.js + Express backend setup (server, routing structure, middleware, error handling) |
| Phase 4 | MongoDB Atlas + Mongoose database setup (connection, schemas, models) |
| Phase 5 | Communication APIs (CRUD endpoints for projects and communications) |
| Phase 6 | Gemini AI integration (backend service to call Gemini, prompt design, response parsing) |
| Phase 7 | Structured AI extraction (validate and save AI output, handle null fields, error handling) |
| Phase 8 | Dashboard integration (connect frontend dashboard to real backend data) |
| Phase 9 | Actions / Decisions / Risks (display, status updates, full CRUD) |
| Phase 10 | Source traceability (link every extracted item to its original communication) |
| Phase 11 | "What Changed?" feature (secondary — only if time allows) |
| Phase 12 | Testing and bug fixing (end-to-end workflow testing, edge cases, error states) |
| Phase 13 | Deployment (Vercel for frontend, Render for backend, MongoDB Atlas for database) |
| Phase 14 | Documentation (README, architecture explanation, AI usage notes, design decisions) |
| Phase 15 | Demo preparation (3-5 minute demo script, demo data, rehearsal) |

---

## 16. Final Demo Flow

The demo should tell a story. It should not just be a screen tour.

Expected 3-5 minute demo flow:

1. **Open ArchFlow** — show the landing or dashboard screen
2. **Open the Modern Villa project** — introduce the demo project
3. **Show existing communications** — demonstrate that there are already several messages in the system (from client, contractor, supplier, etc.)
4. **Add a new communication** — paste or type a realistic project message (e.g., a client message about bathroom tiles and a contractor request for drawings)
5. **Click "Analyze Communication"** — show the loading state so judges can see it is actually calling AI, not faking it
6. **Show the AI analysis result** — summary, extracted actions, decisions, risks
7. **Navigate to the dashboard** — show how the dashboard now reflects the new information
8. **Click on an extracted action** — open the action detail
9. **Show source traceability** — demonstrate that the original message is shown below the extracted action
10. **Show the Action Center** — show all pending actions across the project
11. **Show Decisions and Risks** if time allows
12. **Demonstrate "What Changed?"** if implemented
13. **Close with the core message** — explain how this saves time, reduces information overload, and helps teams focus on what matters

**Key demo principles:**
- Use real data, not placeholder text
- Do not click buttons that do not work
- Show the AI actually processing (loading state)
- Speak to the problem, not just the features
- Connect every screen back to the AS-02 problem statement

---

## 17. Important Questions / Potential Concerns

These are observations and potential risks identified from the brief. They are not blocking issues, but should be considered during development.

**Technical concerns:**

1. **Gemini response reliability:** Gemini may not always return perfectly structured JSON. The backend must handle cases where the response is malformed, incomplete, or contains unexpected fields. A robust fallback and validation layer is important.

2. **Prompt engineering:** The quality of extracted actions, decisions, and risks depends heavily on how well the Gemini prompt is written. This will likely need iteration. Budget time for prompt refinement during Phase 6-7.

3. **Null handling:** The brief is clear that null fields must not be invented. The frontend must gracefully display "Unknown" or "Not specified" without breaking the UI layout.

4. **MongoDB schema flexibility vs. structure:** We need to balance MongoDB's flexibility with enough Mongoose schema validation to prevent garbage data from being saved. This is especially important for AI-generated content.

5. **Demo data preparation:** The demo requires realistic, pre-loaded communications for the Modern Villa project. This data should be prepared early so the demo flow is smooth and not dependent on typing everything live.

**Product concerns:**

6. **Scope creep risk:** The brief is comprehensive and well-defined, but there is a natural risk of wanting to add more features as development progresses. Every addition should be tested against the priority order defined in Section 13.

7. **"What Changed?" complexity:** This feature sounds simple but may require comparing communications over time and detecting semantic changes (not just keyword differences). If time is limited, this feature should be cut cleanly rather than half-built.

8. **Authentication scope:** The brief mentions a users collection but also says not to build complex authentication. It should be clarified early whether authentication is required for the MVP demo or whether a simplified/mock login is acceptable for the hackathon.

9. **Deployment timing:** Deployment (Phase 13) should not be left to the last hour. A broken deployment on demo day is a significant risk. Plan to deploy early and keep the deployed version updated.

**Clarifications that would be helpful (not blocking):**

- Is a login/authentication screen required for the hackathon demo, or can we assume a single logged-in user?
- Should the "What Changed?" feature compare communications within a project, or across projects?
- Is bulk import (e.g., paste multiple messages at once) a required feature or a nice-to-have for the demo?

---

*This document reflects the project brief as provided. All confirmed requirements come directly from the brief. Observations and concerns in Section 17 are my own additions and are clearly labeled as such.*
