# LK Portfolio — End-to-End System Guide

> **For AI agents, new developers, or anyone onboarding to this codebase.**  
> This document explains the full system from a CMS edit to a live deployed website.

---

## System Overview

The LK Portfolio is a **two-repo, three-layer architecture**:

```
┌──────────────────────────────────┐
│  PORTFOLIO-MANAGER (CMS)         │  http://localhost:3000
│  Next.js 15 · App Router         │  ← You edit content here
│  Password-protected local app    │
└──────────────┬───────────────────┘
               │ GitHub REST API commits JSON
               ▼
┌──────────────────────────────────┐
│  GitHub Repository               │  github.com/Lalitkishore2/portfolio
│  content/*.json  (the database)  │  ← Single source of truth
│  src/ (Astro portfolio code)     │
└──────────────┬───────────────────┘
               │ GitHub Actions trigger on push
               ▼
┌──────────────────────────────────┐
│  PORTFOLIO (Static Site)         │  https://lalitkishore.is-a.dev
│  Astro 5 · GitHub Pages          │  ← Public-facing site
│  Pure HTML/CSS/JS, zero secrets  │
└──────────────────────────────────┘
```

---

## Repos & Local Paths

| Repo | Local Path | URL |
|------|-----------|-----|
| Portfolio (public site) | `C:\Users\LALITKO\Desktop\projects\PORTFOLIO` | https://lalitkishore.is-a.dev |
| Portfolio Manager (CMS) | `C:\Users\LALITKO\Desktop\projects\PORTFOLIO-MANAGER` | http://localhost:3000 |

---

## Step-by-Step Data Flow

### 1. Edit Content in the CMS

The CMS runs at **http://localhost:3000**. Login with `ADMIN_PASSWORD` from `.env.local`.

The CMS sidebar sections:
- **Projects** → `content/projects.json`
- **Profile & Bio** → `content/profile.json`
- **Experience** → `content/experience.json`
- **Skills** → `content/skills.json`
- **Make (AI Studio)** → AI-assisted content generation
- **Analytics** → GA4 traffic + GitHub activity dashboard
- **Chatbot Auditor** → `content/chatbot.json` / `content/queries.json`
- **Design Tokens** → `content/tokens.json`
- **Settings** → Runtime API key / model selection

### 2. Save → Dual-Write (Local + GitHub)

When you click **Save**, `src/lib/route-helper.ts` does two things in sequence:

```
Save Button Click
       │
       ▼
POST /api/{section}
       │
       ├─► 1. Write locally:
       │       PORTFOLIO/content/{file}.json   (instant live preview at localhost:4321)
       │
       └─► 2. GitHub REST API:
               PUT /repos/Lalitkishore2/portfolio/contents/content/{file}.json
               (commits to main branch → triggers CI/CD)
```

### 3. GitHub Actions → Build → Deploy

On every push to `main`, `.github/workflows/deploy.yml` runs:

```
1. npm run validate:content   (Zod schema validation)
2. npm run build              (Astro generates dist/)
3. Deploy dist/ → GitHub Pages
```

Live at `https://lalitkishore.is-a.dev` within ~2-3 minutes of saving.

### 4. Design Tokens → Live Theme

`content/tokens.json` controls the site color palette. `Layout.astro` reads it at build time and injects CSS custom properties:

```
tokens.json → Layout.astro (fs.readFileSync) → <style> :root CSS vars
                                                 (--primary, --background, etc.)
```

---

## AI Generation Flow (Make Studio)

```
User types prompt
       │
       ▼
POST /api/make
       │  (sends: prompt + current section JSON + target section name)
       ▼
AI Provider (Gemini/Groq/NVIDIA/Ollama/OpenRouter)
       │  (returns: JSON patch)
       ▼
Zustand Store: ghostDiff = { before, after }
       │
       ├─► Live Preview iframe reloads (non-destructive, local memory only)
       │
       ├─► [Accept] → POST /api/{section} → dual-write (local + GitHub)
       │
       └─► [Discard] → restore siteDocument from ghostDiff.before, no write
```

---

## Analytics Flow (GA4)

```
GET /api/analytics
       │
       ├─► Google Analytics Data API (GA4)
       │     Property: 507163958
       │     Service Account: analytics-api-reader@lalitkishore-portfolio.iam.gserviceaccount.com
       │     Returns: daily screenPageViews for last 365 days
       │
       ├─► GitHub API (fallback if GA4 not configured)
       │     GET /repos/{repo}/traffic/views
       │
       ├─► git log -n 5 (real commit history for activity feed)
       │
       └─► content/projects.json (real project/skill counts for KPI cards)
```

