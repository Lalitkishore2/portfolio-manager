import { NextResponse } from "next/server";
import { createContentRoute } from "@/lib/route-helper";
import fs from "fs";
import path from "path";
import { getContentJSON, saveContentJSON } from "@/lib/github";
import { logger } from "@/lib/logger";

const handler = createContentRoute("queries.json", "queries", []);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET() {
  const response = await handler.GET();
  Object.entries(CORS_HEADERS).forEach(([key, val]) => {
    response.headers.set(key, val);
  });
  return response;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    let dataToSave: any = null;

    // Check if single query object submitted from ChatBot or ContactForm
    if (payload && typeof payload === "object" && !Array.isArray(payload) && !payload.data && payload.question) {
      // Read existing queries from local file or GitHub
      const localPath = path.join(process.cwd(), "..", "PORTFOLIO", "content", "queries.json");
      let existingQueries: any[] = [];
      if (fs.existsSync(localPath)) {
        try {
          existingQueries = JSON.parse(fs.readFileSync(localPath, "utf-8"));
        } catch (e) {
          existingQueries = [];
        }
      }

      const newEntry = {
        id: `q_${Date.now()}`,
        question: payload.question,
        country: payload.country || payload.location || "Web Visitor",
        time: "Just now",
        exact: new Date().toISOString(),
        status: "unreviewed",
        likelyCategory: payload.likelyCategory || payload.category || "general",
        email: payload.email || undefined,
        name: payload.name || undefined,
      };

      dataToSave = [newEntry, ...existingQueries];
    } else {
      dataToSave = payload.data || payload;
    }

    // Call standard handler with formatted payload
    const response = await handler.POST(
      new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({ data: dataToSave }),
      })
    );

    Object.entries(CORS_HEADERS).forEach(([key, val]) => {
      response.headers.set(key, val);
    });

    return response;
  } catch (error: any) {
    logger.error({ err: error }, "[QUERIES API] Failed to process POST");
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}
