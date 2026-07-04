import { NextResponse } from "next/server";
import { getContentJSON, saveContentJSON } from "@/lib/github";

export async function GET() {
  try {
    const { data } = await getContentJSON("experience.json");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to load experience from GitHub:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await saveContentJSON("experience.json", data, "cms: update experience");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save experience to GitHub:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
