import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ChevronDown, Globe, Clock, Check } from "lucide-react";
import { toast } from "sonner";

/* --- Knowledge base ------------------------------------------- */

const KNOWLEDGE: Record<string, string> = {
  aquadot: "AquaDot is an IoT water quality monitoring system using an ESP32, TensorFlow Lite edge inference, and a React dashboard. It achieved 94% anomaly detection accuracy and reduced monitoring costs by 60% across 3 deployed fish farms.",
  careersight: "CareerSight is a resume-to-JD semantic matching tool using BERT embeddings. It provides skill gap analysis and interview readiness scores. Built with FastAPI, React, and Supabase.",
  smartflow: "SmartFlow IV is an automated intravenous drip monitor using ultrasonic sensing and WebSocket-powered React dashboards for ward nurses. Deployed in 2 hospitals, reducing IV adverse events by 40%.",
  profile: "Lalit Kishore is an ECE + Data Science engineer specializing in embedded systems, ML inference, and full-stack development. Currently open to full-time roles globally.",
};

function getKnowledgeAnswer(question: string): string | null {
  const q = question.toLowerCase();
  if (q.includes("aquadot") || q.includes("water quality") || q.includes("fish")) return KNOWLEDGE.aquadot;
  if (q.includes("careersight") || q.includes("resume") || q.includes("job match")) return KNOWLEDGE.careersight;
  if (q.includes("smartflow") || q.includes("iv") || q.includes("drip") || q.includes("hospital")) return KNOWLEDGE.smartflow;
  if (q.includes("lalit") || q.includes("who are you") || q.includes("about you") || q.includes("hire") || q.includes("available")) return KNOWLEDGE.profile;
  return null;
}

/* --- Chat types ----------------------------------------------- */

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  isFallback?: boolean;
}

interface TrainingBlock {
  messageId: string;
  category: string;
  answer: string;
  committed: boolean;
}

/* --- Query log ------------------------------------------------ */

type QueryStatus = "unreviewed" | "in-review" | "resolved";

interface QueryEntry {
  id: string;
  question: string;
  country: string;
  time: string;
  status: QueryStatus;
}

const MOCK_QUERIES: QueryEntry[] = [
  { id: "q1", question: "What microcontrollers did you use in Burfi Stock Manager?", country: "IN", time: "12h ago", status: "unreviewed" },
  { id: "q2", question: "Are you open to full-time roles outside India?", country: "DE", time: "1d ago", status: "unreviewed" },
  { id: "q3", question: "What dataset did you use to train LADA AI?", country: "US", time: "2d ago", status: "unreviewed" },
  { id: "q4", question: "How does CareerSight handle privacy?", country: "CA", time: "3d ago", status: "in-review" },
  { id: "q5", question: "What is your GPA?", country: "UK", time: "5d ago", status: "resolved" },
];

const CATEGORIES = [
  "General Profile",
  "AquaDot",
  "SmartFlow IV",
  "Med Inventory",
  "Burfi Stock Manager",
  "Smart Parking",
  "Farmex AI",
  "CareerSight",
  "LADA AI",
  "Other",
];

/* --- Status dot ----------------------------------------------- */

const STATUS_STYLE: Record<QueryStatus, { dot: string; label: string }> = {
  unreviewed: { dot: "#f59e0b", label: "Unreviewed" },
  "in-review": { dot: "var(--cms-accent-cobalt)", label: "In Review" },
  resolved: { dot: "var(--cms-accent-emerald)", label: "Resolved" },
};

/* --- Main component ------------------------------------------- */

