import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getContentJSON, saveContentJSON } from "@/lib/github";
import { logger } from "@/lib/logger";

const FORMSPREE_FORM_ID = process.env.FORMSPREE_FORM_ID || "mgobpdvv";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

/**
 * GET /api/formspree
 * Directly fetches live submissions from Formspree REST API (if FORMSPREE_API_KEY is provided)
 */
export async function GET() {
  try {
    const apiKey = process.env.FORMSPREE_API_KEY;
    const formId = process.env.FORMSPREE_FORM_ID || FORMSPREE_FORM_ID;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        hasApiKey: false,
        message: "FORMSPREE_API_KEY not configured. Add FORMSPREE_API_KEY in .env.local to enable automatic Formspree API syncing.",
        formId,
      }, { headers: CORS_HEADERS });
    }

    // Call Formspree Submissions API
    const response = await fetch(`https://formspree.io/api/v0/forms/${formId}/submissions`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Formspree API error: ${errText}` }, { status: response.status, headers: CORS_HEADERS });
    }

    const data = await response.json();
    const submissions: any[] = data.submissions || data || [];

    // Map Formspree submissions into queries format
    const localPath = path.join(process.cwd(), "..", "PORTFOLIO", "content", "queries.json");
    let existingQueries: any[] = [];
    if (fs.existsSync(localPath)) {
      try {
        existingQueries = JSON.parse(fs.readFileSync(localPath, "utf-8"));
      } catch (e) {}
    }

    let addedCount = 0;
    const existingIds = new Set(existingQueries.map((q) => q.id));

    const newEntries = submissions.map((sub: any, idx: number) => {
      const submissionId = sub._id || sub.id || `formspree_${idx}_${Date.now()}`;
      const questionText = sub.query || sub.message || sub.question || "Formspree submission";
      const typeVal = sub.type || (sub.query ? "chatbot_unmatched_query" : "contact_form");
      const categoryVal = sub.lastActiveProject || sub.category || "general";
      const emailVal = sub.email || sub._replyto || sub._from || undefined;
      const nameVal = sub.name || undefined;
      const exactVal = sub._date || sub.timestamp || new Date().toISOString();

      return {
        id: submissionId,
        question: questionText,
        country: "Formspree API",
        time: "From Formspree",
        exact: exactVal,
        status: "unreviewed",
        likelyCategory: categoryVal,
        type: typeVal,
        lastActiveProject: categoryVal,
        email: emailVal,
        name: nameVal,
      };
    }).filter((entry) => !existingIds.has(entry.id));

    if (newEntries.length > 0) {
      const mergedQueries = [...newEntries, ...existingQueries];
      addedCount = newEntries.length;

      // Write locally and sync to GitHub
      fs.writeFileSync(localPath, JSON.stringify(mergedQueries, null, 2), "utf-8");
      try {
        let sha = "";
        try {
          const current = await getContentJSON("queries.json");
          sha = current.sha;
        } catch (e) {}
        await saveContentJSON("queries.json", mergedQueries, "cms: sync Formspree API submissions", sha);
      } catch (e) {
        logger.error({ err: e }, "[FORMSPREE API] GitHub sync failed");
      }
    }

    return NextResponse.json({
      success: true,
      hasApiKey: true,
      addedCount,
      totalSubmissions: submissions.length,
      formId,
    }, { headers: CORS_HEADERS });
  } catch (error: any) {
    logger.error({ err: error }, "[FORMSPREE API] Failed to fetch submissions");
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}

/**
 * POST /api/formspree (Webhook Endpoint)
 * Handles direct incoming webhooks from Formspree Dashboard
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Extract fields from Formspree Webhook JSON
    const questionText = payload.query || payload.message || payload.question || "Formspree Webhook Submission";
    const typeVal = payload.type || (payload.query ? "chatbot_unmatched_query" : "contact_form");
    const categoryVal = payload.lastActiveProject || payload.category || "general";
    const emailVal = payload.email || payload._replyto || payload._from || undefined;
    const nameVal = payload.name || undefined;
    const exactVal = payload.timestamp || payload._date || new Date().toISOString();

    const localPath = path.join(process.cwd(), "..", "PORTFOLIO", "content", "queries.json");
    let existingQueries: any[] = [];
    if (fs.existsSync(localPath)) {
      try {
        existingQueries = JSON.parse(fs.readFileSync(localPath, "utf-8"));
      } catch (e) {}
    }

    const newEntry = {
      id: `formspree_webhook_${Date.now()}`,
      question: questionText,
      country: "Formspree Webhook",
      time: "Just now",
      exact: exactVal,
      status: "unreviewed",
      likelyCategory: categoryVal,
      type: typeVal,
      lastActiveProject: categoryVal,
      email: emailVal,
      name: nameVal,
    };

    const updatedQueries = [newEntry, ...existingQueries];

    // Write locally first
    fs.writeFileSync(localPath, JSON.stringify(updatedQueries, null, 2), "utf-8");

    // Sync to GitHub
    try {
      let sha = "";
      try {
        const current = await getContentJSON("queries.json");
        sha = current.sha;
      } catch (e) {}
      await saveContentJSON("queries.json", updatedQueries, "cms: receive Formspree webhook submission", sha);
    } catch (e) {
      logger.error({ err: e }, "[FORMSPREE WEBHOOK] GitHub sync failed");
    }

    return NextResponse.json({ success: true, entry: newEntry }, { headers: CORS_HEADERS });
  } catch (error: any) {
    logger.error({ err: error }, "[FORMSPREE WEBHOOK] Failed to process webhook");
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}
