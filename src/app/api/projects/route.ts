import { createContentRoute } from "@/lib/route-helper";

const handler = createContentRoute("projects.json", "projects");
export const GET = handler.GET;
export const POST = handler.POST;
