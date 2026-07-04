# Portfolio Manager CMS

This is a standalone Next.js administration panel designed to manage and update the Deconstructivist Portfolio database. 

## Design and Features

The application is built using Next.js, Tailwind CSS, and Shadcn UI components, offering:
- Dynamic project editor with validation and custom architecture mapping.
- Profile, skills, and experience editors.
- AI-assisted page creation using model APIs.
- Chatbot knowledge auditor.
- Direct integration with GitHub API to manage updates remotely.

## How It Works

Instead of modifying a local filesystem, this CMS uses the GitHub REST API to read and commit updates to your portfolio repository. Saving changes in the CMS commits them directly to your repository's main branch, which automatically triggers your portfolio's deployment pipeline.

## Environment Configuration

Create a `.env.local` file in the root directory and configure the following variables:

```env
# GitHub Configuration
GITHUB_REPO="Lalitkishore2/portfolio"
GITHUB_BRANCH="main"
GITHUB_TOKEN="your_personal_access_token"

# AI Provider Configuration (Optional)
GEMINI_API_KEY="your_gemini_api_key"
GROQ_API_KEY="your_groq_api_key"
OPENROUTER_API_KEY="your_openrouter_api_key"
NVIDIA_API_KEY="your_nvidia_api_key"
OLLAMA_CLOUD_API_KEY="your_ollama_cloud_key"
OLLAMA_CLOUD_URL="https://api.ollamacloud.io"
```

## Getting Started

### Installation

Install the dependencies:
```bash
npm install --legacy-peer-deps
```

### Development

Start the Next.js development server:
```bash
npm run dev
```
The admin panel will be available at http://localhost:3000.

### Build

Create a production build:
```bash
npm run build
```

## Remote Deployment

The project is configured for serverless deployment on platforms like Vercel:
1. Import the repository in Vercel.
2. Set the root directory configuration to the main project folder.
3. Configure the environment variables (`GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, and AI keys) in the Vercel project settings dashboard.
4. Deploy the application.
