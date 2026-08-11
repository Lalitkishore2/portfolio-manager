import { NextResponse } from "next/server";
import { getContentJSON } from "@/lib/github";
import { testConnection } from "@/lib/github";

/**
 * GET /api/github
 *
 * Returns recent commit history and GitHub connection status.
 * Used by the Analytics dashboard to show the Recent Activity feed.
 */
export async function GET() {
  try {
    const connection = await testConnection();
    if (!connection.ok) {
      return NextResponse.json({ ok: false, error: connection.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, repoName: connection.repoName, message: connection.message });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to connect to GitHub" },
      { status: 500 }
    );
  }
}
