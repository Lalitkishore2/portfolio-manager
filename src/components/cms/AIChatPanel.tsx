import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus, ArrowUp, GitCommit } from "lucide-react";

const VERSIONS = [
  { sha: "8ef1c3b", msg: "chore(content): update projects.json", time: "Jun 15, 2026, 3:41 AM", label: "Version 4" },
  { sha: "a1d9f72", msg: "feat(chatbot): add answer for AquaDot edge ML", time: "Jun 14, 2026, 9:12 PM", label: "Version 3" },
  { sha: "c3e8f01", msg: "chore(content): update profile.json", time: "Jun 14, 2026, 2:05 PM", label: "Version 2" },
  { sha: "b72d5a9", msg: "feat(cms): initial content setup", time: "Jun 13, 2026, 11:30 AM", label: "Version 1" },
];

const MODELS = [
  { id: "claude", label: "Claude 3.5 Sonnet" },
  { id: "llama", label: "Llama 3.1 70B" },
  { id: "gemini", label: "Gemini 1.5 Pro" },
];

interface UserMessage { id: string; role: "user"; content: string; }
interface AIMessage { id: string; role: "ai"; reasoning: string; actionSummary: string; }
type ChatEntry = UserMessage | AIMessage;

const INITIAL_MESSAGES: ChatEntry[] = [
  {
    id: "ai-0",
    role: "ai",
    reasoning: "Context loaded: content/projects.json (3 projects), content/profile.json, content/skills.json. Ready to accept editing commands.",
    actionSummary: "3 files loaded into context",
  },
];

const AI_RESPONSES = [
  { reasoning: "Parsed command: update AquaDot overview to emphasise edge computing. Located projects.json → aquadot.overview. Rewrote to lead with edge inference. Character count: 312 (within 40–400 constraint).", actionSummary: "1 file edited: projects.json" },
  { reasoning: "Parsed command: add outcome to AquaDot. Appended 'Maintained 99.8% edge runtime uptime'. Validated: starts with past-tense verb, 47 chars.", actionSummary: "1 file edited: projects.json" },
  { reasoning: "Parsed command: rewrite bio for firmware focus. Reconstructed bio leading with embedded firmware expertise. 298 chars (within constraint).", actionSummary: "1 file edited: profile.json" },
];

interface AIChatPanelProps {
  onApplyChange: (summary: string) => void;
}

