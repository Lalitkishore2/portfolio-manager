import { useState, useRef, useEffect } from "react";
import { Wand2, Mic, Send, Check, X, RefreshCw } from "lucide-react";

type ReviewState = "idle" | "loading" | "review";

interface AICommandBarProps {
  contextPath: string | null;
  onCommand: (command: string) => void;
}

const EXAMPLES = [
  "Rewrite my bio to emphasize firmware and data pipeline experience.",
  "Add a new outcome to AquaDot: Maintained 99.8% edge runtime uptime.",
  "Change the SmartFlow IV role description to sound more results-oriented.",
  "Remove the Corporate tone tag from CareerSight.",
];

export function AICommandBar({ contextPath, onCommand }: AICommandBarProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const [reviewState, setReviewState] = useState<ReviewState>("idle");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % EXAMPLES.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const lines = e.target.value.split("\n").length;
    setRows(Math.min(4, Math.max(1, lines)));
  }

  function handleSubmit() {
    if (!value.trim() || reviewState === "loading") return;
    setReviewState("loading");
    onCommand(value.trim());
    setTimeout(() => {
      setReviewState("review");
    }, 1600);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleAccept() {
    setReviewState("idle");
    setValue("");
    setRows(1);
  }

  function handleDiscard() {
    setReviewState("idle");
    setValue("");
    setRows(1);
  }

  const isMultiLine = rows > 1;
  const expanded = focused || value.length > 0;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {/* Review Changes pill */}
      {reviewState === "review" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "rgba(24,24,27,0.95)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            pointerEvents: "auto",
            animation: "fadeInUp 200ms ease-out",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#f59e0b",
              display: "inline-block",
            }}
          />
          <span style={{ color: "var(--cms-text-secondary)", fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
            Changes applied as draft
          </span>
          <div style={{ display: "flex", gap: 6, marginLeft: 4 }}>
            <button
              onClick={handleAccept}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 8,
                color: "var(--cms-accent-emerald)",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Check size={11} />
              Accept
            </button>
            <button
              onClick={() => setReviewState("idle")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 8,
                color: "var(--cms-accent-cobalt)",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <RefreshCw size={10} />
              Modify
            </button>
            <button
              onClick={handleDiscard}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                borderRadius: 8,
                color: "var(--cms-accent-rose)",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <X size={10} />
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Command bar */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          width: expanded ? 740 : 600,
          pointerEvents: "auto",
          background: "rgba(24,24,27,0.92)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${focused ? "rgba(59,130,246,0.4)" : "var(--cms-border-glass)"}`,
          borderRadius: isMultiLine ? 16 : 9999,
          boxShadow: focused
            ? "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.15)"
            : "0 8px 30px rgba(0,0,0,0.4)",
          transition: "width 200ms ease-out, border-radius 200ms ease-out, border-color 150ms, box-shadow 150ms",
          display: "flex",
          alignItems: isMultiLine ? "flex-start" : "center",
          padding: isMultiLine ? "14px 16px" : "0 14px",
          gap: 10,
          minHeight: 52,
          cursor: "text",
        }}
      >
        {/* Context chip */}
        {contextPath ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 9px",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 20,
              fontSize: 11,
              color: "var(--cms-accent-cobalt)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: isMultiLine ? 2 : 0,
            }}
          >
            <Wand2 size={10} />
            {contextPath}
          </div>
        ) : (
          <Wand2 size={16} style={{ color: "var(--cms-text-secondary)", flexShrink: 0, marginTop: isMultiLine ? 2 : 0 }} />
        )}

        {/* Input */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={rows}
          placeholder={EXAMPLES[placeholderIdx]}
          disabled={reviewState === "loading"}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--cms-text-primary)",
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            resize: "none",
            lineHeight: "22px",
            padding: isMultiLine ? 0 : "15px 0",
          }}
        />

        {/* Right actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            marginTop: isMultiLine ? 2 : 0,
          }}
        >
          {/* Mic */}
          <button
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--cms-text-secondary)",
              padding: 6,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              transition: "color 150ms",
            }}
            className="hover:text-white"
            title="Voice input"
          >
            <Mic size={15} />
          </button>

          {/* Submit / loading */}
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || reviewState === "loading"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              background: value.trim() && reviewState !== "loading" ? "var(--cms-accent-cobalt)" : "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: 9999,
              cursor: value.trim() && reviewState !== "loading" ? "pointer" : "not-allowed",
              color: value.trim() && reviewState !== "loading" ? "#fff" : "var(--cms-text-secondary)",
              transition: "background 150ms",
            }}
          >
            {reviewState === "loading" ? (
              <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Send size={13} />
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
