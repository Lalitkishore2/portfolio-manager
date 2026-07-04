import { NextResponse } from "next/server";
import { getContentJSON, saveContentJSON } from "@/lib/github";

export async function GET() {
  try {
    const { data } = await getContentJSON("profile.json");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to load profile from GitHub:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await saveContentJSON("profile.json", data, "cms: update profile");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save profile to GitHub:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