export function AIChatPanel({ onApplyChange }: AIChatPanelProps) {
  const [versionOpen, setVersionOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("claude");
  const [modelOpen, setModelOpen] = useState(false);
  const [expandedReasonings, setExpandedReasonings] = useState<Set<string>>(new Set());
  const [responding, setResponding] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const aiIdx = useRef(0);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, responding]);

  function toggleReasoning(id: string) {
    setExpandedReasonings((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(120, e.target.scrollHeight) + "px";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  function handleSubmit() {
    if (!input.trim() || responding) return;
    const userMsg: UserMessage = { id: `u-${Date.now()}`, role: "user", content: input.trim() };
    setInput("");
    if (textareaRef.current) { textareaRef.current.style.height = "36px"; }
    setMessages((prev) => [...prev, userMsg]);
    setResponding(true);
    setTimeout(() => {
      const resp = AI_RESPONSES[aiIdx.current % AI_RESPONSES.length];
      aiIdx.current++;
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: "ai", ...resp }]);
      onApplyChange(resp.actionSummary);
      setResponding(false);
    }, 1400);
  }

  const selectedModel = MODELS.find((m) => m.id === model)!;

  return (
    <div
      style={{
        width: 280,
        minWidth: 280,
        background: "#09090b",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Version history bar */}
      <div
        style={{
          height: 40,
          padding: "0 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <button
          onClick={() => setVersionOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#71717a",
            fontSize: 11,
            fontFamily: "'Inter', sans-serif",
            padding: 0,
          }}
        >
          <GitCommit size={11} style={{ color: "#3b82f6", flexShrink: 0 }} />
          <span style={{ color: "#a1a1aa", fontWeight: 500 }}>Version 4</span>
          <span style={{ color: "#3f3f46" }}>—</span>
          <span style={{ color: "#52525b", fontSize: 10 }}>Jun 15, 2026, 3:41 AM</span>
          <ChevronDown size={10} style={{ color: "#52525b", transform: versionOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
        </button>

        {versionOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setVersionOpen(false)} />
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 12,
                right: 12,
                zIndex: 155,
                background: "#18181b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: 4,
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
              }}
            >
              {VERSIONS.map((v) => (
                <div
                  key={v.sha}
                  onClick={() => setVersionOpen(false)}
                  style={{ padding: "7px 10px", borderRadius: 5, cursor: "pointer" }}
                  className="hover:bg-white/[0.04]"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <span style={{ color: "#e4e4e7", fontSize: 11, fontWeight: 500 }}>{v.label}</span>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#3b82f6", background: "rgba(59,130,246,0.1)", padding: "1px 5px", borderRadius: 3 }}>{v.sha}</span>
                  </div>
                  <div style={{ color: "#52525b", fontSize: 10 }}>{v.msg}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Panel label */}
      <div style={{ padding: "10px 14px 6px", flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", color: "#3f3f46", textTransform: "uppercase" }}>
          AI Assistant
        </span>
      </div>

      {/* Chat feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 14px 14px", display: "flex", flexDirection: "column", gap: 18 }}>
        {messages.map((msg) => (
          <ChatMessageEl
            key={msg.id}
            msg={msg}
            expanded={expandedReasonings.has(msg.id)}
            onToggle={() => toggleReasoning(msg.id)}
          />
        ))}

        {responding && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", color: "#3b82f6", textTransform: "uppercase" }}>Assistant</div>
            <div style={{ display: "flex", gap: 4, paddingLeft: 2 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#52525b", display: "inline-block", animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={feedEndRef} />
      </div>

      {/* Input area */}
      <div style={{ padding: "10px 12px 12px", flexShrink: 0 }}>
        <div
          style={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask for changes..."
            rows={1}
            style={{
              width: "100%",
              minHeight: 36,
              maxHeight: 120,
              padding: "10px 12px 4px",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fafafa",
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              resize: "none",
              lineHeight: "20px",
              boxSizing: "border-box",
            }}
          />

          {/* Action row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                title="Attach JSON context"
                style={{
                  width: 26, height: 26,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6, color: "#52525b", cursor: "pointer",
                  transition: "border-color 120ms, color 120ms",
                }}
                className="hover:border-white/20 hover:text-white"
              >
                <Plus size={12} />
              </button>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setModelOpen((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "3px 8px",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20, color: "#52525b", cursor: "pointer",
                    fontSize: 10, fontFamily: "'Inter', sans-serif",
                    transition: "all 120ms", whiteSpace: "nowrap",
                  }}
                  className="hover:border-white/15 hover:text-zinc-400"
                >
                  {selectedModel.label}
                  <ChevronDown size={9} />
                </button>

                {modelOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setModelOpen(false)} />
                    <div
                      style={{
                        position: "absolute", bottom: "calc(100% + 6px)", left: 0, zIndex: 155,
                        background: "#18181b", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 7, padding: 3, minWidth: 160,
                        boxShadow: "0 -12px 30px rgba(0,0,0,0.5)",
                      }}
                    >
                      {MODELS.map((m) => (
                        <button key={m.id} onClick={() => { setModel(m.id); setModelOpen(false); }}
                          style={{
                            display: "flex", width: "100%", padding: "6px 9px",
                            background: m.id === model ? "rgba(59,130,246,0.08)" : "transparent",
                            border: "none", borderRadius: 4,
                            color: m.id === model ? "#3b82f6" : "#71717a",
                            cursor: "pointer", fontSize: 11, fontFamily: "'Inter', sans-serif", textAlign: "left",
                          }}
                          className={m.id !== model ? "hover:text-zinc-300 hover:bg-white/[0.03]" : ""}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || responding}
              style={{
                width: 26, height: 26,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#3b82f6",
                border: "none", borderRadius: 7,
                cursor: input.trim() && !responding ? "pointer" : "not-allowed",
                color: "#fff",
                opacity: !input.trim() || responding ? 0.35 : 1,
                transition: "opacity 150ms",
                boxShadow: input.trim() && !responding ? "0 0 0 1px rgba(59,130,246,0.5), 0 2px 8px rgba(59,130,246,0.4)" : "none",
              }}
            >
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dotPulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function ChatMessageEl({ msg, expanded, onToggle }: { msg: ChatEntry; expanded: boolean; onToggle: () => void }) {
  if (msg.role === "user") {
    return (
      <div style={{ animation: "slideUp 200ms ease-out" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", color: "#52525b", textTransform: "uppercase", marginBottom: 5 }}>
          Prompt
        </div>
        <div
          style={{
            padding: "8px 10px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 7,
            color: "#e4e4e7",
            fontSize: 13,
            lineHeight: "20px",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "slideUp 200ms ease-out" }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", color: "#3b82f6", textTransform: "uppercase", marginBottom: 6 }}>
        Assistant
      </div>

      {/* Reasoning accordion */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 7,
          marginBottom: 7,
          overflow: "hidden",
        }}
      >
        <button
          onClick={onToggle}
          style={{
            display: "flex", alignItems: "center", gap: 5, width: "100%",
            padding: "6px 10px", background: "transparent", border: "none",
            cursor: "pointer", color: "#52525b", fontSize: 11, fontFamily: "'Inter', sans-serif", textAlign: "left",
          }}
        >
          <ChevronRight size={11} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 150ms", flexShrink: 0 }} />
          {expanded ? "Hide reasoning" : "Show reasoning..."}
        </button>

        {expanded && (
          <div style={{ margin: "0 10px 8px", padding: "6px 8px", borderLeft: "2px solid rgba(59,130,246,0.4)" }}>
            <p style={{ color: "#52525b", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", lineHeight: "18px", margin: 0 }}>
              {msg.reasoning}
            </p>
          </div>
        )}
      </div>

      {/* Action chip */}
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "2px 8px",
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 20,
          fontSize: 10,
          color: "#60a5fa",
        }}
      >
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
        {msg.actionSummary}
      </div>
    </div>
  );
}
