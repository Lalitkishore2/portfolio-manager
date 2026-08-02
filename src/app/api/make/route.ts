import { NextResponse } from "next/server";
import { getContentJSON } from "@/lib/github";
import { jsonrepair } from "jsonrepair";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const provider = (body.provider || "gemini").toLowerCase();
    const targetSection = body.targetSection || "projects";
    const selectedNodeId = body.selectedNodeId || null;
    const image = body.image;

    console.log("[MAKE API] Received provider:", provider, "Original:", body.provider);

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // 1. Read current state from GitHub
    let currentData: any = targetSection === "profile" ? {} : [];
    let currentSha: string | undefined;
    try {
      const { data, sha } = await getContentJSON(`${targetSection}.json`);
      currentData = data;
      currentSha = sha;
    } catch (e) {
      currentData = targetSection === "profile" ? {} : [];
    }

    // 2. Build AI Prompt
    const systemInstruction = `You are an AI assistant acting as the backend for a visual CMS editor.
Your job is to read the current state of a JSON ${targetSection === "profile" ? "object" : "array"} representing ${targetSection} for a portfolio, and apply the user's requested modifications.
If the user specifies they want to add a "new" item or no specific item is selected, APPEND a newly generated item to the array (if it's an array).
CRITICAL: When generating new items, always automatically generate a unique, human-readable \`id\` or \`slug\` based on the content (e.g., 'eco-dashboard', 'new-hero-banner').
Ensure the resulting JSON strictly matches the existing schema and is a valid JSON ${targetSection === "profile" ? "object" : "array"}.
Return ONLY the raw JSON ${targetSection === "profile" ? "object" : "array"}. Do not use markdown formatting blocks like \`\`\`json.`;
    
    const userMessage = `User Request: "${prompt}"
${selectedNodeId ? `Note: The user currently has the item "${selectedNodeId}" selected. Prioritize modifications on this item.` : "Note: No specific item is selected. Generate a new item or modify globally based on the request."}

Current JSON ${targetSection === "profile" ? "Object" : "Array"}:
${JSON.stringify(currentData, null, 2)}`;

    let generatedText = "";

    // 3. Call AI Provider
    if (provider.startsWith("openrouter")) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set.");
      const openRouterModel = provider === "openrouter-deepseek" 
        ? "deepseek/deepseek-r1" 
        : "qwen/qwen-2.5-coder-32b-instruct";
        
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
          ],
          response_format: { type: "json_object" }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "OpenRouter error");
      generatedText = data.choices?.[0]?.message?.content;
    } 
    else if (provider.startsWith("groq")) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY is not set.");
      const groqModel = "llama-3.3-70b-versatile";
        
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
          ],
          response_format: { type: "json_object" },
          max_tokens: 1500
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
          model: "meta/llama-3.1-8b-instruct",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userMessage }
          ],
          max_tokens: 4000
        })
      });
      const resText = await res.text();
      let data;
      try { data = JSON.parse(resText); } catch(e) { throw new Error(`NVIDIA API non-JSON response: ${resText.substring(0, 100)}`); }
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
      // Default: Gemini with automatic Groq fallback if Gemini is overloaded
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey && !process.env.GROQ_API_KEY) throw new Error("Neither GEMINI_API_KEY nor GROQ_API_KEY is set.");
      
      let geminiSuccess = false;
      if (apiKey) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: [{ 
                  role: "user", 
                  parts: [
                    ...(body.image ? [{
                      inlineData: {
                        mimeType: body.image.split(';')[0].split(':')[1],
                        data: body.image.split(',')[1]
                      }
                    }] : []),
                    { text: userMessage }
                  ] 
                }],
                generationConfig: { responseMimeType: "application/json" }
              }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (generatedText) geminiSuccess = true;
          }
        } catch (e) {
          console.warn("[MAKE API] Gemini primary call failed, trying Groq fallback...");
        }
      }

      // Fallback to Groq if Gemini is busy or fails
      if (!geminiSuccess && process.env.GROQ_API_KEY) {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userMessage }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500
          })
        });
        const groqData = await groqRes.json();
        if (groqData.choices?.[0]?.message?.content) {
          generatedText = groqData.choices[0].message.content;
        } else {
          throw new Error("Gemini is currently busy and Groq fallback failed.");
        }
      }
    }

    if (!generatedText) {
      throw new Error("No content generated from AI.");
    }

    // Robust JSON extraction
    generatedText = generatedText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const firstBrace = generatedText.indexOf('{');
    const firstBracket = generatedText.indexOf('[');
    const firstValid = Math.min(
      firstBrace === -1 ? Infinity : firstBrace, 
      firstBracket === -1 ? Infinity : firstBracket
    );
    if (firstValid !== Infinity) {
      const lastBrace = generatedText.lastIndexOf('}');
      const lastBracket = generatedText.lastIndexOf(']');
      const lastValid = Math.max(lastBrace, lastBracket);
      if (lastValid !== -1 && lastValid >= firstValid) {
        generatedText = generatedText.substring(firstValid, lastValid + 1);
      }
    }

    let newJson;
    try {
      newJson = JSON.parse(generatedText);
    } catch (parseErr) {
      try {
        const repaired = jsonrepair(generatedText);
        newJson = JSON.parse(repaired);
      } catch (repairErr) {
        console.error("Failed to parse and repair AI output:", generatedText);
        throw new Error(`AI returned invalid JSON: ${generatedText.substring(0, 50)}...`);
      }
    }

    // 4. Return patch without saving (decoupled generation from apply)
    return NextResponse.json({ success: true, updatedCount: Array.isArray(newJson) ? newJson.length : 1, provider, patch: newJson });

  } catch (error: any) {
    console.error("Make API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
