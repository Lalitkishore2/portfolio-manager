import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { env } from "@/env";

// In-memory rate limiter (max 5 attempts per 15 mins per IP)
const rateLimit = new LRUCache({
  max: 500,
  ttl: 15 * 60 * 1000,
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const currentAttempts = (rateLimit.get(ip) as number) || 0;

    if (currentAttempts >= 5) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const { password } = await request.json();
    const adminPassword = env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Authentication is disabled. No password configured." },
        { status: 400 }
      );
    }

    if (password !== adminPassword) {
      rateLimit.set(ip, currentAttempts + 1);
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Success - reset attempts
    rateLimit.delete(ip);
    
    const response = NextResponse.json({ success: true });

    // Set secure session cookie
    response.cookies.set("cms_session", adminPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
