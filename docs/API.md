# API Documentation

The Portfolio Manager utilizes internal Next.js Route Handlers to proxy requests between the client browser, external AI model APIs, and the GitHub REST API.

---

## 1. Authentication Routes

### `POST /api/auth/login`
Validates user credentials against the `ADMIN_PASSWORD` environment variable.
- **Request Body**: `{ "password": "string" }`
- **Success (200)**: `{ "success": true }` (sets `HttpOnly` cookie `cms_session`).
- **Error (401)**: `{ "error": "Invalid password" }`.

### `POST /api/auth/logout`
Destroys the active session by clearing the `cms_session` cookie.

---

## 2. AI Generation Endpoint

### `POST /api/make`
Processes natural language instructions, reads section JSON from GitHub, invokes the selected AI engine, and returns a sanitized JSON patch.

#### Request Body Schema
```json
{
  "prompt": "string (Required - prompt instruction)",
  "provider": "string (Optional - 'gemini' | 'groq' | 'nvidia' | 'ollama' | 'openrouter')",
  "targetSection": "string (Optional - 'projects' | 'profile' | 'skills' | 'experience')",
  "selectedNodeId": "string | null (Optional - selected canvas element ID)",
  "image": "string | null (Optional - base64 data URL for multimodal prompts)"
}
```

#### Supported AI Providers
- **`gemini`** (Default): Uses Google Gemini 1.5/2.5 via REST with structured `responseMimeType: "application/json"`.
- **`groq`**: Uses Groq Llama-3.3-70b-versatile with JSON mode.
- **`nvidia`**: Uses NVIDIA hosted Llama-3.1-8b-instruct.
- **`ollama`**: Connects to local Ollama instance (`http://localhost:11434`) running `qwen2.5-coder`.
- **`openrouter`**: Supports OpenRouter DeepSeek R1 or Qwen 2.5 Coder.

#### Fault Tolerance (`jsonrepair`)
If an AI provider returns markdown code blocks or invalid JSON formatting, the handler passes the output through `jsonrepair` to recover a valid JSON patch before returning it to the client.

#### Response Schema
- **Success (200)**: `{ "patch": Array | Object }`
- **Error (400/500)**: `{ "error": "description" }`

---

## 3. Content Management Routes

All section routes conform to a standard interface created by the `createContentRoute` factory.

### Supported Endpoints
- `/api/profile` - Manages `profile.json`
- `/api/projects` - Manages `projects.json`
- `/api/skills` - Manages `skills.json`
- `/api/experience` - Manages `experience.json`
- `/api/chatbot` - Manages `chatbot.json` telemetry

### `GET /{endpoint}`
Retrieves current JSON data from the target file in GitHub.
- **Success (200)**: `{ "data": Object|Array, "sha": "string" }`.

### `POST /{endpoint}`
Commits updated content directly to GitHub.
- **Request Body**: Valid JSON payload matching the target schema.
- **Success (200)**: `{ "success": true }`.
- **Error (400/500)**: `{ "error": "description" }`.

---

## 4. Utility Routes

### `POST /api/publish`
Triggers a manual GitHub Actions rebuild workflow.

### `GET /api/github/test`
Tests server connection and token scope with GitHub API.
