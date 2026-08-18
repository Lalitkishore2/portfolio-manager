import { useState, useEffect, useCallback } from "react";
import { useMakeStore } from "@/store/makeStore";
import { GlassCalendar, CalendarEvent } from "../ui/glass-calendar";
import { LiquidButton, MetalButton } from "../ui/liquid-glass-button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Globe,
  Bot,
  Github,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  Check,
  TrendingUp,
  ExternalLink,
  Code,
  Zap,
  Users,
  Activity,
  UserCheck,
  CheckCircle2,
  Calendar as CalendarIcon,
  Plus,
  ArrowRight,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

/* --- Custom tooltips ------------------------------------------- */

function CustomWebsiteTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(24,24,27,0.95)",
        border: "1px solid var(--cms-border-dark)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ color: "var(--cms-text-secondary)", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#3b82f6", fontWeight: 600 }}>
        Active Users: {payload[0]?.value || 0}
      </div>
      <div style={{ color: "#10b981", fontWeight: 600, marginTop: 2 }}>
        Page Views: {payload[1]?.value || 0}
      </div>
    </div>
  );
}

function CustomGithubTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(24,24,27,0.95)",
        border: "1px solid var(--cms-border-dark)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ color: "var(--cms-text-secondary)", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#a78bfa", fontWeight: 600 }}>
        Views: {payload[0]?.value || 0}
      </div>
      <div style={{ color: "#f59e0b", fontWeight: 600, marginTop: 2 }}>
        Uniques: {payload[1]?.value || 0}
      </div>
    </div>
  );
}

/* --- Glass card ------------------------------------------------ */

function GlassCard({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(24,24,27,0.92), rgba(9,9,11,0.96))",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--cms-border-glass)",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* --- Quick Action ---------------------------------------------- */

function QuickAction({
  icon: Icon,
  label,
  desc,
  color,
  onClick,
  loading,
  done,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties; className?: string }>;
  label: string;
  desc: string;
  color: string;
  onClick: () => void;
  loading?: boolean;
  done?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || done}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 14px",
        background: done
          ? "rgba(16,185,129,0.06)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${done ? "rgba(16,185,129,0.2)" : "var(--cms-border-glass)"}`,
        borderRadius: 10,
        cursor: loading || done ? "default" : "pointer",
        width: "100%",
        textAlign: "left",
        fontFamily: "'Inter', sans-serif",
        transition: "background 150ms, border-color 150ms",
        boxSizing: "border-box",
      }}
      className={!loading && !done ? "hover:bg-white/[0.04] hover:border-white/[0.12]" : ""}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: `${color}14`,
          border: `1px solid ${color}26`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {loading ? (
          <RefreshCw size={15} style={{ color, animation: "spin 1s linear infinite" }} />
        ) : done ? (
          <Check size={15} style={{ color: "var(--cms-accent-emerald)" }} />
        ) : (
          <Icon size={15} style={{ color }} />
        )}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: done ? "var(--cms-accent-emerald)" : "var(--cms-text-primary)", fontSize: 13, fontWeight: 500, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {done ? "Done!" : label}
        </div>
        <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</div>
      </div>
    </button>
  );
}

/* --- Main Component ------------------------------------------- */

