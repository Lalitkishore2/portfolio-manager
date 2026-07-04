import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Clock, GitBranch } from "lucide-react";

export type CanvasSection =
  | "dashboard"
  | "profile"
  | "projects"
  | "arsenal"
  | "timeline"
  | "chatbot";

const SECTION_LABELS: Record<CanvasSection, string> = {
  dashboard: "Dashboard",
  profile: "Profile / Hero",
  projects: "Projects CMS",
  arsenal: "Technical Arsenal",
  timeline: "Timeline",
  chatbot: "Chatbot Knowledge",
};

interface FloatingHeaderProps {
  section: CanvasSection;
  subPath?: string;
  hasPendingChanges: boolean;
  onNavigate: (s: CanvasSection) => void;
  onBack: () => void;
}

export function FloatingHeader({
  section,
  subPath,
  hasPendingChanges,
  onNavigate,
  onBack,
}: FloatingHeaderProps) {
  const [secondsLeft, setSecondsLeft] = useState(26 * 60 + 14);
  const [showSectionMenu, setShowSectionMenu] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isLowSession = secondsLeft < 300;

  const SECTIONS: CanvasSection[] = ["dashboard", "profile", "projects", "arsenal", "timeline", "chatbot"];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 100,
        background: "rgba(24,24,27,0.72)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--cms-border-glass)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 16,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Left: Back + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        {section !== "dashboard" && (
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--cms-text-secondary)",
              display: "flex",
              alignItems: "center",
              padding: "6px",
              borderRadius: 6,
              transition: "color 150ms",
            }}
            className="hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        {/* Breadcrumb / section switcher */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowSectionMenu((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--cms-border-glass)",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              color: "var(--cms-text-secondary)",
              fontSize: 13,
              transition: "background 150ms",
            }}
            className="hover:bg-white/[0.08]"
          >
            <span style={{ color: "var(--cms-text-secondary)" }}>Editing:</span>
            <span style={{ color: "var(--cms-text-primary)", fontWeight: 500 }}>
              {SECTION_LABELS[section]}
              {subPath && ` / ${subPath}`}
            </span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ color: "var(--cms-text-secondary)", opacity: 0.5 }}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showSectionMenu && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 90 }}
                onClick={() => setShowSectionMenu(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: "var(--cms-bg-card)",
                  border: "1px solid var(--cms-border-dark)",
                  borderRadius: 10,
                  padding: 6,
                  zIndex: 95,
                  minWidth: 200,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                }}
              >
                {SECTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { onNavigate(s); setShowSectionMenu(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      padding: "8px 12px",
                      background: s === section ? "rgba(59,130,246,0.1)" : "transparent",
                      border: "none",
                      borderRadius: 6,
                      color: s === section ? "var(--cms-accent-cobalt)" : "var(--cms-text-secondary)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "'Inter', sans-serif",
                      textAlign: "left",
                      transition: "background 100ms",
                    }}
                    className={s !== section ? "hover:bg-white/[0.04] hover:text-white" : ""}
                  >
                    {SECTION_LABELS[s]}
                    {hasPendingChanges && s === section && (
                      <span
                        style={{
                          marginLeft: "auto",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#f59e0b",
                          display: "inline-block",
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {hasPendingChanges && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 20,
              fontSize: 11,
              color: "#f59e0b",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#f59e0b",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            Unsaved changes
          </div>
        )}
      </div>

      {/* Right: Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Git sync */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--cms-border-glass)",
            borderRadius: 20,
            fontSize: 12,
            color: "var(--cms-text-secondary)",
          }}
        >
          <GitBranch size={12} style={{ color: "var(--cms-accent-emerald)" }} />
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--cms-accent-emerald)",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ color: "var(--cms-accent-emerald)" }}>main</span>
        </div>

        {/* Deploy */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--cms-border-glass)",
            borderRadius: 20,
            fontSize: 12,
            color: "var(--cms-text-secondary)",
          }}
        >
          <CheckCircle size={12} style={{ color: "var(--cms-accent-emerald)" }} />
          Live — 3 min ago
        </div>

        {/* Session timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            background: isLowSession ? "rgba(244,63,94,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isLowSession ? "var(--cms-accent-rose)" : "var(--cms-border-glass)"}`,
            borderRadius: 20,
            fontSize: 12,
            color: isLowSession ? "var(--cms-accent-rose)" : "var(--cms-text-secondary)",
            transition: "background 300ms, border-color 300ms, color 300ms",
          }}
        >
          <Clock size={12} />
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
