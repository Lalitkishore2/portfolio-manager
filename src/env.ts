import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),
    GITHUB_REPO: z.string().includes("/", { message: "GITHUB_REPO must be in format 'owner/repo'" }),
    GITHUB_BRANCH: z.string().default("main"),
    CMS_GITHUB_TOKEN: z.string().startsWith("ghp_", { message: "GITHUB_TOKEN must be a valid GitHub Personal Access Token" }).or(z.string().startsWith("github_pat_")),
    // Optional AI keys
    GEMINI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    NVIDIA_API_KEY: z.string().optional(),
    OLLAMA_CLOUD_API_KEY: z.string().optional(),
    OLLAMA_CLOUD_URL: z.string().url().optional(),
  },
  client: {},
  runtimeEnv: {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    GITHUB_REPO: process.env.GITHUB_REPO,
    GITHUB_BRANCH: process.env.GITHUB_BRANCH,
    CMS_GITHUB_TOKEN: process.env.CMS_GITHUB_TOKEN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
    OLLAMA_CLOUD_API_KEY: process.env.OLLAMA_CLOUD_API_KEY,
    OLLAMA_CLOUD_URL: process.env.OLLAMA_CLOUD_URL,
  },
  emptyStringAsUndefined: true,
});
