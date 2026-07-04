import { useState } from "react";
import { GitCommit, Trash2, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface RevisionToolbarProps {
  dirtyCount: number;
  onCommit: () => void;
  onDiscard: () => void;
}

export function RevisionToolbar({ dirtyCount, onCommit, onDiscard }: RevisionToolbarProps) {
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  async function handleCommit() {
    setCommitting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setCommitting(false);
    setCommitted(true);
    toast.success("Committed to main", {
      description: "chore(content): update projects.json",
      action: { label: "View on GitHub", onClick: () => {} },
    });
    onCommit();
    setTimeout(() => setCommitted(false), 2500);
  }

  if (dirtyCount === 0 && !committed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 90,
        display: "flex",
        gap: 10,
        alignItems: "center",
        animation: "fadeInUp 150ms ease-out",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Discard confirmation */}
      {showDiscard ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            background: "rgba(244,63,94,0.1)",
            border: "1px solid rgba(244,63,94,0.25)",
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          <span style={{ color: "var(--cms-text-secondary)" }}>Discard all changes?</span>
          <button
            onClick={() => { onDiscard(); setShowDiscard(false); }}
            style={{
              padding: "4px 10px",
              background: "rgba(244,63,94,0.15)",
              border: "1px solid rgba(244,63,94,0.3)",
              borderRadius: 6,
              color: "var(--cms-accent-rose)",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Yes, discard
          </button>
          <button
            onClick={() => setShowDiscard(false)}
            style={{
              padding: "4px 10px",
              background: "transparent",
              border: "1px solid var(--cms-border-dark)",
              borderRadius: 6,
              color: "var(--cms-text-secondary)",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowDiscard(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 16px",
            background: "rgba(24,24,27,0.9)",
            border: "1px solid var(--cms-border-dark)",
            borderRadius: 10,
            color: "var(--cms-text-secondary)",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            backdropFilter: "blur(12px)",
            transition: "border-color 150ms, color 150ms",
          }}
          className="hover:border-white/20 hover:text-white"
        >
          <Trash2 size={14} />
          Discard All
        </button>
      )}

      {/* Commit button */}
      <button
        onClick={handleCommit}
        disabled={committing || committed}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          background: committed
            ? "rgba(16,185,129,0.15)"
            : committing
            ? "rgba(59,130,246,0.15)"
            : "rgba(59,130,246,0.18)",
          border: `1px solid ${committed ? "rgba(16,185,129,0.35)" : "rgba(59,130,246,0.35)"}`,
          borderRadius: 10,
          color: committed ? "var(--cms-accent-emerald)" : "var(--cms-accent-cobalt)",
          cursor: committing || committed ? "not-allowed" : "pointer",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "'Inter', sans-serif",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          transition: "all 300ms",
        }}
      >
        {committed ? (
          <Check size={14} />
        ) : committing ? (
          <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <GitCommit size={14} />
        )}
        {committed
          ? "Committed!"
          : committing
          ? "Committing..."
          : `Accept & Commit${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
      </button>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
