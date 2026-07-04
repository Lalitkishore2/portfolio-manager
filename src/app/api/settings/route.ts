import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Settings API Route
 *
 * This route persists settings to .env.local for local dev,
 * and updates process.env at runtime so the GitHub service
 * picks up changes immediately. On Vercel, env vars are set
 * via the dashboard and this route reads from process.env.
 */

const envPath = path.join(process.cwd(), ".env.local");

async function readEnv(): Promise<Record<string, string>> {
  const env: Record<string, string> = {};
  try {
    const data = await fs.readFile(envPath, "utf-8");
    const lines = data.split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index === -1) return;
      const key = trimmed.slice(0, index).trim();
      let val = trimmed.slice(index + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    });
  } catch {
    // If file doesn't exist (e.g. on Vercel), that's fine — we read from process.env
  }
  return env;
}

async function writeEnv(updates: Record<string, string>) {
  const current = await readEnv();
  const merged = { ...current, ...updates };
  const lines = Object.entries(merged).map(([k, v]) => `${k}="${v}"`);
  try {
    await fs.writeFile(envPath, lines.join("\n") + "\n", "utf-8");
  } catch {
    // On Vercel, writing to .env.local won't work — that's expected.
    // Settings are persisted via Vercel environment variables instead.
    console.warn("Could not write .env.local (expected on Vercel)");
  }
}

export async function GET() {
  // Merge .env.local values with process.env (process.env takes priority on Vercel)
  const fileEnv = await readEnv();
  const env = { ...fileEnv };

  // On Vercel, process.env will have the values; merge them in
  const processKeys = [
    "GITHUB_REPO", "GITHUB_TOKEN", "GITHUB_BRANCH", "ASTRO_PREVIEW_URL",
    "OPENROUTER_API_KEY", "GROQ_API_KEY", "GEMINI_API_KEY",
    "NVIDIA_API_KEY", "OLLAMA_CLOUD_API_KEY", "OLLAMA_CLOUD_URL",
  ];
  processKeys.forEach((key) => {
    if (process.env[key]) env[key] = process.env[key]!;
  });

  return NextResponse.json({
    repo: env.GITHUB_REPO || "Lalitkishore2/portfolio",
    token: env.GITHUB_TOKEN || "",
    branch: env.GITHUB_BRANCH || "main",
    previewUrl: env.ASTRO_PREVIEW_URL || "http://localhost:4321",
    openrouterKey: env.OPENROUTER_API_KEY || "",
    groqKey: env.GROQ_API_KEY || "",
    geminiKey: env.GEMINI_API_KEY || "",
    nvidiaKey: env.NVIDIA_API_KEY || "",
    ollamaKey: env.OLLAMA_CLOUD_API_KEY || "",
    ollamaUrl: env.OLLAMA_CLOUD_URL || "https://api.ollamacloud.io",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updates: Record<string, string> = {
      GITHUB_REPO: body.repo || "Lalitkishore2/portfolio",
      GITHUB_TOKEN: body.token || "",
      GITHUB_BRANCH: body.branch || "main",
      ASTRO_PREVIEW_URL: body.previewUrl || "http://localhost:4321",
      OPENROUTER_API_KEY: body.openrouterKey || "",
      GROQ_API_KEY: body.groqKey || "",
      GEMINI_API_KEY: body.geminiKey || "",
      NVIDIA_API_KEY: body.nvidiaKey || "",
      OLLAMA_CLOUD_API_KEY: body.ollamaKey || "",
      OLLAMA_CLOUD_URL: body.ollamaUrl || "https://api.ollamacloud.io",
    };
    await writeEnv(updates);

    // Update process.env so changes take effect immediately
    Object.entries(updates).forEach(([k, v]) => {
      process.env[k] = v;
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
