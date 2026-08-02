<!-- BEGIN:nextjs-agent-rules -->
# 🤖 Portfolio Manager CMS — Agent System Guide

This document is the authoritative context manual for any AI agent working on the LK Portfolio Manager CMS codebase.

---

## 1. System Overview & Architecture

The **Portfolio Manager** is a decoupled, headless CMS built with **Next.js 16 (App Router)** and **Tailwind CSS**. It acts as the administration panel and AI generation studio for the portfolio website.

- **No Traditional Database**: Data lives as structured JSON files (`projects.json`, `profile.json`, `skills.json`, `experience.json`, `chatbot.json`) in an external GitHub repository.
- **Persistence Pipeline**: UI edits or accepted AI patches trigger `/api/{section}` route handlers, which call `saveContentJSON` in `src/lib/github.ts` to commit changes directly via the GitHub REST API (`PUT /repos/{owner}/{repo}/contents/{path}`).
- **Decoupled Frontend**: The portfolio site (Astro/Next.js at `http://localhost:4321`) reads this JSON data via static imports or API fetching.

---

## 2. Figma AI Integration & UX Architecture

The AI studio (`MakePage.tsx`) implements **Figma AI (Figma Make)** design patterns and interaction standards:

### Key UI Components & Locations
1. **`MakeCommandBar` (`src/components/cms/make/AiMakeBar.tsx`)**:
   - Floating, pill-shaped command input anchored at the bottom center.
   - Minimalist: single send button, image attach option, and contextual selection chip (`Editing {section}`).
   - Non-intrusive: does not block the canvas or render full-screen modal overlays during generation.

2. **`DockedChatPanel` (`src/components/cms/make/DockedChatPanel.tsx`)**:
   - Right-side docked panel (replaces the Inspector `RightDock` when `chatOpen` is `true`).
   - Renders message thread history, expandable reasoning trails (`● Reading projects data...`), and proposed patches.
   - **Sticky Action Footer**: The `[✓ Accept]` and `[Discard]` buttons are permanently docked at the bottom of the chat panel.

3. **Live Canvas Preview & Non-Destructive Write Flow**:
   - **Step 1 (Generation)**: User prompts Make -> `/api/make` returns a JSON patch -> Store updates `ghostDiff = { before, after }`.
   - **Step 2 (Live Canvas Preview)**: `siteDocument[targetSection]` is mutated in local Zustand memory ONLY. The iframe reloads to show the rendered change in real time.
   - **Step 3 (Commit or Revert)**:
     - **Accept**: Calls `/api/{targetSection}` (HTTP POST) to commit to GitHub, adds a version entry to `versions` array, and clears `ghostDiff`.
     - **Discard**: Restores `siteDocument[targetSection]` to `ghostDiff.before` and clears `ghostDiff`. No server write occurs.

---

## 3. Store Contracts (`src/store/makeStore.ts`)

State management relies on Zustand with persistence (`make-storage` in localStorage).

### Key State Fields & Actions
- `siteDocument`: Complete JSON document object containing all section data (`{ projects, profile, skills, experience }`).
- `generationState`: `"idle" | "generating" | "result"`.
- `ghostDiff`: `{ before: any, after: any } | null` storing uncommitted AI proposals.
- `chatOpen`: Boolean controlling whether `DockedChatPanel` is visible on the right.
- `versions`: Array of `Version` objects (`{ id, timestamp, label, data }`).
- `addVersion(label, data)`: Creates a new version entry. **Must always calculate `newId` as `Math.max(...versions.map(v => v.id), 0) + 1`** to avoid React key collisions (`Encountered two children with the same key`).

---

## 4. Backend & API Endpoints

| Route | Purpose | Key Details |
|---|---|---|
| `/api/make` | AI Patch Generation Handler | Supports Gemini (`gemini-flash-latest`), Groq, NVIDIA, Ollama, OpenRouter. Uses `jsonrepair` to recover malformed AI responses into clean JSON patches. |
| `/api/projects` | `projects.json` CRUD | Reads/writes GitHub contents via `src/lib/github.ts`. |
| `/api/profile` | `profile.json` CRUD | Manages portfolio tagline, bio, socials, ticker items. |
| `/api/skills` | `skills.json` CRUD | Manages technical skill categories and tags. |
| `/api/experience` | `experience.json` CRUD | Manages work history and timeline entries. |
| `/api/chatbot` | Telemetry & Audit | Logged queries from the chatbot auditor. |

---

## 5. Frontend & CMS Alignment Gotchas

1. **Dynamic Project Slicing**:
   - In `HomePage.tsx`, featured projects are rendered via `finalProjects.slice(0, 4).map(...)`.
   - **NEVER** use hardcoded slug arrays (e.g., `const FEATURED_SLUGS = ["aquadot", "smartflow-iv"]`) on the frontend, because if the user or AI renames a slug (e.g. to `smartflow-div`), a missing lookup will throw an error or drop the section completely.

2. **React Key Safety**:
   - Always verify unique `key` props when mapping items. Use IDs, slugs, or safe fallback indexes.

3. **Tailwind & Styling Tokens**:
   - Use standardized `FigmaCard` and `FigmaInput` primitives in `src/components/cms/figma/` for CMS pages (`SkillsPage`, `ExperiencePage`, etc.) to maintain visual consistency.

---

## 6. Verification & Test Commands

- **Dev Server**: `npm run dev` (CMS on `http://localhost:3000`, Portfolio on `http://localhost:4321`)
- **Unit & Integration Tests**: `npm run test`
- **End-to-End Tests**: `npx playwright test`
<!-- END:nextjs-agent-rules -->
