import React, { useState } from "react";
import { Github, Loader2, Sparkles, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useMakeStore } from "../../../store/makeStore";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish: (message: string) => Promise<void>;
}

export function PublishModal({ isOpen, onClose, onConfirmPublish }: PublishModalProps) {
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { siteDocument } = useMakeStore();

  if (!isOpen) return null;

  const handleGenerateMessage = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: "Generate a short, conventional git commit message based on these JSON changes.", 
          context: JSON.stringify(siteDocument).substring(0, 500) + "...", // Sending partial for context
          type: "general" 
        }),
      });
      if (!response.ok) throw new Error();
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let completeText = "";
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try { completeText += JSON.parse(line.substring(2)); } catch (e) {}
            }
          }
        }
      }
      setMessage(completeText.trim().replace(/^"|"$/g, ''));
    } catch (e) {
      toast.error("Failed to generate commit message");
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (!message) {
      toast.error("Please enter a commit message");
      return;
    }
    setPublishing(true);
    try {
      await onConfirmPublish(message);
      onClose();
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
      background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        width: 500, background: "#111113", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, overflow: "hidden", fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <Github size={18} /> Publish to GitHub
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8, fontSize: 13, color: "#d4d4d8", border: "1px solid rgba(255,255,255,0.05)" }}>
            You are about to publish local changes to the portfolio repository.
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Commit Message</label>
            <div style={{ position: "relative" }}>
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. feat: update project architecture"
                style={{ width: "100%", padding: "10px 12px", paddingRight: 40, background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", outline: "none", boxSizing: "border-box" }}
              />
              <button 
                onClick={handleGenerateMessage}
                disabled={generating}
                style={{ position: "absolute", right: 8, top: 8, background: "none", border: "none", color: "#a855f7", cursor: "pointer" }}
                title="Generate with AI"
              >
                {generating ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", background: "transparent", border: "none", color: "#a1a1aa", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={publishing} style={{ padding: "8px 16px", background: "#3b82f6", border: "none", borderRadius: 6, color: "#fff", cursor: publishing ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            {publishing ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Publishing...</> : <><Check size={14} /> Confirm Publish</>}
          </button>
        </div>
      </div>
    </div>
  );
}