export function ChatbotAuditor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Hi! I'm Lalit's portfolio chatbot. Ask me anything about his projects, skills, or experience.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [trainingBlocks, setTrainingBlocks] = useState<Record<string, TrainingBlock>>({});
  const [queries, setQueries] = useState<QueryEntry[]>(MOCK_QUERIES);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, trainingBlocks]);

  function handleSend() {
    const q = input.trim();
    if (!q) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const answer = getKnowledgeAnswer(q);
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: answer ?? "I don't have information about that yet. You can train me by filling in the answer below.",
        timestamp: new Date(),
        isFallback: !answer,
      };
      setMessages((prev) => [...prev, botMsg]);

      if (!answer) {
        setTrainingBlocks((prev) => ({
          ...prev,
          [botMsg.id]: { messageId: botMsg.id, category: "", answer: "", committed: false },
        }));
      }
    }, 700);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function injectQuery(q: QueryEntry) {
    setInput(q.question);
    setQueries((prev) =>
      prev.map((entry) =>
        entry.id === q.id ? { ...entry, status: "in-review" as QueryStatus } : entry
      )
    );
  }

  function handleTrain(messageId: string) {
    const block = trainingBlocks[messageId];
    if (!block.category || !block.answer.trim()) {
      toast.error("Please select a category and provide an answer.");
      return;
    }
    // Mark as committed
    setTrainingBlocks((prev) => ({
      ...prev,
      [messageId]: { ...prev[messageId], committed: true },
    }));
    // Mark relevant query as resolved
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      setQueries((prev) =>
        prev.map((q) =>
          q.status === "in-review" && msg.content.toLowerCase().includes(q.question.toLowerCase().slice(0, 20))
            ? { ...q, status: "resolved" }
            : q
        )
      );
    }
    toast.success("Committed to knowledge.json", {
      description: `feat(chatbot): add answer for "${block.answer.slice(0, 40)}..."`,
    });
  }

  const unreviewedCount = queries.filter((q) => q.status === "unreviewed").length;

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        paddingTop: 64,
      }}
    >
      {/* -- Left: Chat Simulator -- */}
      <div
        style={{
          flex: "0 0 60%",
          borderRight: "1px solid var(--cms-border-dark)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Chat header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--cms-border-dark)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={16} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600 }}>
              Portfolio Chatbot — Live Simulator
            </div>
            <div style={{ color: "var(--cms-accent-emerald)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--cms-accent-emerald)", display: "inline-block" }} />
              Online · Mirrors live chatbot behavior
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((msg) => (
            <div key={msg.id}>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: msg.role === "user" ? "rgba(59,130,246,0.15)" : "rgba(167,139,250,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {msg.role === "user" ? (
                    <User size={13} style={{ color: "var(--cms-accent-cobalt)" }} />
                  ) : (
                    <Bot size={13} style={{ color: "#a78bfa" }} />
                  )}
                </div>

                {/* Bubble */}
                <div
                  style={{
                    maxWidth: "72%",
                    padding: "10px 14px",
                    background: msg.role === "user"
                      ? "rgba(59,130,246,0.12)"
                      : msg.isFallback
                      ? "rgba(244,63,94,0.06)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${msg.isFallback ? "rgba(244,63,94,0.15)" : msg.role === "user" ? "rgba(59,130,246,0.2)" : "var(--cms-border-glass)"}`,
                    borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                    color: "var(--cms-text-primary)",
                    fontSize: 13,
                    lineHeight: "21px",
                  }}
                >
                  {msg.content}
                  {msg.isFallback && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "var(--cms-accent-rose)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--cms-accent-rose)", display: "inline-block" }} />
                      Fallback — training required
                    </div>
                  )}
                </div>
              </div>

              {/* Inline training block for fallback messages */}
              {msg.isFallback && trainingBlocks[msg.id] && !trainingBlocks[msg.id].committed && (
                <div
                  style={{
                    marginLeft: 38,
                    marginTop: 10,
                    padding: 14,
                    background: "rgba(24,24,27,0.8)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>
                    TRAIN BOT — add knowledge for this query
                  </div>

                  {/* Category */}
                  <div style={{ position: "relative" }}>
                    <select
                      value={trainingBlocks[msg.id].category}
                      onChange={(e) =>
                        setTrainingBlocks((prev) => ({
                          ...prev,
                          [msg.id]: { ...prev[msg.id], category: e.target.value },
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "7px 28px 7px 10px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--cms-border-dark)",
                        borderRadius: 7,
                        color: trainingBlocks[msg.id].category ? "var(--cms-text-primary)" : "var(--cms-text-secondary)",
                        fontSize: 12,
                        fontFamily: "'Inter', sans-serif",
                        outline: "none",
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="" style={{ background: "var(--cms-bg-card)" }}>Select category...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} style={{ background: "var(--cms-bg-card)" }}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--cms-text-secondary)", pointerEvents: "none" }} />
                  </div>

                  {/* Answer textarea */}
                  <textarea
                    value={trainingBlocks[msg.id].answer}
                    onChange={(e) =>
                      setTrainingBlocks((prev) => ({
                        ...prev,
                        [msg.id]: { ...prev[msg.id], answer: e.target.value },
                      }))
                    }
                    rows={3}
                    placeholder="Write a concise, helpful answer for site visitors..."
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--cms-border-dark)",
                      borderRadius: 7,
                      color: "var(--cms-text-primary)",
                      fontSize: 12,
                      fontFamily: "'Inter', sans-serif",
                      outline: "none",
                      resize: "vertical",
                      lineHeight: "20px",
                      boxSizing: "border-box",
                    }}
                  />

                  <button
                    onClick={() => handleTrain(msg.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "8px 14px",
                      background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      borderRadius: 7,
                      color: "var(--cms-accent-cobalt)",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <Send size={12} />
                    Train Bot & Commit to GitHub
                  </button>
                </div>
              )}

              {/* Trained confirmation */}
              {msg.isFallback && trainingBlocks[msg.id]?.committed && (
                <div
                  style={{
                    marginLeft: 38,
                    marginTop: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: 8,
                    fontSize: 11,
                    color: "var(--cms-accent-emerald)",
                  }}
                >
                  <Check size={11} />
                  Trained & committed to knowledge.json
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--cms-border-dark)",
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a query to test coverage..."
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--cms-border-dark)",
              borderRadius: 10,
              color: "var(--cms-text-primary)",
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              outline: "none",
              resize: "none",
              lineHeight: "21px",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              width: 38,
              height: 38,
              background: input.trim() ? "var(--cms-accent-cobalt)" : "rgba(255,255,255,0.05)",
              border: "none",
              borderRadius: 10,
              cursor: input.trim() ? "pointer" : "not-allowed",
              color: input.trim() ? "#fff" : "var(--cms-text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 150ms",
              flexShrink: 0,
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* -- Right: Unresolved Query Log -- */}
      <div
        style={{
          flex: "0 0 40%",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--cms-border-dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600 }}>
            Unresolved Query Log
          </div>
          {unreviewedCount > 0 && (
            <div
              style={{
                padding: "2px 9px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 12,
                fontSize: 11,
                color: "#f59e0b",
              }}
            >
              {unreviewedCount} unreviewed
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {queries.map((q) => {
            const s = STATUS_STYLE[q.status];
            return (
              <div
                key={q.id}
                onClick={() => injectQuery(q)}
                style={{
                  padding: "13px 18px",
                  borderBottom: "1px solid var(--cms-border-dark)",
                  cursor: "pointer",
                  transition: "background 120ms",
                  opacity: q.status === "resolved" ? 0.55 : 1,
                }}
                className="hover:bg-white/[0.02]"
              >
                <div style={{ color: "var(--cms-text-primary)", fontSize: 13, lineHeight: "20px", marginBottom: 8 }}>
                  {q.question}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: s.dot,
                        display: "inline-block",
                      }}
                    />
                    <span style={{ fontSize: 11, color: s.dot }}>{s.label}</span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--cms-text-secondary)" }}>
                    <Globe size={10} />
                    {q.country}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--cms-text-secondary)" }}>
                    <Clock size={10} />
                    {q.time}
                  </span>
                  {q.status !== "resolved" && (
                    <span style={{ marginLeft: "auto", color: "var(--cms-accent-cobalt)", fontSize: 11 }}>
                      → Test
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
