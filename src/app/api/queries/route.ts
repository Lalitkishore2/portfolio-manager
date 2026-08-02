import { createContentRoute } from "@/lib/route-helper";

const handler = createContentRoute("queries.json", "queries", []);
export const GET = handler.GET;
export const POST = handler.POST;
