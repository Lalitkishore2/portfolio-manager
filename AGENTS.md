# 🤖 Portfolio Manager CMS — Agent System Guide

> **Read this first.** This is the authoritative context file for any AI agent or developer working on `PORTFOLIO-MANAGER`.  
> For the full system picture, read [`docs/END_TO_END.md`](./docs/END_TO_END.md).

---

## What This Repo Is

**PORTFOLIO-MANAGER** is a password-protected, local-only CMS built with **Next.js 15 (App Router)**. It is the admin interface for managing content on `lalitkishore.is-a.dev`.

- Runs at **http://localhost:3000**
- Local path: `C:\Users\LALITKO\Desktop\projects\PORTFOLIO-MANAGER`
- Sister repo (public site): `C:\Users\LALITKO\Desktop\projects\PORTFOLIO`

---

## Architecture at a Glance

```
src/
├── app/
│   ├── page.tsx            ← Root shell (mounts the React CMS app)
│   ├── layout.tsx          ← Next.js layout with Sonner toasts
│   ├── globals.css         ← CMS global styles
│   ├── login/page.tsx      ← Login page (session cookie auth)
│   └── api/
│       ├── projects/       ← GET/POST projects.json
│       ├── profile/        ← GET/POST profile.json
│       ├── skills/         ← GET/POST skills.json
│       ├── experience/     ← GET/POST experience.json
│       ├── chatbot/        ← GET/POST chatbot.json
│       ├── tokens/         ← GET/POST tokens.json
│       ├── queries/        ← GET/POST queries.json
│       ├── make/           ← POST: AI patch generation
│       ├── analytics/      ← GET: GA4 + GitHub traffic
│       ├── settings/       ← GET/POST runtime settings
│       ├── publish/        ← POST: trigger CI rebuild
│       ├── github/         ← GET: repo commits
│       └── auth/           ← login/logout session handlers
│
├── components/
│   └── cms/
│       ├── App.tsx                     ← Main CMS shell + router
│       ├── CMSSidebar.tsx              ← Left navigation sidebar
│       ├── ProjectEditor.tsx           ← Full project CRUD editor
│       ├── ProjectList.tsx             ← Project list view
│       ├── ProfilePage.tsx             ← Profile/bio editor
│       ├── SkillsPage.tsx              ← Skills editor
│       ├── ExperiencePage.tsx          ← Experience timeline editor
│       ├── TokensPage.tsx              ← Design tokens editor
│       ├── AnalyticsDashboard.tsx      ← Live analytics view
│       ├── ChatbotAuditorScreen.tsx    ← Chatbot query auditor
│       ├── SettingsPage.tsx            ← Settings / env config
│       ├── MakePage.tsx                ← AI Make Studio
│       └── make/
│           ├── AiMakeBar.tsx           ← Floating command input
│           └── DockedChatPanel.tsx     ← Right chat panel
│
├── lib/
│   ├── github.ts           ← All GitHub REST API calls (read/write content)
│   ├── route-helper.ts     ← Reusable GET+POST handler factory for content routes
│   ├── logger.ts           ← Pino-based structured logger
│   └── utils.ts            ← Shared utilities
│
├── store/
│   └── makeStore.ts        ← Zustand store (siteDocument, ghostDiff, versions, AI state)
│
└── middleware.ts            ← Cookie-based auth guard for all routes
```

---

## Critical Rules for AI Agents

### 1. Content Route Pattern
All content routes (projects, profile, skills, etc.) use the **same factory**:
```typescript
// In any route.ts file:
import { createContentRoute } from "@/lib/route-helper";
const handler = createContentRoute("filename.json", "commit-label");
export const GET = handler.GET;
export const POST = handler.POST;
```
`createContentRoute` handles: local file read → GitHub API fallback → local write → GitHub commit.

### 2. Never Hardcode Project Slugs
On the **Portfolio frontend** (`HomePage.tsx`), featured projects use:
```typescript
finalProjects.slice(0, 4).map(...)  // CORRECT
```
**Never** use `const FEATURED_SLUGS = ["aquadot", "smartflow-iv"]` — if a slug changes in the CMS, a static lookup silently breaks.

### 3. Zustand Store Versioning
When calling `addVersion(label, data)`, `newId` **must** be computed as:
```typescript
Math.max(...versions.map(v => v.id), 0) + 1
```
Using `versions.length + 1` causes key collisions when versions are deleted.

### 4. Auth Middleware
All routes except `/login` and `/api/auth/*` are protected by `src/middleware.ts`. The session cookie is `cms_session` and must equal `ADMIN_PASSWORD`.

### 5. Environment Variables
Never commit `.env.local`. Never log full API keys. The GitHub token needs `repo` scope (read + write contents).

---

## API Routes Summary

| Route | Method | File Written | Notes |
|-------|--------|-------------|-------|
| `/api/projects` | GET, POST | `projects.json` | |
| `/api/profile` | GET, POST | `profile.json` | |
| `/api/skills` | GET, POST | `skills.json` | |
| `/api/experience` | GET, POST | `experience.json` | |
| `/api/chatbot` | GET, POST | `chatbot.json` | |
| `/api/tokens` | GET, POST | `tokens.json` | Triggers theme update at next build |
| `/api/queries` | GET, POST | `queries.json` | Chatbot query log |
| `/api/make` | POST | — | AI generation; returns JSON patch only |
| `/api/analytics` | GET | — | GA4 → GitHub fallback → git log |
| `/api/settings` | GET, POST | — | In-memory/session settings |
| `/api/publish` | POST | — | Triggers GitHub Pages CI rebuild |
| `/api/auth/login` | POST | — | Sets `cms_session` cookie |
| `/api/auth/logout` | POST | — | Clears cookie |
| `/api/github` | GET | — | Lists recent commits |

---

## State Machine: Make AI Studio

```
idle
 │  user types + submits
 ▼
generating
 │  /api/make returns JSON patch
 ▼
result
 │  ghostDiff = { before: current, after: patch }
 │
 ├──[Accept]──► POST /api/{section} ──► committed = true ──► idle
 │
 └──[Discard]──► restore siteDocument ──► ghostDiff = null ──► idle
```

---

## Supported AI Providers (`/api/make`)

| Provider | Model | Env Key |
|----------|-------|---------|
| Gemini (default) | gemini-2.5-flash-latest | `GEMINI_API_KEY` |
| Groq | llama-3.3-70b-versatile | `GROQ_API_KEY` |
| NVIDIA NIM | llama-3.1-nemotron-ultra-253b | `NVIDIA_API_KEY` |
| OpenRouter | configurable | `OPENROUTER_API_KEY` |
| Ollama Cloud | qwen2.5-coder | `OLLAMA_CLOUD_API_KEY` |

---

## Development Commands

```bash
npm run dev          # Start dev server → http://localhost:3000
npm run build        # Production build
npm run test         # Vitest unit + integration tests
npx playwright test  # E2E tests
```

---

## Key Files to Know

| File | Why It Matters |
|------|---------------|
| `src/lib/github.ts` | All GitHub API interactions — getFile, getContentJSON, saveContentJSON |
| `src/lib/route-helper.ts` | Reusable dual-write (local + GitHub) handler for all content routes |
| `src/store/makeStore.ts` | Full Zustand store — siteDocument, ghostDiff, versions, AI state |
| `src/middleware.ts` | Auth guard — protects all routes except login/auth |
| `src/app/api/analytics/route.ts` | GA4 integration with GitHub traffic fallback |
| `src/app/api/make/route.ts` | Multi-provider AI patch generation |
| `docs/END_TO_END.md` | Full system architecture and data flow |
