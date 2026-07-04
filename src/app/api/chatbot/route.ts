import { NextResponse } from "next/server";
import { getContentJSON, saveContentJSON } from "@/lib/github";

export async function GET() {
  try {
    const { data } = await getContentJSON("chatbot.json");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to load chatbot from GitHub:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await saveContentJSON("chatbot.json", data, "cms: update chatbot knowledge");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save chatbot to GitHub:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
