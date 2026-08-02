import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, type } = await req.json();

    // Default to Gemini since this is an LK CMS environment inside Gemini IDE
    // But could be configured via env
    const model = google("gemini-2.5-pro");

    let systemPrompt = "You are an expert technical writer and UI designer helping to edit portfolio content.";

    if (type === "markdown") {
      systemPrompt += " Your task is to take raw notes and expand them into a beautifully formatted markdown case study. Use proper headings, bolding, and bullet points. Do not wrap the response in markdown code blocks.";
    } else if (type === "techStack") {
      systemPrompt += " Your task is to extract all technologies mentioned in the provided text and return them as a comma-separated list of tech names. Do not include extra text.";
    } else if (type === "tone") {
      systemPrompt += " Your task is to rewrite the text to be extremely professional, engaging, and confident, suitable for a senior engineer's portfolio.";
    } else if (type === "seo-slug") {
      systemPrompt += " Your task is to generate a short, SEO-optimized URL slug (kebab-case) based on the provided project title and description. Return ONLY the slug, no other text.";
    }

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `Context: ${context || "None"}\n\nTask: ${prompt}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Generation Error", error);
    return new Response(JSON.stringify({ error: "Failed to generate AI response" }), { status: 500 });
  }
}
