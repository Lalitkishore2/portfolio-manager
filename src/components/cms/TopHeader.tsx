import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Loader2, ExternalLink, Clock, GitBranch } from "lucide-react";
import type { NavRoute } from "./Sidebar";

const ROUTE_LABELS: Record<NavRoute, string> = {
  dashboard: "Dashboard",
  profile: "Profile Editor",
  arsenal: "Technical Arsenal",
  timeline: "Timeline Editor",
  projects: "Projects CMS",
  chatbot: "Chatbot Auditor",
};

type SyncState = "synced" | "pending" | "syncing" | "failed";
type DeployState = "deployed" | "deploying" | "failed";

interface TopHeaderProps {
  activeRoute: NavRoute;
  subPath?: string;
}

export function TopHeader({ activeRoute, subPath }: TopHeaderProps) {
  const [secondsLeft, setSecondsLeft] = useState(26 * 60 + 14);
  const [syncState] = useState<SyncState>("synced");
  const [deployState] = useState<DeployState>("deployed");

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isLowSession = secondsLeft < 300;

  const syncConfig = {
    synced: { label: "Synced to main", color: "var(--cms-accent-emerald)", pulse: true },
    pending: { label: "Changes not published", color: "var(--cms-accent-cobalt)", pulse: false },
    syncing: { label: "Syncing...", color: "var(--cms-accent-cobalt)", pulse: true },
    failed: { label: "Sync failed", color: "var(--cms-accent-rose)", pulse: false },
  }[syncState];

  const deployConfig = {
    deployed: { label: "Last deploy: 3 min ago", icon: CheckCircle, color: "var(--cms-accent-emerald)" },
    deploying: { label: "Deploying...", icon: Loader2, color: "var(--cms-accent-cobalt)" },
    failed: { label: "Deploy failed", icon: AlertCircle, color: "var(--cms-accent-rose)" },
  }[deployState];

  const DeployIcon = deployConfig.icon;

  return (
    <header
      style={{
        height: 72,
        minHeight: 72,
        background: "linear-gradient(135deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))",
        borderBottom: "1px solid var(--cms-border-dark)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Breadcrumb */}
      <div className="flex-1 flex items-center gap-1" style={{ color: "var(--cms-text-secondary)", fontSize: 14 }}>
        <span>Admin</span>
        <span className="mx-1 opacity-40">/</span>
        {subPath ? (
          <>
            <span style={{ color: "var(--cms-text-secondary)" }}>{ROUTE_LABELS[activeRoute]}</span>
            <span className="mx-1 opacity-40">/</span>
            <span style={{ color: "var(--cms-text-primary)", fontWeight: 600 }}>{subPath}</span>
          </>
        ) : (
          <span style={{ color: "var(--cms-text-primary)", fontWeight: 600 }}>{ROUTE_LABELS[activeRoute]}</span>
        )}
      </div>

      {/* Right badges */}
      <div className="flex items-center gap-3">
        {/* Git Sync Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--cms-border-glass)",
            borderRadius: 20,
            fontSize: 12,
            color: "var(--cms-text-secondary)",
          }}
        >
          <GitBranch size={13} style={{ color: syncConfig.color }} />
          {syncConfig.pulse && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: syncConfig.color,
                display: "inline-block",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
          )}
          <span style={{ color: syncConfig.color }}>{syncConfig.label}</span>
        </div>

        {/* Deploy Status Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--cms-border-glass)",
            borderRadius: 20,
            fontSize: 12,
            color: "var(--cms-text-secondary)",
          }}
        >
          <DeployIcon
            size={13}
            style={{
              color: deployConfig.color,
              animation: deployState === "deploying" ? "spin 1s linear infinite" : "none",
            }}
          />
          <span>{deployConfig.label}</span>
          {deployState === "failed" && (
            <a href="#" style={{ color: "var(--cms-accent-cobalt)", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
              View logs <ExternalLink size={10} />
            </a>
          )}
        </div>

        {/* Session Timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 12px",
            background: isLowSession ? "rgba(244,63,94,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isLowSession ? "var(--cms-accent-rose)" : "var(--cms-border-glass)"}`,
            borderRadius: 20,
            fontSize: 12,
            color: isLowSession ? "var(--cms-accent-rose)" : "var(--cms-text-secondary)",
            cursor: "pointer",
            transition: "background 300ms, border-color 300ms, color 300ms",
          }}
        >
          <Clock size={13} />
          <span>
            Session: {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} remaining
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
