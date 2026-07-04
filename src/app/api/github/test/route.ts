import { NextResponse } from "next/server";
import { testConnection } from "@/lib/github";

/**
 * GET /api/github/test
 *
 * Verifies the configured GitHub token has access to the target repository.
 */
export async function GET() {
  try {
    const result = await testConnection();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, repoName: "", message: error.message },
      { status: 500 }
    );
  }
}
