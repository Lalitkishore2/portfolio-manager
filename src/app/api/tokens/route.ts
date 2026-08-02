import { createContentRoute } from "@/lib/route-helper";

const handler = createContentRoute("tokens.json", "tokens");
export const GET = handler.GET;
export const POST = handler.POST;
