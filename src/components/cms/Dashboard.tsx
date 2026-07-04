import { useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Zap,
  FolderOpen,
  Bot,
  Github,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Plus,
  Code,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const SPARKLINE_DATA = [
  { v: 800 }, { v: 1200 }, { v: 950 }, { v: 1400 }, { v: 1100 },
  { v: 1800 }, { v: 1500 }, { v: 2100 }, { v: 1700 }, { v: 2400 },
];

const ACTIVITY = [
  { type: "commit", text: 'Commit pushed to main', meta: "8ef1c3b", time: "2 min ago", exact: "Jun 14 2026, 14:32 UTC" },
  { type: "bot", text: "Chatbot knowledge updated", meta: "knowledge.json", time: "18 min ago", exact: "Jun 14 2026, 14:16 UTC" },
  { type: "deploy", text: "Deployment complete", meta: "Pages CI #142", time: "3 min ago", exact: "Jun 14 2026, 14:31 UTC" },
  { type: "commit", text: "Commit pushed to main", meta: "a1d9f72", time: "1h ago", exact: "Jun 14 2026, 13:34 UTC" },
  { type: "bot", text: "Chatbot knowledge updated", meta: "knowledge.json", time: "2h ago", exact: "Jun 14 2026, 12:44 UTC" },
];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(135deg, rgba(24,24,27,0.9), rgba(9,9,11,0.95))",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--cms-border-glass)",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function KpiCard({
  title,
  metric,
  sub,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  metric: string;
  sub: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  iconColor: string;
  children?: React.ReactNode;
}) {
  return (
    <GlassCard>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: "var(--cms-text-secondary)", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {title}
          </span>
          <div style={{ background: `${iconColor}18`, borderRadius: 8, padding: 8 }}>
            <Icon size={16} style={{ color: iconColor }} />
          </div>
        </div>
        <div style={{ color: "var(--cms-text-primary)", fontSize: 28, fontWeight: 600, lineHeight: "36px" }}>
          {metric}
        </div>
        <div style={{ color: "var(--cms-text-secondary)", fontSize: 12, marginTop: 4 }}>
          {sub}
        </div>
        {children}
      </div>
    </GlassCard>
  );
}

interface DashboardProps {
  onNavigate: (route: "chatbot" | "projects") => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [rebuilding, setRebuilding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleRebuild() {
    setRebuilding(true);
    setShowConfirm(false);
    setTimeout(() => {
      setRebuilding(false);
      toast.success("Rebuild triggered", { description: "GitHub Pages CI has been queued.", duration: 4000 });
    }, 2000);
  }

  return (
    <div
      style={{
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        height: "100%",
        overflowY: "auto",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Page heading */}
      <div>
        <h1 style={{ color: "var(--cms-text-primary)", fontSize: 24, fontWeight: 600, lineHeight: "32px", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--cms-text-secondary)", fontSize: 14, margin: "4px 0 0" }}>
          Portfolio health, GitHub status, and quick actions.
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {/* Portfolio Views */}
        <KpiCard title="Portfolio Views" metric="12.4k" sub="Last 30 days" icon={Globe} iconColor="var(--cms-accent-cobalt)">
          <div style={{ marginTop: 12, height: 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARKLINE_DATA}>
                <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={1.5} fill="rgba(59,130,246,0.12)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </KpiCard>

        {/* Active Projects */}
        <KpiCard title="Active Projects" metric="8" sub="Projects in projects.json" icon={FolderOpen} iconColor="var(--cms-accent-emerald)">
          <div
            style={{
              marginTop: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 20,
              fontSize: 11,
              color: "var(--cms-accent-emerald)",
            }}
          >
            Last updated: AquaDot
          </div>
        </KpiCard>

        {/* Chatbot Queries */}
        <KpiCard title="Chatbot Queries" metric="312" sub="Coverage: 86% resolved" icon={Bot} iconColor="#a78bfa">
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 56, height: 56 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart id="dashboard-chatbot-pie-chart">
                  <Pie data={[{ v: 270 }, { v: 42 }]} dataKey="v" innerRadius={18} outerRadius={26} startAngle={90} endAngle={-270} strokeWidth={0}>
                    <Cell fill="var(--cms-accent-emerald)" />
                    <Cell fill="rgba(244,63,94,0.4)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div style={{ color: "var(--cms-text-primary)", fontSize: 12 }}>270 resolved</div>
              <div style={{ color: "var(--cms-accent-rose)", fontSize: 12 }}>42 unmatched</div>
            </div>
          </div>
        </KpiCard>

        {/* GitHub Status */}
        <KpiCard title="GitHub Status" metric="Active" sub="Octokit token valid" icon={Github} iconColor="var(--cms-text-secondary)">
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ color: "var(--cms-text-secondary)", fontSize: 12 }}>
              Latency: <span style={{ color: "var(--cms-accent-emerald)" }}>120 ms</span>
            </div>
            <div style={{ color: "var(--cms-text-secondary)", fontSize: 12 }}>
              Last commit:{" "}
              <span style={{ color: "var(--cms-text-primary)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                8ef1c3b
              </span>
            </div>
            <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, marginTop: 2 }}>
              Remaining: <span style={{ color: "var(--cms-text-primary)" }}>4960/5000</span> — resets 16:00 UTC
            </div>
          </div>
        </KpiCard>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
        {/* Quick Actions */}
        <GlassCard>
          <div className="p-5">
            <h2 style={{ color: "var(--cms-text-primary)", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>
              Quick Actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Force Rebuild */}
              <button
                onClick={() => setShowConfirm(true)}
                disabled={rebuilding}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: rebuilding ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 8,
                  color: "var(--cms-accent-cobalt)",
                  cursor: rebuilding ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  transition: "background 150ms",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <RefreshCw size={16} style={{ animation: rebuilding ? "spin 1s linear infinite" : "none" }} />
                Force Rebuild Website
              </button>

              <button
                onClick={() => window.open("https://lalitkishore.is-a.dev", "_blank")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: "transparent",
                  border: "1px solid var(--cms-border-glass)",
                  borderRadius: 8,
                  color: "var(--cms-text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  transition: "border-color 150ms, color 150ms",
                  width: "100%",
                  textAlign: "left",
                }}
                className="hover:border-white/20 hover:text-white"
              >
                <ExternalLink size={16} />
                View Live Site
              </button>

              <button
                onClick={() => onNavigate("chatbot")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: "transparent",
                  border: "1px solid var(--cms-border-glass)",
                  borderRadius: 8,
                  color: "var(--cms-text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  transition: "border-color 150ms, color 150ms",
                  width: "100%",
                  textAlign: "left",
                }}
                className="hover:border-white/20 hover:text-white"
              >
                <MessageSquare size={16} />
                Review Unresolved Chat Queries
                <span
                  style={{
                    marginLeft: "auto",
                    background: "rgba(244,63,94,0.15)",
                    color: "var(--cms-accent-rose)",
                    borderRadius: 10,
                    padding: "2px 8px",
                    fontSize: 12,
                  }}
                >
                  42
                </span>
              </button>

              <button
                onClick={() => onNavigate("projects")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: "transparent",
                  border: "1px solid var(--cms-border-glass)",
                  borderRadius: 8,
                  color: "var(--cms-text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  transition: "border-color 150ms, color 150ms",
                  width: "100%",
                  textAlign: "left",
                }}
                className="hover:border-white/20 hover:text-white"
              >
                <Plus size={16} />
                Create New Case Study
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Activity Feed */}
        <GlassCard>
          <div className="p-5">
            <h2 style={{ color: "var(--cms-text-primary)", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>
              Recent Activity
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {ACTIVITY.map((item, i) => {
                const Icon = item.type === "commit" ? Code : item.type === "bot" ? Bot : Globe;
                const color = item.type === "commit" ? "var(--cms-accent-cobalt)" : item.type === "bot" ? "#a78bfa" : "var(--cms-accent-emerald)";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 0",
                      borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--cms-border-dark)" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        borderRadius: 8,
                        background: `${color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}
                    >
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ color: "var(--cms-text-primary)", fontSize: 13, fontWeight: 500 }}>
                        {item.text}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <span
                          style={{
                            color: "var(--cms-text-secondary)",
                            fontSize: 11,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {item.meta}
                        </span>
                        <span style={{ color: "var(--cms-text-secondary)", fontSize: 11 }}>·</span>
                        <span style={{ color: "var(--cms-text-secondary)", fontSize: 11 }} title={item.exact}>
                          {item.time}
                        </span>
                      </div>
                    </div>
                    <a
                      href="#"
                      style={{
                        color: "var(--cms-accent-cobalt)",
                        fontSize: 11,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        whiteSpace: "nowrap",
                        opacity: 0.7,
                      }}
                      className="hover:opacity-100"
                    >
                      GitHub <ExternalLink size={10} />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Rebuild confirmation modal */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{
              background: "var(--cms-bg-card)",
              border: "1px solid var(--cms-border-dark)",
              borderRadius: 12,
              padding: 28,
              width: 420,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
              <AlertTriangle size={20} style={{ color: "var(--cms-accent-rose)", marginTop: 2 }} />
              <div>
                <div style={{ color: "var(--cms-text-primary)", fontSize: 16, fontWeight: 600 }}>
                  Force Rebuild Website?
                </div>
                <div style={{ color: "var(--cms-text-secondary)", fontSize: 13, marginTop: 6, lineHeight: "20px" }}>
                  This will trigger a GitHub Pages CI run immediately. The site may be briefly unavailable
                  during deployment (~2–3 minutes).
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: "1px solid var(--cms-border-dark)",
                  borderRadius: 6,
                  color: "var(--cms-text-secondary)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRebuild}
                style={{
                  padding: "8px 16px",
                  background: "rgba(244,63,94,0.15)",
                  border: "1px solid rgba(244,63,94,0.3)",
                  borderRadius: 6,
                  color: "var(--cms-accent-rose)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Rebuild Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
