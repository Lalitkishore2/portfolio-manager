# Portfolio Manager CMS — API Reference

All API routes are under `src/app/api/`. All content routes use `createContentRoute()` from `src/lib/route-helper.ts`.

Authentication: All routes require the `cms_session` cookie (set at login). Exception: `/api/auth/*`.

---

## Content Routes

These all follow the same pattern via `createContentRoute(filename, label)`.

### GET `/api/{section}`

Reads the content file. Checks local file first, falls back to GitHub API.

**Response:**
```json
{
  "data": <content object or array>,
  "sha": "<github blob sha for next write>"
}
```

### POST `/api/{section}`

Writes the content file locally and commits to GitHub.

**Request body:**
```json
{
  "data": <updated content>,
  "sha": "<sha from last GET, required to prevent conflicts>"
}
```

**Response:**
```json
{
  "success": true,
  "sha": "<new sha after commit>"
}
```

### Content Sections

| Route | Filename | Data Shape |
|-------|----------|-----------|
| `/api/projects` | `projects.json` | `Project[]` |
| `/api/profile` | `profile.json` | `Profile` object |
| `/api/skills` | `skills.json` | `SkillCategory[]` |
| `/api/experience` | `experience.json` | `Experience[]` |
| `/api/chatbot` | `chatbot.json` | `ChatbotConfig` object |
| `/api/tokens` | `tokens.json` | `DesignTokens` object |
| `/api/queries` | `queries.json` | `Query[]` |

---

## AI Make Route

### POST `/api/make`

Generates a JSON patch for a content section using an AI provider.

**Request:**
```json
{
  "prompt": "Make the bio more concise",
  "section": "profile",
  "currentData": { "...current profile.json..." },
  "model": "gemini"
}
```

**Response (success):**
```json
{
  "ok": true,
  "patch": { "...updated section data..." },
  "reasoning": [
    "Reading profile data...",
    "Analyzing bio length...",
    "Generating concise version..."
  ]
}
```

**Response (error):**
```json
{
  "ok": false,
  "error": "AI provider unavailable"
}
```

**Supported models:** `gemini`, `groq`, `nvidia`, `ollama`, `openrouter`

---

## Analytics Route

### GET `/api/analytics`

Returns dashboard data: traffic, commits, project stats, chatbot query counts.

**Response:**
```json
{
  "ok": true,
  "trafficSource": "GA4",
  "trafficData": [
    { "day": "Jul 21", "views": 0 },
    { "day": "Jul 22", "views": 42 }
  ],
  "commits": [
    {
      "hash": "da392b4",
      "message": "feat: update projects",
      "relativeTime": "2 hours ago",
      "date": "Sun Aug 3 2026 ..."
    }
  ],
  "categoryStats": [
    { "name": "IOT", "count": 3, "value": 33 }
  ],
  "unresolvedQueries": 2,
  "resolvedQueries": 4,
  "totalQueries": 6,
  "coverageRate": 66,
  "lastSync": "Aug 3, 2026"
}
```

`trafficSource` values:
- `"GA4"` — Connected to Google Analytics Data API (even if 0 rows, means API is live)
- `"GitHub"` — Using GitHub traffic API fallback
- `"MOCK"` — No analytics configured, showing generated placeholder data

---

## Settings Route

### GET `/api/settings`

Returns current runtime configuration.

**Response:**
```json
{
  "ok": true,
  "model": "gemini",
  "hasGemini": true,
  "hasGroq": true,
  "hasNvidia": false,
  "hasOllama": false,
  "hasGA4": true,
  "previewUrl": "http://localhost:4321"
}
```

### POST `/api/settings`

Updates runtime settings (in-memory, not persisted to file).

**Request:**
```json
{
  "model": "groq"
}
```

---

## Publish Route

### POST `/api/publish`

Triggers a GitHub Actions workflow to rebuild the portfolio site on GitHub Pages.

**Response (success):**
```json
{ "ok": true, "message": "Build triggered" }
```

---

## Auth Routes

### POST `/api/auth/login`

**Request:**
```json
{ "password": "your-admin-password" }
```

**Response (success):**
```json
{ "ok": true }
```
Sets `cms_session` cookie equal to `ADMIN_PASSWORD`.

### POST `/api/auth/logout`

Clears the `cms_session` cookie.

**Response:**
```json
{ "ok": true }
```

---

## GitHub Route

### GET `/api/github`

Returns recent commits from the portfolio repo.

**Response:**
```json
{
  "ok": true,
  "commits": [
    {
      "sha": "abc123",
      "message": "feat: add new project",
      "date": "2026-08-03T09:00:00Z",
      "author": "Lalitkishore2"
    }
  ]
}
```

---

## Content Type Schemas

### Project
```typescript
{
  id: string;
  slug: string;
  title: string;
  category: "IOT" | "HEALTHCARE" | "WEB" | "AI" | "OTHER";
  accent: string;          // hex color e.g. "#C6FF00"
  year: string;
  description: string;
  challenge?: string;
  solution?: string;
  impact?: string;
  tech: string[];
  metrics?: Array<{ label: string; value: string }>;
  nodes?: Array<{ id: string; label: string; type: string; connections: string[] }>;
  links?: { github?: string; demo?: string; paper?: string };
  coverImage?: string;
  images?: string[];
}
```

### DesignTokens
```typescript
{
  primary: string;      // hex color
  background: string;   // hex color
  surface: string;      // hex color
  textMain: string;     // hex color
  textMuted: string;    // hex color
  fontPrimary: string;  // font family name e.g. "Inter"
  fontMono: string;     // monospace font e.g. "JetBrains Mono"
}
```

### Query (chatbot query log)
```typescript
{
  id: string;
  query: string;
  response: string;
  status: "unreviewed" | "resolved" | "flagged";
  timestamp: string;   // ISO date
}
```
