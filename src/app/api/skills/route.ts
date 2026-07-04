import { createContentRoute } from "@/lib/route-helper";

const handler = createContentRoute("skills.json", "skills");
export const GET = handler.GET;
export const POST = handler.POST;
