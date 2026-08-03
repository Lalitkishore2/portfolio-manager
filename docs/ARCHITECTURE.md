# Portfolio Manager CMS — Architecture Guide

## Component Architecture

```
App.tsx (CMS shell + client-side router)
├── CMSSidebar.tsx          ← Left sidebar navigation (collapsed icon / expanded text)
│
├── ProjectList.tsx         ← Grid view of all projects
├── ProjectEditor.tsx       ← Full CRUD editor for a single project
│   └── ProjectEditorComponents.tsx  ← Sub-components (tech tags, metrics, nodes)
│
├── ProfilePage.tsx         ← Profile/bio editor (name, tagline, socials, ticker)
├── SkillsPage.tsx          ← Skills category + tags editor
├── ExperiencePage.tsx      ← Timeline entries editor
├── TokensPage.tsx          ← Design tokens (colors + fonts)
│
├── MakePage.tsx            ← AI Make Studio canvas
│   ├── AiMakeBar.tsx       ← Floating pill command input (bottom center)
│   └── DockedChatPanel.tsx ← Right chat panel with message history + Accept/Discard
│
├── AnalyticsDashboard.tsx  ← GA4 traffic chart + git activity + KPI cards
├── ChatbotAuditorScreen.tsx← Visitor query review + resolve
│
└── SettingsPage.tsx        ← Runtime settings (AI model, API keys, env info)
```

---

## State Machine: Zustand Store (`makeStore.ts`)

### Key State Fields

| Field | Type | Purpose |
|-------|------|---------|
| `siteDocument` | `object` | Full content object `{ projects, profile, skills, experience }` |
| `generationState` | `"idle" \| "generating" \| "result"` | AI generation phase |
| `ghostDiff` | `{ before: any, after: any } \| null` | Uncommitted AI proposal |
| `chatOpen` | `boolean` | Whether DockedChatPanel is visible |
| `versions` | `Version[]` | Version history array `{ id, timestamp, label, data }` |
| `targetSection` | `string` | Which section the AI is currently editing |

### addVersion Safety Rule

```typescript
// CORRECT: prevents key collisions after deletes
const newId = Math.max(...versions.map(v => v.id), 0) + 1;

// WRONG: breaks if versions have been deleted
const newId = versions.length + 1;
```

---

## Data Flow: Content Read/Write

### Read (GET)

```
CMS page mounts
       │
       ▼
fetch("/api/{section}")
       │
       ▼
route-helper.ts GET handler
       │
       ├─► Check local file: PORTFOLIO/content/{file}.json
       │     ↳ If exists: return immediately (fast, avoids GitHub rate limit)
       │
       └─► Fallback: GitHub API GET /repos/{repo}/contents/content/{file}.json
               ↳ If 404: return safe empty default ({} or [])
```

### Write (POST)

```
User clicks Save
       │
       ▼
fetch("/api/{section}", { method: "POST", body: JSON.stringify({ data, sha }) })
       │
       ▼
route-helper.ts POST handler
       │
       ├─► 1. fs.writeFileSync(localPath)     ← instant local update
       │
       └─► 2. GitHub API PUT /repos/{repo}/contents/content/{file}.json
               ├── base64-encoded content
               ├── commit message: "cms: update {label}"
               └── sha: required to prevent overwrite conflicts
```

---

## GitHub API Service (`github.ts`)

### Functions

| Function | Purpose |
|----------|---------|
| `getFile(path)` | Raw file fetch from repo |
| `getContentJSON(filename)` | Parse JSON from content/ directory, returns `{ data, sha }` |
| `saveContentJSON(filename, data, message, sha)` | Commit JSON to content/ directory |
| `listFiles(dir)` | List files in a directory |
| `uploadImage(path, base64, sha?)` | Upload/replace a binary file |

### Auth

Uses `CMS_GITHUB_TOKEN` or `GITHUB_TOKEN` env var. Token must have `repo` scope (full read/write).

---

## Authentication (`middleware.ts`)

```
Every request
       │
       ▼
Does ADMIN_PASSWORD env var exist?
       │
       ├─► No → bypass (dev mode with no password set)
       │
       └─► Yes → check request.cookies["cms_session"]
               │
               ├─► === ADMIN_PASSWORD → allow
               │
               └─► !== ADMIN_PASSWORD → redirect to /login
                       (except /login and /api/auth/* routes)
```

---

## AI Make Pipeline (`/api/make`)

### Request

```typescript
{
  prompt: string,           // User's instruction
  section: string,          // e.g. "projects", "profile"
  currentData: any,         // Current section JSON
  model?: string            // "gemini" | "groq" | "nvidia" | "ollama" | "openrouter"
}
```

### Response

```typescript
{
  ok: true,
  patch: any,               // Updated section JSON (full replacement or partial patch)
  reasoning: string[]       // Step-by-step reasoning trail shown in chat panel
}
```

### Provider Selection

Checked in order: `model` param → `DEFAULT_AI_MODEL` env → `"gemini"`.  
Each provider uses `jsonrepair` to recover malformed AI JSON responses.

---

## Analytics Route (`/api/analytics`)

### Response

```typescript
{
  ok: true,
  trafficData: Array<{ day: string, views: number }>,  // Last 30 days (or 14 placeholders)
  trafficSource: "GA4" | "GitHub" | "MOCK",
  commits: Array<{ hash, message, relativeTime, date }>,
  categoryStats: Array<{ name, value, count }>,
  unresolvedQueries: number,
  resolvedQueries: number,
  totalQueries: number,
  coverageRate: number,
  lastSync: string
}
```

### GA4 Setup

1. Create a Google Cloud service account
2. Enable the Google Analytics Data API
3. Grant the service account `Viewer` role in GA4 Admin → Property Access Management
4. Download the JSON key file
5. Copy `client_email` and `private_key` to `.env.local` as `GA_CLIENT_EMAIL` and `GA_PRIVATE_KEY`
6. Set `GA_PROPERTY_ID` to your GA4 property ID (numeric only, e.g. `507163958`)
