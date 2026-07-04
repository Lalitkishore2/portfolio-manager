import { createContentRoute } from "@/lib/route-helper";

const handler = createContentRoute("profile.json", "profile");
export const GET = handler.GET;
export const POST = handler.POST;
