import { NextResponse } from "next/server";
import { triggerRebuild } from "@/lib/github";

/**
 * POST /api/publish
 *
 * Since every content save now commits directly to GitHub via the API,
 * this endpoint is a "force rebuild" trigger — it dispatches the
 * GitHub Actions deploy workflow or creates an empty commit to force
 * GitHub Pages to rebuild.
 */
export async function POST() {
  try {
    const message = await triggerRebuild();
    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("Publish/rebuild error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger rebuild" },
      { status: 500 }
    );
  }
}
