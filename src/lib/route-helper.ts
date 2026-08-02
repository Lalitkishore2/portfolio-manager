import { NextResponse } from "next/server";
import { getContentJSON, saveContentJSON } from "@/lib/github";
import { logger } from "@/lib/logger";

export function createContentRoute(filename: string, commitLabel: string, defaultValue?: any) {
  return {
    async GET() {
      const fs = require("fs");
      const path = require("path");
      const localPath = path.join(process.cwd(), "..", "PORTFOLIO", "content", filename);
      
      // If local file exists, serve it immediately so CMS UI reflects local edits instantly
      if (fs.existsSync(localPath)) {
        try {
          const localData = JSON.parse(fs.readFileSync(localPath, "utf-8"));
          let sha = "";
          try {
            const remote = await getContentJSON(filename);
            sha = remote.sha;
          } catch (e) {}
          return NextResponse.json({ data: localData, sha });
        } catch (e) {
          logger.error({ err: e, filename }, "[ROUTE HELPER] Failed to parse local JSON");
        }
      }

      // Fallback to GitHub API
      try {
        const { data, sha } = await getContentJSON(filename);
        return NextResponse.json({ data, sha });
      } catch (error: any) {
        let fallback = defaultValue;
        if (fallback === undefined) {
           fallback = filename.includes("projects") || filename.includes("experience") || filename.includes("skills") || filename.includes("queries") ? [] : {};
        }
        return NextResponse.json({ data: fallback, sha: "" });
      }
    },
    async POST(request: Request) {
      try {
        const payload = await request.json();
        const data = payload.data || payload; // Accept wrapped or unwrapped data
        
        if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
            return NextResponse.json({ error: "Invalid or empty JSON data" }, { status: 400 });
        }

        // 1. Write locally first so Astro & Portfolio update immediately (Live Preview)
        const fs = require("fs");
        const path = require("path");
        const contentDir = path.join(process.cwd(), "..", "PORTFOLIO", "content");
        const localPath = path.join(contentDir, filename);
        try {
          if (!fs.existsSync(contentDir)) {
            fs.mkdirSync(contentDir, { recursive: true });
          }
          fs.writeFileSync(localPath, JSON.stringify(data, null, 2), "utf8");
        } catch (e) {
          logger.error({ err: e }, "[ROUTE HELPER] Failed to sync locally");
        }

        // 2. Sync with remote GitHub repository
        let newSha = "";
        try {
          let currentSha = payload.sha;
          if (!currentSha) {
            try {
              const current = await getContentJSON(filename);
              currentSha = current.sha;
            } catch (e) {}
          }
          const res = await saveContentJSON(filename, data, `cms: update ${commitLabel}`, currentSha);
          newSha = res.sha;
        } catch (ghError: any) {
          logger.error({ err: ghError, filename }, `Failed to sync ${filename} to GitHub`);
        }

        return NextResponse.json({ success: true, sha: newSha });
      } catch (error: any) {
        logger.error({ err: error, filename }, `Failed to save ${filename}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  };
}
