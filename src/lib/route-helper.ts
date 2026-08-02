import { NextResponse } from "next/server";
import { getContentJSON, saveContentJSON } from "@/lib/github";
import { logger } from "@/lib/logger";

export function createContentRoute(filename: string, commitLabel: string, defaultValue?: any) {
  return {
    async GET() {
      try {
        const { data, sha } = await getContentJSON(filename);
        return NextResponse.json({ data, sha });
      } catch (error: any) {
        if (error.message.includes("404")) {
          const fs = require("fs");
          const path = require("path");
          const localPath = path.join(process.cwd(), "..", "PORTFOLIO", "content", filename);
          if (fs.existsSync(localPath)) {
            try {
              const localData = JSON.parse(fs.readFileSync(localPath, "utf-8"));
              return NextResponse.json({ data: localData, sha: "" });
            } catch (e) {}
          }
          let fallback = defaultValue;
          if (fallback === undefined) {
             fallback = filename.includes("projects") || filename.includes("experience") || filename.includes("skills") || filename.includes("queries") ? [] : {};
          }
          return NextResponse.json({ data: fallback, sha: "" });
        }
        logger.error({ err: error, filename }, `Failed to load ${filename} from GitHub`);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    },
    async POST(request: Request) {
      try {
        const payload = await request.json();
        const data = payload.data || payload; // Accept wrapped or unwrapped data
        
        if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
            return NextResponse.json({ error: "Invalid or empty JSON data" }, { status: 400 });
        }

        // Fetch current sha automatically
        let currentSha;
        try {
          const current = await getContentJSON(filename);
          currentSha = current.sha;
        } catch (e) {
          // File might not exist yet
        }

        const { sha: newSha } = await saveContentJSON(filename, data, `cms: update ${commitLabel}`, currentSha);
        
        // Write locally so Astro updates immediately (Live Preview)
        const fs = require("fs");
        const path = require("path");
        const localPath = path.join(process.cwd(), "..", "portfolio", "content", filename);
        try {
          if (fs.existsSync(localPath)) {
            fs.writeFileSync(localPath, JSON.stringify(data, null, 2), "utf8");
          }
        } catch (e) {
          logger.error({ err: e }, "[ROUTE HELPER] Failed to sync locally");
        }

        return NextResponse.json({ success: true, sha: newSha });
      } catch (error: any) {
        logger.error({ err: error, filename }, `Failed to save ${filename} to GitHub`);
        
        if (error instanceof SyntaxError) {
          return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
        }
        
        // Handle GitHub API 409 Conflict
        if (error.message.includes("409")) {
          return NextResponse.json({ error: "Conflict: This file was modified by another user since you opened it. Please refresh and try again." }, { status: 409 });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  };
}
