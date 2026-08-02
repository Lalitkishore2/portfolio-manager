import { createContentRoute } from "@/lib/route-helper";

const handler = createContentRoute("chatbot.json", "chatbot knowledge");
export const GET = handler.GET;
export const POST = handler.POST;