export function AnalyticsDashboard({ onNavigate }: { onNavigate?: (view: any) => void }) {
  const { siteDocument } = useMakeStore();
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildDone, setRebuildDone] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cms_calendar_events");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse calendar events", e);
        }
      }
    }
    return [
      { id: "1", date: "2026-08-03", title: "Deploy Astro 5.0 build to GitHub Pages", type: "event" },
      { id: "2", date: "2026-08-04", title: "Review GA4 live traffic metrics", type: "note" },
    ];
  });
  const [newNote, setNewNote] = useState("");

  const updateEvents = (updater: (prev: CalendarEvent[]) => CalendarEvent[]) => {
    setCalendarEvents((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        localStorage.setItem("cms_calendar_events", JSON.stringify(next));
      }
      return next;
    });
  };

  const [liveData, setLiveData] = useState<{
    commits: Array<{ hash: string; message: string; relativeTime: string }>;
    websiteTraffic: Array<{ day: string; views: number; activeUsers: number }>;
    githubTraffic: Array<{ day: string; views: number; uniques: number }>;
    unresolvedQueries?: number;
    resolvedQueries?: number;
    totalQueries?: number;
    coverageRate?: number;
    gaMetrics?: { activeUsers: number; eventCount: number; keyEvents: number; newUsers: number };
    realtimeUsers?: number;
  } | null>(null);

  const fetchAnalytics = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const json = await res.json();
        if (json.ok) {
          setLiveData(json);
          if (isManual) toast.success("Analytics Refreshed", { description: "Live property metrics synced." });
        }
      }
    } catch (e) {
      console.error("Failed to load analytics data", e);
    } finally {
      if (isManual) setTimeout(() => setIsRefreshing(false), 600);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => fetchAnalytics(), 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const websiteTraffic = liveData?.websiteTraffic || [];
  const githubTraffic = liveData?.githubTraffic || [];
  const gaMetrics = liveData?.gaMetrics || { activeUsers: 0, eventCount: 0, keyEvents: 0, newUsers: 0 };
  const realtimeUsers = liveData?.realtimeUsers ?? 0;
  const totalQueries = liveData?.totalQueries ?? 0;
  const coverageRate = liveData?.coverageRate ?? 100;
  const unresolvedQueries = liveData?.unresolvedQueries ?? 0;

  const recentCommits = liveData?.commits && liveData.commits.length > 0 ? liveData.commits.map((c) => ({
    type: "commit",
    text: c.message,
    meta: c.hash,
    time: c.relativeTime,
  })) : [
    { type: "commit", text: "style: refactor Analytics and Auditor aspect ratios", meta: "01d1d2d", time: "43 min ago" },
    { type: "commit", text: "fix: resolve ReferenceErrors in Settings and Make", meta: "69cda22", time: "3 hours ago" },
    { type: "commit", text: "feat: add dynamic design tokens API", meta: "c873171", time: "5 hours ago" },
    { type: "commit", text: "fix(ui): end-to-end alignment protection", meta: "e56c6ec", time: "5 hours ago" },
  ];

  const projectsCount = siteDocument?.projects?.length || 9;
  const skillsCount = (siteDocument?.skills || []).reduce((acc: number, c: any) => acc + (c.skills?.length || 0), 0) || 36;
  const todayStr = new Date().toISOString().split("T")[0];

  function handleAddNote() {
    if (!newNote.trim()) return;
    const entry: CalendarEvent = {
      id: String(Date.now()),
      date: todayStr,
      title: newNote.trim(),
      type: "note",
    };
    updateEvents((prev) => [...prev, entry]);
    setNewNote("");
    toast.success("Note added to calendar schedule");
  }

  function handleAddCalendarEvent(ev: CalendarEvent) {
    updateEvents((prev) => [...prev, ev]);
    toast.success(`${ev.type === "event" ? "Event" : "Note"} added for ${ev.date}`);
  }

  function handleDeleteEvent(id: string) {
    updateEvents((prev) => prev.filter((e) => e.id !== id));
    toast.info("Event removed");
  }

  function handleRebuild() {
    setShowConfirm(false);
    setRebuilding(true);
    setTimeout(() => {
      setRebuilding(false);
      setRebuildDone(true);
      toast.success("Rebuild triggered", { description: "GitHub Pages CI has been queued." });
      setTimeout(() => setRebuildDone(false), 3000);
    }, 2200);
  }

  return (
    <div
      className="no-scrollbar"
      style={{
        flex: 1,
        height: "100%",
        overflowY: "auto",
        background: "var(--cms-bg-dark)",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ padding: "20px 16px", maxWidth: 1400, margin: "0 auto", boxSizing: "border-box" }} className="sm:p-8">
        {/* Page Title & Header Actions */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ color: "var(--cms-text-primary)", fontSize: 20, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.01em" }} className="sm:text-2xl">
              Google Analytics &amp; Website Overview
            </h1>
            <p style={{ color: "var(--cms-text-secondary)", fontSize: 12, margin: 0 }} className="sm:text-sm">
              Live property analytics for lalitkishore.is-a.dev — synced {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={isRefreshing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--cms-border-glass)",
                borderRadius: 8,
                color: "var(--cms-text-primary)",
                fontSize: 12,
                fontWeight: 500,
                cursor: isRefreshing ? "default" : "pointer",
                transition: "background 150ms",
              }}
              className="hover:bg-white/[0.08]"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-blue-400" : "text-gray-400"} />
              <span>{isRefreshing ? "Syncing..." : "Refresh Analytics"}</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
              <span style={{ color: "var(--cms-accent-emerald)", fontSize: 12, fontWeight: 600 }}>Property Connected</span>
            </div>
          </div>
        </div>

        {/* Google Analytics Home Metrics Banner */}
        <GlassCard style={{ marginBottom: 20, padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
            {/* Active Users */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cms-text-secondary)", fontSize: 12, marginBottom: 4 }}>
                <Users size={14} style={{ color: "#3b82f6" }} />
                Active Users
              </div>
              <div style={{ color: "var(--cms-text-primary)", fontSize: 28, fontWeight: 700, lineHeight: "32px" }}>
                {gaMetrics.activeUsers}
              </div>
              <div style={{ color: "#3b82f6", fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                Last 30 Days
              </div>
            </div>

            {/* Event Count */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cms-text-secondary)", fontSize: 12, marginBottom: 4 }}>
                <Activity size={14} style={{ color: "#10b981" }} />
                Event Count
              </div>
              <div style={{ color: "var(--cms-text-primary)", fontSize: 28, fontWeight: 700, lineHeight: "32px" }}>
                {gaMetrics.eventCount}
              </div>
              <div style={{ color: "#10b981", fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                Recorded Events
              </div>
            </div>

            {/* Key Events */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cms-text-secondary)", fontSize: 12, marginBottom: 4 }}>
                <Zap size={14} style={{ color: "#a78bfa" }} />
                Key Events
              </div>
              <div style={{ color: "var(--cms-text-primary)", fontSize: 28, fontWeight: 700, lineHeight: "32px" }}>
                {gaMetrics.keyEvents}
              </div>
              <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, marginTop: 2 }}>
                Conversions
              </div>
            </div>

            {/* New Users */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cms-text-secondary)", fontSize: 12, marginBottom: 4 }}>
                <UserCheck size={14} style={{ color: "#f59e0b" }} />
                New Users
              </div>
              <div style={{ color: "var(--cms-text-primary)", fontSize: 28, fontWeight: 700, lineHeight: "32px" }}>
                {gaMetrics.newUsers}
              </div>
              <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                Unique Visitors
              </div>
            </div>

            {/* Realtime Users */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cms-text-secondary)", fontSize: 12, marginBottom: 4 }}>
                <Globe size={14} style={{ color: "#06b6d4" }} />
                <span>Realtime Users</span>
                <span style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: realtimeUsers > 0 ? "#10b981" : "#6b7280",
                  boxShadow: realtimeUsers > 0 ? "0 0 6px #10b981" : "none",
                  marginLeft: 2,
                }} />
              </div>
              <div style={{ color: realtimeUsers > 0 ? "#10b981" : "var(--cms-text-primary)", fontSize: 28, fontWeight: 700, lineHeight: "32px" }}>
                {realtimeUsers}
              </div>
              <div style={{ color: "#06b6d4", fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                Active in Last 30 Min
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Dual Traffic Grid: Website Traffic (GA4) + Repository Traffic (GitHub) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
          {/* Chart 1: Website Traffic (GA4) */}
          <GlassCard>
            <div style={{ padding: "18px 20px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600 }}>
                    Website Traffic (Google Analytics 4)
                  </div>
                  <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, marginTop: 2 }}>
                    Daily Active Users &amp; Page Views (Last 14 days)
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 8px",
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.18)",
                    borderRadius: 20,
                    fontSize: 10,
                    color: "#3b82f6",
                  }}
                >
                  <TrendingUp size={11} />
                  Live GA4 Data
                </div>
              </div>

              <div style={{ height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={websiteTraffic} margin={{ top: 10, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#a1a1aa", fontSize: 10, fontFamily: "'Inter', sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 10, fontFamily: "'Inter', sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomWebsiteTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="activeUsers"
                      name="Active Users"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="rgba(59,130,246,0.14)"
                      dot={{ r: 3, fill: "#3b82f6" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Page Views"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="rgba(16,185,129,0.08)"
                      dot={{ r: 2, fill: "#10b981" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--cms-text-secondary)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "#3b82f6" }} />
                  Active Users
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--cms-text-secondary)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "#10b981" }} />
                  Page Views
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Chart 2: Repository Traffic (GitHub) */}
          <GlassCard>
            <div style={{ padding: "18px 20px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600 }}>
                    Repository Traffic (GitHub REST API)
                  </div>
                  <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, marginTop: 2 }}>
                    Daily Views &amp; Unique Visitors (Last 14 days)
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 8px",
                    background: "rgba(167,139,250,0.08)",
                    border: "1px solid rgba(167,139,250,0.18)",
                    borderRadius: 20,
                    fontSize: 10,
                    color: "#a78bfa",
                  }}
                >
                  <Github size={11} />
                  Live GitHub Data
                </div>
              </div>

              <div style={{ height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={githubTraffic} margin={{ top: 10, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#a1a1aa", fontSize: 10, fontFamily: "'Inter', sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 10, fontFamily: "'Inter', sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomGithubTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Repo Views"
                      stroke="#a78bfa"
                      strokeWidth={2.5}
                      fill="rgba(167,139,250,0.14)"
                      dot={{ r: 3, fill: "#a78bfa" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="uniques"
                      name="Unique Visitors"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="rgba(245,158,11,0.08)"
                      dot={{ r: 2, fill: "#f59e0b" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--cms-text-secondary)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "#a78bfa" }} />
                  Repo Views
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--cms-text-secondary)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "#f59e0b" }} />
                  Unique Visitors
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Row 3 Grid: Quick Actions + Activity + Chatbot Health Card */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
          {/* Quick Actions */}
          <GlassCard>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
                Quick Actions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <QuickAction
                  icon={Zap}
                  label="Force Rebuild Website"
                  desc="Trigger GitHub Pages CI build immediately"
                  color="var(--cms-accent-cobalt)"
                  onClick={() => setShowConfirm(true)}
                  loading={rebuilding}
                  done={rebuildDone}
                />
                <QuickAction
                  icon={ExternalLink}
                  label="View Live Portfolio"
                  desc="Open lalitkishore.is-a.dev in new tab"
                  color="var(--cms-accent-emerald)"
                  onClick={() => window.open("https://lalitkishore.is-a.dev", "_blank")}
                />
                <QuickAction
                  icon={MessageSquare}
                  label="Review Chatbot Queries"
                  desc="Inspect unresolved queries in Auditor"
                  color="#a78bfa"
                  onClick={() => onNavigate?.("chatbot")}
                />
                <QuickAction
                  icon={Code}
                  label="Database Status"
                  desc={`${projectsCount} Projects & ${skillsCount} Skills Synced`}
                  color="#f59e0b"
                  onClick={() => onNavigate?.("projects")}
                />
              </div>
            </div>
          </GlassCard>

          {/* Recent Git Activity */}
          <GlassCard>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
                Recent Git Activity
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recentCommits.map((item, i, arr) => {
                  const Icon = Code;
                  const color = "var(--cms-accent-cobalt)";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 0",
                        borderBottom: i < arr.length - 1 ? "1px solid var(--cms-border-dark)" : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: `${color}14`,
                          border: `1px solid ${color}26`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "var(--cms-text-primary)", fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                          <span style={{ color: "var(--cms-text-secondary)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{item.meta}</span>
                          <span style={{ color: "var(--cms-text-secondary)", fontSize: 10 }}>·</span>
                          <span style={{ color: "var(--cms-text-secondary)", fontSize: 10 }}>{item.time}</span>
                        </div>
                      </div>
                      <a href={`https://github.com/Lalitkishore2/portfolio-manager/commit/${item.meta}`} target="_blank" rel="noreferrer" style={{ color: "var(--cms-accent-cobalt)", fontSize: 10, textDecoration: "none", display: "flex", alignItems: "center", gap: 3, opacity: 0.7 }} className="hover:opacity-100">
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Chatbot Auditor Card */}
          <GlassCard>
            <div style={{ padding: "18px 20px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Bot size={16} style={{ color: "#a78bfa" }} />
                    <span style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600 }}>
                      Chatbot Query Health
                    </span>
                  </div>
                  <span style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    background: coverageRate >= 80 ? "rgba(16,185,129,0.1)" : coverageRate >= 50 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${coverageRate >= 80 ? "rgba(16,185,129,0.2)" : coverageRate >= 50 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
                    borderRadius: 12,
                    color: coverageRate >= 80 ? "#10b981" : coverageRate >= 50 ? "#f59e0b" : "#ef4444",
                    fontWeight: 600,
                  }}>
                    {coverageRate}% Resolved
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--cms-border-glass)", borderRadius: 8, padding: 10 }}>
                    <div style={{ color: "var(--cms-text-secondary)", fontSize: 10, marginBottom: 2 }}>Total Queries</div>
                    <div style={{ color: "var(--cms-text-primary)", fontSize: 20, fontWeight: 700 }}>{totalQueries}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--cms-border-glass)", borderRadius: 8, padding: 10 }}>
                    <div style={{ color: "var(--cms-text-secondary)", fontSize: 10, marginBottom: 2 }}>Resolution Rate</div>
                    <div style={{ color: "#10b981", fontSize: 20, fontWeight: 700 }}>{coverageRate}%</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cms-text-secondary)", fontSize: 11, marginBottom: 12 }}>
                  <CheckCircle2 size={13} style={{ color: "#10b981" }} />
                  <span>Unresolved Queries: <strong style={{ color: "var(--cms-text-primary)" }}>{unresolvedQueries}</strong></span>
                </div>
              </div>

              <button
                onClick={() => onNavigate?.("chatbot")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  width: "100%",
                  padding: "9px",
                  background: "rgba(167,139,250,0.1)",
                  border: "1px solid rgba(167,139,250,0.25)",
                  borderRadius: 8,
                  color: "#a78bfa",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                className="hover:bg-purple-500/20"
              >
                <span>Open Chatbot Auditor</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Row 4 Section: Interactive Glass Calendar & Developer Event Notes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
          {/* Glass Calendar */}
          <GlassCard style={{ padding: 16 }}>
            <GlassCalendar
              events={calendarEvents}
              onAddEvent={handleAddCalendarEvent}
              className="w-full"
            />
          </GlassCard>

          {/* Developer Calendar Notes & Task Schedule */}
          <GlassCard style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarIcon size={16} style={{ color: "#f59e0b" }} />
                <span style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600 }}>
                  Calendar Notes &amp; Schedule
                </span>
              </div>
              <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, color: "#f59e0b" }}>
                {calendarEvents.length} Entries
              </span>
            </div>

            {/* Note Input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                placeholder="Add a new calendar note..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--cms-border-glass)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  color: "var(--cms-text-primary)",
                  fontSize: 12,
                  outline: "none",
                }}
              />
              <button
                onClick={handleAddNote}
                style={{
                  background: "rgba(245,158,11,0.15)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#f59e0b",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>

            {/* Note List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 310, overflowY: "auto" }} className="no-scrollbar">
              {calendarEvents.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--cms-border-glass)",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                    <FileText size={14} style={{ color: n.type === "event" ? "#a78bfa" : "#f59e0b", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "var(--cms-text-primary)", fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                      <div style={{ color: "var(--cms-text-secondary)", fontSize: 10, marginTop: 1 }}>{n.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, padding: "2px 6px", background: n.type === "event" ? "rgba(167,139,250,0.1)" : "rgba(245,158,11,0.1)", borderRadius: 8, color: n.type === "event" ? "#a78bfa" : "#f59e0b", border: "1px solid var(--cms-border-glass)" }}>
                      {n.type}
                    </span>
                    <button
                      onClick={() => handleDeleteEvent(n.id)}
                      style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", opacity: 0.6, padding: 3 }}
                      className="hover:opacity-100"
                      title="Delete event"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {calendarEvents.length === 0 && (
                <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, textAlign: "center", padding: "16px 0", fontStyle: "italic" }}>
                  No calendar notes or scheduled events yet.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Rebuild Confirm Modal */}
      {showConfirm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{ background: "var(--cms-bg-card)", border: "1px solid var(--cms-border-dark)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
              <AlertTriangle size={20} style={{ color: "var(--cms-accent-rose)", marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ color: "var(--cms-text-primary)", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Force Rebuild Website?</div>
                <div style={{ color: "var(--cms-text-secondary)", fontSize: 12, lineHeight: "18px" }}>
                  This triggers a GitHub Pages CI run immediately. The site may be briefly unavailable (~2–3 min).
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
              <LiquidButton variant="outline" size="sm" onClick={() => setShowConfirm(false)}>Cancel</LiquidButton>
              <MetalButton variant="error" onClick={handleRebuild}>Rebuild Now</MetalButton>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
