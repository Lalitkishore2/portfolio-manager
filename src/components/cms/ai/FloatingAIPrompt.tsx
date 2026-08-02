import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Loader2, Wand2, Type, Check, X } from "lucide-react";

interface FloatingAIPromptProps {
  onApply: (newText: string) => void;
}

export function FloatingAIPrompt({ onApply }: FloatingAIPromptProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [prompt, setPrompt] = useState("");
  
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Don't trigger if clicking inside the popover itself
      if (popoverRef.current?.contains(e.target as Node)) return;
      
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        
        if (rect) {
          setSelectedText(text);
          setPosition({
            top: rect.top - 60, // Position above the selection
            left: rect.left + rect.width / 2,
          });
          setResult("");
          setPrompt("");
        }
      } else {
        // Only hide if we aren't currently viewing a result
        if (!result && !loading) {
          setPosition(null);
        }
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [result, loading]);

  const handleGenerate = async (type: string, customPrompt?: string) => {
    setLoading(true);
    try {
      // Use the actual API we built, passing standard instructions based on type
      let actualPrompt = customPrompt || type;
      
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: actualPrompt, 
          context: selectedText, 
          type: type === "Rewrite to be more professional" ? "tone" : "general" 
        }),
      });
      
      if (!response.ok) throw new Error("Failed to generate");
      
      // Handle the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let completeText = "";
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // The AI SDK sends chunks starting with '0:'
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const textChunk = JSON.parse(line.substring(2));
                completeText += textChunk;
                setResult(completeText);
              } catch (e) {}
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setResult("Error generating text.");
    } finally {
      setLoading(false);
    }
  };

  if (!position) return null;

  return (
    <div 
      ref={popoverRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "#111113",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 200,
        maxWidth: 400,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {!result && !loading ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px" }}>
            <Sparkles size={14} color="#60a5fa" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Figma Make AI</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <button 
              onClick={() => handleGenerate("Rewrite to be more professional")}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "transparent", border: "none", borderRadius: 4, cursor: "pointer", color: "#d4d4d8", fontSize: 12, textAlign: "left" }}
              className="hover:bg-white/5"
            >
              <Type size={12} /> Rewrite (Professional)
            </button>
            <button 
              onClick={() => handleGenerate("Shorten this text")}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "transparent", border: "none", borderRadius: 4, cursor: "pointer", color: "#d4d4d8", fontSize: 12, textAlign: "left" }}
              className="hover:bg-white/5"
            >
              <Wand2 size={12} /> Shorten text
            </button>
          </div>
          
          <div style={{ padding: "0 8px", marginTop: 4 }}>
            <input 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && prompt) handleGenerate(prompt, prompt);
              }}
              placeholder="Or type a custom prompt..."
              style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "6px 8px", fontSize: 11, color: "#fff", outline: "none" }}
            />
          </div>
        </>
      ) : loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 8 }}>
          <Loader2 size={14} color="#60a5fa" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 12, color: "#a1a1aa" }}>Generating...</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 4 }}>
          <div style={{ fontSize: 12, color: "#e4e4e7", background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
            {result}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button 
              onClick={() => { setResult(""); setPosition(null); }}
              style={{ padding: "4px 8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, color: "#a1a1aa", fontSize: 11, cursor: "pointer" }}
            >
              <X size={12} /> Discard
            </button>
            <button 
              onClick={() => { onApply(result); setPosition(null); setResult(""); }}
              style={{ padding: "4px 8px", background: "#2563eb", border: "none", borderRadius: 4, color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <Check size={12} /> Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
