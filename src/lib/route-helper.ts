import { NextResponse } from "next/server";
import { getContentJSON, saveContentJSON } from "@/lib/github";

export function createContentRoute(filename: string, commitLabel: string) {
  return {
    async GET() {
      try {
        const { data } = await getContentJSON(filename);
        return NextResponse.json(data);
      } catch (error: any) {
        console.error(`Failed to load ${filename} from GitHub:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    },
    async POST(request: Request) {
      try {
        const data = await request.json();
        await saveContentJSON(filename, data, `cms: update ${commitLabel}`);
        return NextResponse.json({ success: true });
      } catch (error: any) {
        console.error(`Failed to save ${filename} to GitHub:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  };
}
