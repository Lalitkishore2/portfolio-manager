import { NextResponse } from "next/server";
import { getContentJSON, saveContentJSON } from "@/lib/github";

export async function POST(request: Request) {
  try {
    const { prompt, provider = "gemini", targetSection = "projects" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // 1. Read current state from GitHub
    let currentData: any = targetSection === "profile" ? {} : [];
    try {
      const { data } = await getContentJSON(`${targetSection}.json`);
      currentData = data;
    } catch (e) {
      currentData = targetSection === "profile" ? {} : [];
    }

    // 2. Build AI Prompt
    const systemInstruction = `You are an AI assistant acting as the backend for a visual CMS editor.
Your job is to read the current state of a JSON ${targetSection === "profile" ? "object" : "array"} representing ${targetSection} for a portfolio, and apply the user's requested modifications.
Ensure the resulting JSON strictly matches the existing schema and is a valid JSON ${targetSection === "profile" ? "object" : "array"}.
Return ONLY the raw JSON ${targetSection === "profile" ? "object" : "array"}. Do not use markdown formatting blocks like \`\`\`json.`;
    
    const userMessage = `User Request: "${prompt}"

Current JSON ${targetSection === "profile" ? "Object" : "Array"}:
${JSON.stringify(currentData, null, 2)}`;

    let generatedText = "";

    // 3. Call AI Provider
    if (provider.startsWith("openrouter")) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set.");
      const openRouterModel = provider === "openrouter-deepseek" 
        ? "deepseek/deepseek-chat-v3-0324:free" 
        : "qwen/qwen3-coder:free";
        
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userMessage }
          ]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "OpenRouter error");
      generatedText = data.choices?.[0]?.message?.content;
    } 
    else if (provider.startsWith("groq")) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY is not set.");
      const groqModel = provider === "groq-qwen3" 
        ? "qwen-qwen3-32b" 
        : "llama-3.3-70b-versatile";
        
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userMessage }
          ]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "Groq error");
      generatedText = data.choices?.[0]?.message?.content;
    }
    else if (provider === "nvidia") {
      const apiKey = process.env.NVIDIA_API_KEY;
      if (!apiKey) throw new Error("NVIDIA_API_KEY is not set.");
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-r1-0528",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userMessage }
          ],
          max_tokens: 4000
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "NVIDIA error");
      generatedText = data.choices?.[0]?.message?.content;
    } 
    else if (provider === "ollama") {
      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen2.5-coder",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userMessage }
          ],
          stream: false,
          format: "json"
        })
      });
      if (!res.ok) throw new Error("Ollama is not running or model not found.");
      const data = await res.json();
      generatedText = data.message?.content;
    } 
    else if (provider === "ollama-cloud") {
      const baseUrl = process.env.OLLAMA_CLOUD_URL || "http://localhost:11434";
      const apiKey = process.env.OLLAMA_CLOUD_API_KEY || "";
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          model: "qwen2.5-coder", // The model hosted on your cloud instance
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userMessage }
          ],
          stream: false,
          format: "json"
        })
      });
      if (!res.ok) throw new Error("Ollama Cloud endpoint failed.");
      const data = await res.json();
      generatedText = data.message?.content;
    }
    else {
      // Default: Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            generationConfig: { responseMimeType: "application/json" }
          }),
        }
      );
      if (!res.ok) throw new Error("Gemini API Error");
      const data = await res.json();
      generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (!generatedText) {
      throw new Error("No content generated from AI.");
    }

    // Clean up markdown block if the AI ignored the instruction
    generatedText = generatedText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let newJson;
    try {
      newJson = JSON.parse(generatedText);
    } catch (parseErr) {
      console.error("Failed to parse AI output:", generatedText);
      throw new Error("AI returned invalid JSON.");
    }

    // 4. Write back to GitHub
    await saveContentJSON(`${targetSection}.json`, newJson, `cms: AI-generated update to ${targetSection}`);

    return NextResponse.json({ success: true, updatedCount: newJson.length, provider });

  } catch (error: any) {
    console.error("Make API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
