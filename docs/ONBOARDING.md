# Portfolio Manager CMS — Onboarding Guide

This guide covers everything needed to get the CMS running from scratch.

---

## Prerequisites

- **Node.js** v18 or higher (v22 recommended)
- **Git** installed
- A **GitHub Personal Access Token** (PAT) with `repo` scope
- At least one **AI provider API key** (Gemini is recommended and free-tier available)

---

## Step 1: Clone & Install

```bash
git clone https://github.com/Lalitkishore2/portfolio-manager.git
cd portfolio-manager
npm install --legacy-peer-deps
```

> The `--legacy-peer-deps` flag is required for some UI component dependencies.

---

## Step 2: Configure Environment

Create a `.env.local` file in the root of `PORTFOLIO-MANAGER`:

```env
# ── GitHub (REQUIRED) ──────────────────────────────────────────────────────
GITHUB_REPO="Lalitkishore2/portfolio"
CMS_GITHUB_TOKEN="ghp_..."         # PAT with repo:read + repo:write scope
GITHUB_BRANCH="main"

# ── CMS Auth (REQUIRED) ────────────────────────────────────────────────────
ADMIN_PASSWORD="your-secure-password"

# ── AI Providers (at least one required for Make Studio) ───────────────────
GEMINI_API_KEY="AIza..."           # https://aistudio.google.com/app/apikey
GROQ_API_KEY="gsk_..."            # https://console.groq.com
NVIDIA_API_KEY="nvapi-..."        # https://build.nvidia.com
OPENROUTER_API_KEY="sk-or-v1-..."
OLLAMA_CLOUD_URL="https://api.ollamacloud.io"
OLLAMA_CLOUD_API_KEY="..."

# ── Google Analytics GA4 (OPTIONAL) ────────────────────────────────────────
# Enables real traffic data in the Analytics dashboard
# See "GA4 Setup" section below for how to get these values
GA_PROPERTY_ID="507163958"
GA_CLIENT_EMAIL="analytics-api-reader@your-project.iam.gserviceaccount.com"
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# ── Portfolio Dev Server ────────────────────────────────────────────────────
ASTRO_PREVIEW_URL="http://localhost:4321"
DEFAULT_AI_MODEL="gemini"
```

---

## Step 3: Run

```bash
# Terminal 1 — CMS
npm run dev
# → http://localhost:3000

# Terminal 2 — Portfolio site (for live preview in CMS iframe)
cd ../PORTFOLIO
npm run dev
# → http://localhost:4321
```

Open http://localhost:3000, enter your `ADMIN_PASSWORD` to log in.

---

## GitHub PAT Setup

1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Select scopes: `repo` (full control of private repositories)
4. Set expiration as needed
5. Copy the token → paste into `.env.local` as `CMS_GITHUB_TOKEN`

---

## GA4 Analytics Setup

To enable real traffic data in the Analytics dashboard:

### 1. Create a Google Cloud Project
- Go to https://console.cloud.google.com
- Create a new project (or use existing)

### 2. Enable the API
- Navigate to **APIs & Services → Library**
- Search for **"Google Analytics Data API"**
- Click **Enable**

### 3. Create a Service Account
- Go to **APIs & Services → Credentials**
- Click **Create Credentials → Service Account**
- Name it (e.g., `analytics-api-reader`)
- Skip role assignment (not needed at this level)
- Click **Done**

### 4. Create a Key
- Click the service account → **Keys → Add Key → Create new key → JSON**
- Download the JSON key file
- From the file, copy:
  - `client_email` → `GA_CLIENT_EMAIL`
  - `private_key` → `GA_PRIVATE_KEY` (the full `-----BEGIN PRIVATE KEY-----...` block)

### 5. Grant Access in GA4
- Open https://analytics.google.com
- Go to **Admin → Property Access Management**
- Click **+** → Add users
- Enter the service account email
- Set role to **Viewer**
- Click **Add**

### 6. Get Property ID
- In GA4 Admin → **Property Settings**
- Copy the **Property ID** (numeric only, e.g. `507163958`)
- Set as `GA_PROPERTY_ID` in `.env.local`

> **Note:** GA4 data may show 0 rows for newly created properties until visitors are tracked. The dashboard will still show `"Live Website Data (GA4)"` badge confirming the connection is working.

---

## Troubleshooting

### "Failed to save" when saving content
- Check that `CMS_GITHUB_TOKEN` is set and has `repo` write access
- Verify `GITHUB_REPO` is correct (format: `username/repo`)
- Check the terminal for `[DEBUG] Fetching ...` logs

### Analytics shows "Mock Data"
- Verify `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, and `GA_PRIVATE_KEY` are all set
- Check that the service account has been added to GA4 with Viewer role
- Restart the dev server after updating `.env.local` (Next.js doesn't hot-reload env changes)

### CMS redirects to /login after saving
- The session cookie may have expired; log in again
- Ensure `ADMIN_PASSWORD` hasn't changed between server restarts

### AI Make shows no response
- Verify the API key for your selected model is set correctly
- Try switching models in Settings
- Check browser console for API errors

---

## Testing

```bash
# Unit + integration tests
npm run test

# End-to-end browser tests
npx playwright test
```
