# Portfolio Manager CMS

A Next.js administration panel and AI generation studio designed to manage and validate updates to the Deconstructivist Portfolio content database.

## Key Features

- **Figma AI Design Standard**: Modeled after Figma Make AI interactions featuring a floating bottom command bar (`MakeCommandBar`) and a docked right chat panel (`DockedChatPanel`).
- **Live Canvas Preview**: Real-time live previews directly inside the visual canvas iframe prior to persistence.
- **Non-Destructive Write Flow**: AI-generated JSON patches are previewed locally with sticky Accept/Discard controls, avoiding accidental or corrupted database commits.
- **Decoupled Architecture**: Directly manages JSON content files (`projects.json`, `profile.json`, `skills.json`, `experience.json`, `chatbot.json`) in a remote GitHub repository.
- **Multi-Provider AI Engine**: Supports Gemini Flash, Groq Llama 3.3, NVIDIA Llama 3.1, Ollama (Qwen 2.5 Coder), and OpenRouter.

## Architecture Overview

```mermaid
flowchart TD
    subgraph Frontend [Portfolio Manager CMS]
        UI[React UI / Tailwind]
        Zustand[Zustand Store makeStore]
        Pill[MakeCommandBar]
        Dock[DockedChatPanel]
        Preview[Live Canvas Iframe Preview]
        UI <--> Zustand
        Pill --> Zustand
        Zustand <--> Dock
        Zustand <--> Preview
    end

    subgraph Backend [Next.js API Routes]
        Auth[Auth Service]
        GHAPI[GitHub API Service]
        AIAgents[/api/make Route Handler]
    end

    subgraph Storage [GitHub Repository]
        JSON[(JSON Database)]
        Assets[Static Images / Files]
    end
    
    subgraph Client [Portfolio Site]
        Astro[Portfolio Frontend Astro / Next]
    end

    UI -- HTTP --> Backend
    AIAgents -- HTTP --> ExternalAI[External AI Providers Gemini / Groq / Ollama / NVIDIA]
    GHAPI -- Commits JSON --> Storage
    Storage -- Triggers SSG Build --> Client
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:
- [Architecture Guide](./docs/ARCHITECTURE.md) - Details on serverless architecture, state machines, and GitHub API integration.
- [Figma AI Workflow & UX Specification](./docs/FIGMA_AI_WORKFLOW.md) - Specifications for the Figma Make design system, live preview machine, and chat panel.
- [API Reference](./docs/API.md) - Schema definitions for `/api/make` and internal Next.js Route Handlers.
- [Onboarding & Environment Setup](./docs/ONBOARDING.md) - Instructions for configuring environment variables and local testing.
- [Agent System Guide](./AGENTS.md) - Context guide for AI agents working on this codebase.

## Quick Start

### Prerequisites
- Node.js (v18 or higher, v22 recommended)
- A GitHub Personal Access Token (PAT)

### Installation
Clone the repository and install dependencies (note the legacy peer dependencies flag required for UI components):
```bash
npm install --legacy-peer-deps
```

### Local Development
Start the local development server:
```bash
npm run dev
```
The CMS will be available at `http://localhost:3000`.

## Deployment

This project is configured for serverless deployment on Vercel:
1. Import the repository via the Vercel dashboard.
2. Set the root directory configuration to the main project folder.
3. Configure the strictly required environment variables (`GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, `ADMIN_PASSWORD`).
4. Deploy the application.

## Testing

This project utilizes Vitest and Playwright to ensure the stability of the API routes and UI.
```bash
# Run Unit and Integration tests
npm run test

# Run End-to-End Browser tests
npx playwright test
```
