# Portfolio Manager CMS

A Next.js 15 administration panel and AI generation studio for managing the [Deconstructivist Portfolio](https://lalitkishore.is-a.dev) — built by S V Lalitkishore.

> **Full system guide:** [`docs/END_TO_END.md`](./docs/END_TO_END.md)  
> **AI agent context:** [`AGENTS.md`](./AGENTS.md)

---

## Features

- **Content Management** — Edit projects, profile, skills, experience, and chatbot knowledge via a rich CMS UI
- **AI Make Studio** — Figma-style AI content generation with live preview and Accept/Discard controls (Gemini, Groq, NVIDIA, Ollama, OpenRouter)
- **Live Canvas Preview** — Real-time iframe preview of the portfolio site before committing changes
- **Non-Destructive Writes** — AI patches are previewed in memory; only committed when explicitly accepted
- **Design Tokens** — Edit the site color palette and font theme; changes propagate to the public site at next build
- **Analytics Dashboard** — Live GA4 traffic chart, real git commit history, project/skill counts
- **Chatbot Auditor** — Review and resolve visitor chatbot queries
- **GitHub Integration** — All content stored as JSON files in the portfolio repo; committed via GitHub REST API

---

## Architecture

```
Browser (CMS UI)
     │ React/Zustand
     ▼
Next.js 15 (App Router)          http://localhost:3000
     │ API routes (/api/*)
     ├──► GitHub REST API  ──►  content/*.json  (the database)
     ├──► AI Providers     ──►  JSON patch generation
     ├──► GA4 Data API     ──►  Traffic analytics
     └──► Git (local)      ──►  Commit history feed

GitHub Repository (Lalitkishore2/portfolio)
     │ content/*.json changes trigger:
     ▼
GitHub Actions  ──►  Astro Build  ──►  GitHub Pages  ──►  lalitkishore.is-a.dev
```

---

## Quick Start

### Prerequisites
- Node.js 18+ (v22 recommended)
- GitHub PAT with `repo` scope (read + write)
- At least one AI provider API key (Gemini recommended)

### Installation

```bash
git clone https://github.com/Lalitkishore2/portfolio-manager.git
cd portfolio-manager
npm install --legacy-peer-deps
```

### Configure Environment

Copy the template and fill in your values:

```bash
# Create .env.local with:
GITHUB_REPO="Lalitkishore2/portfolio"
CMS_GITHUB_TOKEN="ghp_..."
GITHUB_BRANCH="main"
ADMIN_PASSWORD="your-secure-password"
GEMINI_API_KEY="AIza..."
ASTRO_PREVIEW_URL="http://localhost:4321"
```

See [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) for the full environment variable list including GA4 analytics setup.

### Run

```bash
npm run dev
# CMS: http://localhost:3000
```

Also run the portfolio dev server in a separate terminal for live preview:
```bash
cd ../PORTFOLIO && npm run dev
# Portfolio: http://localhost:4321
```

---

## Project Structure

```
src/
├── app/api/         ← 14 Next.js API route handlers
├── components/cms/  ← All CMS UI pages and components
├── lib/
│   ├── github.ts        ← GitHub REST API service
│   ├── route-helper.ts  ← Reusable dual-write content route factory
│   └── logger.ts        ← Structured logging
├── store/makeStore.ts   ← Zustand state (siteDocument, AI state, versions)
└── middleware.ts        ← Cookie auth guard
```

---

## Documentation

| Doc | Description |
|-----|-------------|
| [`docs/END_TO_END.md`](./docs/END_TO_END.md) | **Start here** — Full system flow from CMS edit to live site |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Component architecture, state machine, data flow diagrams |
| [`docs/API.md`](./docs/API.md) | All 14 API routes with request/response schemas |
| [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) | Environment setup, GA4 configuration, first run |
| [`AGENTS.md`](./AGENTS.md) | AI agent context guide — rules, gotchas, patterns |

---

## Testing

```bash
npm run test          # Vitest unit + integration tests
npx playwright test   # E2E browser tests
```

---

## Deployment

This CMS is designed to run **locally only** (never deployed publicly). It manages a remote portfolio site deployed on GitHub Pages.

To run from a different machine:
1. Clone this repo
2. Configure `.env.local` (see [ONBOARDING.md](./docs/ONBOARDING.md))
3. `npm run dev`
