# Developer Onboarding

Welcome to the Portfolio Manager repository. This guide covers how to set up the CMS locally and successfully configure the external integrations.

## 1. Local Environment Setup

### System Requirements
- OS: Windows, macOS, or Linux
- Runtime: Node.js (v18.x or newer). Node.js v22.x is recommended.
- Package Manager: `npm` (v9 or newer).

### Installation
Clone the repository and install dependencies. Note that `--legacy-peer-deps` must be supplied to bypass strict peer dependency conflicts with the Shadcn UI library.
```bash
npm install --legacy-peer-deps
```
Install the Playwright browser binaries for testing:
```bash
npx playwright install
```

## 2. Environment Configuration

You must create a `.env.local` file in the root of the project to run the application locally.

### Required Variables

1. **`ADMIN_PASSWORD`**: A secure string used to authenticate locally and in production. The Next.js middleware restricts access to the dashboard unless a valid session cookie derived from this password exists.
2. **`GITHUB_REPO`**: The target repository in the format `Owner/RepoName` (e.g., `octocat/portfolio`).
3. **`GITHUB_BRANCH`**: The target branch, usually `main`.
4. **`GITHUB_TOKEN`**: A GitHub Personal Access Token (PAT).

### Generating a GitHub PAT
To allow the CMS to read and write to your repository:
1. Navigate to GitHub > Settings > Developer Settings > Personal Access Tokens > Tokens (classic).
2. Click **Generate new token**.
3. Under Scopes, select `repo` (Full control of private repositories).
4. Generate the token and paste it into your `.env.local` file.

Example `.env.local`:
```env
ADMIN_PASSWORD="super_secure_password"
GITHUB_REPO="YourName/YourRepo"
GITHUB_BRANCH="main"
GITHUB_TOKEN="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

## 3. Development Workflow

Start the development server:
```bash
npm run dev
```

Navigate to `http://localhost:3000`. You will be immediately redirected to the `/login` page. Enter the `ADMIN_PASSWORD` to gain entry to the dashboard.

## 4. Testing

Ensure changes to the API handlers or components are strictly validated before deployment.
```bash
npm run test
npx playwright test
```
