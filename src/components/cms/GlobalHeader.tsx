import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type ActiveScreen = "analytics" | "editor" | "auditor";
export type EditingContext = "overview" | "projects" | "skills" | "timeline" | "profile";

const CONTEXT_LABELS: Record<EditingContext, string> = {
  overview: "Portfolio Overview",
  projects: "Projects",
  skills: "Skills",
  timeline: "Timeline",
  profile: "Profile",
};

const TABS: { id: ActiveScreen; label: string }[] = [
  { id: "analytics", label: "Analytics" },
  { id: "editor", label: "Canvas Editor" },
  { id: "auditor", label: "Chatbot Auditor" },
];

interface GlobalHeaderProps {
  screen: ActiveScreen;
  editingContext: EditingContext;
  onScreenChange: (s: ActiveScreen) => void;
  onContextChange: (c: EditingContext) => void;
}

export function GlobalHeader({ screen, editingContext, onScreenChange, onContextChange }: GlobalHeaderProps) {
  const [contextOpen, setContextOpen] = useState(false);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        zIndex: 200,
        background: "#09090b",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Left: wordmark + context selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginRight: 8 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            L
          </div>
          <span style={{ color: "#fafafa", fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Portfolio CMS
          </span>
        </div>

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />

        {/* Context selector — only in editor mode */}
        {screen === "editor" && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setContextOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                cursor: "pointer",
                color: "#a1a1aa",
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                transition: "background 120ms",
              }}
              className="hover:bg-white/[0.08]"
            >
              <span style={{ color: "#a1a1aa" }}>Editing:</span>
              <span style={{ color: "#fafafa", fontWeight: 500 }}>
                {CONTEXT_LABELS[editingContext]}
              </span>
              <ChevronDown
                size={12}
                style={{ color: "#71717a", transform: contextOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }}
              />
            </button>

            {contextOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 190 }} onClick={() => setContextOpen(false)} />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    zIndex: 195,
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    padding: 4,
                    minWidth: 190,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                  }}
                >
                  {(Object.keys(CONTEXT_LABELS) as EditingContext[]).map((ctx) => (
                    <button
                      key={ctx}
                      onClick={() => { onContextChange(ctx); setContextOpen(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        padding: "7px 10px",
                        background: ctx === editingContext ? "rgba(59,130,246,0.1)" : "transparent",
                        border: "none",
                        borderRadius: 5,
                        color: ctx === editingContext ? "#3b82f6" : "#a1a1aa",
                        cursor: "pointer",
                        fontSize: 12,
                        fontFamily: "'Inter', sans-serif",
                        textAlign: "left",
                        transition: "background 80ms, color 80ms",
                      }}
                      className={ctx !== editingContext ? "hover:bg-white/[0.04] hover:text-white" : ""}
                    >
                      {CONTEXT_LABELS[ctx]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Center: Tab switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: 3,
          gap: 1,
        }}
      >
        {TABS.map(({ id, label }) => {
          const isActive = screen === id;
          return (
            <button
              key={id}
              onClick={() => onScreenChange(id)}
              style={{
                padding: "5px 14px",
                background: isActive ? "#18181b" : "transparent",
                border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                borderRadius: 6,
                color: isActive ? "#fafafa" : "#71717a",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                fontFamily: "'Inter', sans-serif",
                transition: "all 120ms",
                letterSpacing: isActive ? "-0.005em" : "0",
                boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.04)" : "none",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Right: spacer */}
      <div style={{ flex: 1 }} />
    </header>
  );
}
