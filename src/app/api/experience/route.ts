import { createContentRoute } from "@/lib/route-helper";

const handler = createContentRoute("experience.json", "experience");
export const GET = handler.GET;
export const POST = handler.POST;
