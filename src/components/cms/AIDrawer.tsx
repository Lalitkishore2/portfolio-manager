import { useState, useEffect, useRef } from "react";
import { X, RefreshCw, Check, ChevronDown, Wand2 } from "lucide-react";

const MODELS = [
  { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", hint: "Best quality · ~2s · 200k ctx" },
  { id: "llama-3.1-70b", label: "Llama 3.1 70B", hint: "Fast · ~0.8s · 128k ctx" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", hint: "Multimodal · ~1.5s · 1M ctx" },
];

const TONES = ["Creative", "Engineering-focused", "Corporate", "Direct"] as const;
type Tone = (typeof TONES)[number];

const MOCK_RESPONSES: Record<string, string> = {
  "Creative":
    "AquaDot was born from a simple frustration: watching experienced fish farmers lose entire harvests to water quality they couldn't see degrading in real time. We built a sensor node that thinks for itself — running a quantized TensorFlow Lite model directly on the ESP32, catching anomalies before they become catastrophes. Three farms later, we've cut monitoring costs by 60% and achieved 94% detection accuracy on unseen data.",
  "Engineering-focused":
    "The problem statement centers on the latency between water quality degradation onset and human detection in traditional aquaculture monitoring. Manual testing introduces 4–8 hour windows during which pH or dissolved oxygen excursions can cause irreversible harm. The system addresses this with a continuous-sampling ESP32-based node running INT8-quantized edge inference at 500ms intervals, achieving sub-second anomaly detection with 94% accuracy on held-out validation data.",
  "Corporate":
    "AquaDot delivers an intelligent IoT monitoring solution that enables aquaculture operators to proactively manage water quality through real-time analytics and predictive alerting. The platform reduces operational risk, decreases manual testing costs by 60%, and supports data-driven decision making across distributed farm environments.",
  "Direct":
    "Manual water quality testing in fish farms is slow and expensive — tests happen every few hours, and anything can go wrong in between. AquaDot fixes this with an ESP32 sensor node that runs ML inference locally, detects anomalies in real time, and sends alerts immediately. 94% accuracy, 60% cost reduction, deployed in production.",
};

interface AIDrawerProps {
  open: boolean;
  fieldLabel: string;
  fieldValue: string;
  context: string;
  onClose: () => void;
  onApply: (text: string) => void;
}

export function AIDrawer({ open, fieldLabel, fieldValue, context, onClose, onApply }: AIDrawerProps) {
  const [model, setModel] = useState("claude-3-5-sonnet");
  const [tone, setTone] = useState<Tone>("Engineering-focused");
  const [prompt, setPrompt] = useState("Add concrete metrics to the outcomes. Make it more compelling for technical recruiters.");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [sourceExpanded, setSourceExpanded] = useState(false);
  const [applied, setApplied] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setResponse("");
      setStreaming(false);
      setApplied(false);
      setTokenCount(0);
      if (streamRef.current) clearInterval(streamRef.current);
    }
  }, [open]);

  function handleGenerate() {
    if (streamRef.current) clearInterval(streamRef.current);
    setResponse("");
    setStreaming(true);
    setApplied(false);
    setTokenCount(0);
    const target = MOCK_RESPONSES[tone] || MOCK_RESPONSES["Direct"];
    let i = 0;
    streamRef.current = setInterval(() => {
      i += 3;
      setResponse(target.slice(0, i));
      setTokenCount(Math.floor(i / 4));
      if (i >= target.length) {
        clearInterval(streamRef.current!);
        setStreaming(false);
        setTokenCount(Math.floor(target.length / 4));
      }
    }, 18);
  }

  function handleApply() {
    onApply(response);
    setApplied(true);
    setTimeout(onClose, 600);
  }

  const selectedModel = MODELS.find((m) => m.id === model)!;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => {
          if (streaming) return;
          onClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          zIndex: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 300ms ease-out",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 400,
          zIndex: 50,
          background: "linear-gradient(135deg, rgba(24,24,27,0.97), rgba(9,9,11,0.99))",
          backdropFilter: "blur(18px)",
          borderLeft: "1px solid var(--cms-border-dark)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--cms-border-dark)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Wand2 size={16} style={{ color: "#a78bfa" }} />
              <span style={{ color: "var(--cms-text-primary)", fontSize: 16, fontWeight: 600 }}>
                AI Copywriter
              </span>
            </div>
            <div style={{ color: "var(--cms-text-secondary)", fontSize: 12 }}>
              Editing: <span style={{ color: "#a78bfa" }}>{context || fieldLabel}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--cms-text-secondary)",
              padding: 4,
              display: "flex",
              alignItems: "center",
              borderRadius: 6,
            }}
            className="hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Model Selection */}
          <div>
            <label style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
              Model
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 32px 9px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--cms-border-dark)",
                  borderRadius: 8,
                  color: "var(--cms-text-primary)",
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                  outline: "none",
                  appearance: "none",
                  cursor: "pointer",
                }}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: "#18181b" }}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--cms-text-secondary)", pointerEvents: "none" }} />
            </div>
            <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, marginTop: 5 }}>
              {selectedModel.hint}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 8 }}>
              Tone
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  style={{
                    padding: "6px 12px",
                    background: tone === t ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${tone === t ? "rgba(167,139,250,0.35)" : "var(--cms-border-dark)"}`,
                    borderRadius: 6,
                    color: tone === t ? "#a78bfa" : "var(--cms-text-secondary)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 150ms",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
              Instructions
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder='e.g. "Add concrete metrics to the outcomes."'
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--cms-border-dark)",
                borderRadius: 8,
                color: "var(--cms-text-primary)",
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                resize: "vertical",
                lineHeight: "21px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Source Text Summary */}
          <div>
            <button
              onClick={() => setSourceExpanded((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--cms-text-secondary)",
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                padding: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <ChevronDown
                size={12}
                style={{ transform: sourceExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 150ms" }}
              />
              Current Text
            </button>
            {sourceExpanded && (
              <div
                style={{
                  marginTop: 8,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--cms-border-dark)",
                  borderRadius: 8,
                  color: "var(--cms-text-secondary)",
                  fontSize: 12,
                  lineHeight: "20px",
                  fontStyle: "italic",
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              >
                {fieldValue || "(empty)"}
              </div>
            )}
          </div>

          {/* Response Area */}
          {(response || streaming) && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <label style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Response
                </label>
                <span style={{ color: "var(--cms-text-secondary)", fontSize: 11 }}>
                  {selectedModel.label} · ~{tokenCount} tokens
                </span>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(167,139,250,0.04)",
                  border: "1px solid rgba(167,139,250,0.12)",
                  borderRadius: 8,
                  color: "var(--cms-text-primary)",
                  fontSize: 13,
                  lineHeight: "22px",
                  minHeight: 80,
                  whiteSpace: "pre-wrap",
                }}
              >
                {response}
                {streaming && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 14,
                      background: "#a78bfa",
                      marginLeft: 2,
                      verticalAlign: "middle",
                      animation: "blink 0.8s step-end infinite",
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--cms-border-dark)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={streaming}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 16px",
              background: "rgba(167,139,250,0.15)",
              border: "1px solid rgba(167,139,250,0.3)",
              borderRadius: 8,
              color: "#a78bfa",
              cursor: streaming ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              opacity: streaming ? 0.6 : 1,
              transition: "opacity 150ms",
            }}
          >
            {streaming ? (
              <>
                <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                Generating...
              </>
            ) : response ? (
              <>
                <RefreshCw size={14} />
                Regenerate
              </>
            ) : (
              <>
                <Wand2 size={14} />
                Generate
              </>
            )}
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {response && !streaming && (
              <button
                onClick={handleApply}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "9px 14px",
                  background: applied ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
                  border: `1px solid ${applied ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.3)"}`,
                  borderRadius: 8,
                  color: applied ? "var(--cms-accent-emerald)" : "var(--cms-accent-cobalt)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 250ms",
                }}
              >
                {applied ? <Check size={14} /> : <Check size={14} />}
                {applied ? "Applied!" : "Accept & Apply"}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                flex: response && !streaming ? "0 0 auto" : 1,
                padding: "9px 14px",
                background: "transparent",
                border: "1px solid var(--cms-border-dark)",
                borderRadius: 8,
                color: "var(--cms-text-secondary)",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                transition: "border-color 150ms, color 150ms",
              }}
              className="hover:text-white hover:border-white/20"
            >
              Cancel
            </button>
          </div>
        </div>

        <style>{`
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}