---

## CMS API Routes Reference

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/projects` | GET, POST | Read/write `projects.json` |
| `/api/profile` | GET, POST | Read/write `profile.json` |
| `/api/skills` | GET, POST | Read/write `skills.json` |
| `/api/experience` | GET, POST | Read/write `experience.json` |
| `/api/chatbot` | GET, POST | Read/write `chatbot.json` |
| `/api/tokens` | GET, POST | Read/write `tokens.json` |
| `/api/queries` | GET, POST | Read/write `queries.json` |
| `/api/make` | POST | AI content generation (multi-provider) |
| `/api/analytics` | GET | GA4 + GitHub traffic + git commits |
| `/api/settings` | GET, POST | Runtime model/API key settings |
| `/api/publish` | POST | Trigger GitHub Pages CI rebuild |
| `/api/auth/login` | POST | Set `cms_session` cookie |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/github` | GET | List repo commits/status |

All content routes use `createContentRoute(filename, label)` from `src/lib/route-helper.ts`:
- **GET**: Reads local file first → falls back to GitHub API
- **POST**: Writes locally → syncs to GitHub

---

## Environment Variables

### PORTFOLIO-MANAGER `.env.local`

```env
# GitHub (required)
GITHUB_REPO="Lalitkishore2/portfolio"
CMS_GITHUB_TOKEN="ghp_..."
GITHUB_BRANCH="main"

# Auth (required)
ADMIN_PASSWORD="your-password"

# AI Providers (at least one required for Make Studio)
GEMINI_API_KEY="AIza..."
GROQ_API_KEY="gsk_..."
NVIDIA_API_KEY="nvapi-..."
OPENROUTER_API_KEY="sk-or-v1-..."
OLLAMA_CLOUD_URL="https://api.ollamacloud.io"
OLLAMA_CLOUD_API_KEY="..."

# Analytics — GA4 (optional, enables live traffic chart)
GA_PROPERTY_ID="507163958"
GA_CLIENT_EMAIL="analytics-api-reader@lalitkishore-portfolio.iam.gserviceaccount.com"
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Portfolio dev server
ASTRO_PREVIEW_URL="http://localhost:4321"
DEFAULT_AI_MODEL="gemini"
```

### PORTFOLIO `.env`

```env
PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

---

## Content Files Schema

| File | Description | Key Fields |
|------|-------------|-----------|
| `projects.json` | Case study projects array | `id`, `slug`, `title`, `category`, `accent`, `year`, `tech[]`, `metrics[]` |
| `profile.json` | Personal info & bio | `name`, `tagline`, `bio`, `socials{}`, `education[]`, `tickerItems[]` |
| `skills.json` | Technical skills by category | Array of `{ category, skills[] }` |
| `experience.json` | Work/edu timeline | Array of `{ title, org, period, tags[], highlights[] }` |
| `chatbot.json` | Chatbot knowledge base | `name`, `greeting`, `systemPrompt`, `knowledgeBase[]` |
| `tokens.json` | Design theme tokens | `primary`, `background`, `surface`, `textMain`, `textMuted`, `fontPrimary`, `fontMono` |
| `queries.json` | Visitor chatbot query log | Array of `{ id, query, response, status, timestamp }` |

---

## Running Locally

```bash
# Terminal 1 — Portfolio public site
cd C:\Users\LALITKO\Desktop\projects\PORTFOLIO
npm run dev        # → http://localhost:4321

# Terminal 2 — CMS
cd C:\Users\LALITKO\Desktop\projects\PORTFOLIO-MANAGER
npm run dev        # → http://localhost:3000
```

Both must run simultaneously for CMS live preview (iframe at localhost:4321) to work.

---

## Key Architecture Decisions

| Decision | Rationale |
|----------|----------|
| JSON files as database | Zero infrastructure, version-controlled history, works with static SSG |
| GitHub API for persistence | No database server; content history is the git log |
| Dual-write (local + GitHub) | Local write = instant preview; GitHub write = triggers deployment |
| Astro for public site | Near-zero JS by default; fast static HTML from JSON |
| Next.js for CMS | Server-side auth, API routes, session cookies |
| Zustand store | Lightweight persistent state; ghost diff enables non-destructive AI edits |
| GA4 service account | Real traffic analytics without exposing tokens to the public site |
