import { useState } from "react";
import {
  FolderOpen,
  User,
  Briefcase,
  Cpu,
  BarChart2,
  Bot,
  Settings,
  Palette,
  Github,
  Sparkles,
  Loader2,
  Check,
  LogOut,
  ExternalLink,
} from "lucide-react";

export type CMSView =
  | "projects"
  | "project-editor"
  | "profile"
  | "experience"
  | "skills"
  | "analytics"
  | "chatbot"
  | "make"
  | "tokens"
  | "settings";

interface NavItem {
  id: CMSView;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

const CONTENT_NAV: NavItem[] = [
  { id: "projects",    label: "Projects",      icon: FolderOpen },
  { id: "profile",     label: "Profile & Bio", icon: User       },
  { id: "experience",  label: "Experience",    icon: Briefcase  },
  { id: "skills",      label: "Skills",        icon: Cpu        },
];

const AI_NAV: NavItem[] = [
  { id: "analytics", label: "Analytics",       icon: BarChart2 },
  { id: "chatbot",   label: "Chatbot Auditor", icon: Bot       },
  { id: "make",      label: "Make",            icon: Sparkles  },
];

const SYSTEM_NAV: NavItem[] = [
  { id: "tokens",   label: "Design Tokens", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings },
];

interface CMSSidebarProps {
  activeView: CMSView;
  onNavigate: (view: CMSView) => void;
  onPublish: () => void;
  publishing: boolean;
  published: boolean;
}

export function CMSSidebar({
  activeView,
  onNavigate,
  onPublish,
  publishing,
  published,
}: CMSSidebarProps) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const isActive = (id: CMSView) =>
    id === "projects"
      ? activeView === "projects" || activeView === "project-editor"
      : activeView === id;

  const ALL_NAV_SECTIONS = [
    { title: "Content Management", items: CONTENT_NAV },
    { title: "AI & Intelligence", items: AI_NAV },
    { title: "System & Tokens", items: SYSTEM_NAV },
  ];

  return (
    <>
      <aside
        className="cms-sidebar-aside"
        style={{
          width: 56,
          minWidth: 56,
          height: "100%",
          background: "#111113",
          borderRight: "1px solid #27272a",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
          position: "relative",
        }}
      >
        {/* -- Header / LK Pop Trigger -- */}
        <div
          className="cms-sidebar-header"
          style={{
            padding: "16px 0 14px",
            borderBottom: "1px solid #1f1f22",
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            title="Click to view everything in expanded sidebar menu"
            onClick={() => setOpenDrawer(!openDrawer)}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
              letterSpacing: "0.02em",
              cursor: "pointer",
              boxShadow: openDrawer ? "0 0 12px rgba(59,130,246,0.6)" : "none",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            LK
          </div>
        </div>

        {/* -- Nav -- */}
        <nav
          className="no-scrollbar cms-sidebar-nav"
          style={{
            flex: 1,
            padding: "14px 8px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
          }}
        >
          <NavSection items={CONTENT_NAV} isActive={isActive} onNavigate={onNavigate} />
          <div style={{ width: "24px", height: "1px", background: "#27272a" }} />
          <NavSection items={AI_NAV} isActive={isActive} onNavigate={onNavigate} />
          <div style={{ width: "24px", height: "1px", background: "#27272a" }} />
          <NavSection items={SYSTEM_NAV} isActive={isActive} onNavigate={onNavigate} />
        </nav>

      {/* -- Bottom: Publish & Logout -- */}
      <div
        className="cms-sidebar-footer"
        style={{
          padding: "12px 8px 16px",
          borderTop: "1px solid #1f1f22",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button
          onClick={onPublish}
          disabled={publishing}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: published
              ? "rgba(20,83,45,0.4)"
              : publishing
              ? "#1d3461"
              : "#18181b",
            border: published
              ? "1px solid #166534"
              : publishing
              ? "1px solid #3b82f6"
              : "1px solid #27272a",
            borderRadius: 8,
            color: published ? "#4ade80" : publishing ? "#60a5fa" : "#d4d4d8",
            cursor: publishing ? "not-allowed" : "pointer",
            transition: "all 250ms",
          }}
          className="publish-btn"
          title={published ? "Published!" : publishing ? "Publishing..." : "Publish to GitHub"}
        >
          {publishing ? (
            <Loader2
              size={16}
              color="#60a5fa"
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : published ? (
            <Check size={16} color="#4ade80" />
          ) : (
            <Github size={16} />
          )}
        </button>

        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/auth/logout", { method: "POST" });
              if (res.ok) {
                window.location.href = "/login";
              }
            } catch (e) {
              console.error("Logout failed", e);
            }
          }}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: 8,
            color: "#f87171",
            cursor: "pointer",
            transition: "all 120ms",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.08)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239, 68, 68, 0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239, 68, 68, 0.2)";
          }}
          title="Log Out"
        >
          <LogOut size={15} />
        </button>
      </div>

      {/* Pop Open Drawer Overlay */}
      {openDrawer && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.3)" }}
            onClick={() => setOpenDrawer(false)}
          />
          <div
            style={{
              position: "fixed",
              left: 64,
              top: 16,
              width: 280,
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
              background: "rgba(17, 17, 19, 0.96)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 14,
              boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
              zIndex: 500,
              padding: "20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              fontFamily: "'Inter', sans-serif",
            }}
            className="no-scrollbar"
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                LK
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#fafafa", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>S V Lalitkishore</div>
                <div style={{ color: "#71717a", fontSize: 11 }}>Portfolio Manager &amp; CMS</div>
              </div>
            </div>

            {/* Quick Live Site Link */}
            <a
              href="https://lalitkishore.is-a.dev"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 8,
                color: "#60a5fa",
                fontSize: 12,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <ExternalLink size={13} />
              <span>lalitkishore.is-a.dev</span>
            </a>

            {/* Full Nav Sections with Labels */}
            {ALL_NAV_SECTIONS.map((sec) => (
              <div key={sec.title} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ color: "#71717a", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                  {sec.title}
                </div>
                {sec.items.map(({ id, label: itemLabel, icon: Icon }) => {
                  const active = isActive(id);
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        onNavigate(id);
                        setOpenDrawer(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        background: active ? "#1d3461" : "transparent",
                        border: active ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                        borderRadius: 8,
                        color: active ? "#60a5fa" : "#a1a1aa",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        textAlign: "left",
                        width: "100%",
                        transition: "all 120ms",
                      }}
                    >
                      <Icon size={15} style={{ color: active ? "#60a5fa" : "#71717a" }} />
                      <span>{itemLabel}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .publish-btn:not(:disabled):hover { background: #1c1c1f !important; border-color: rgba(59,130,246,0.3) !important; }
      `}</style>
    </aside>
    </>
  );
}

/* --- NavSection -------------------------------------------------- */
function NavSection({
  items,
  isActive,
  onNavigate,
}: {
  items: NavItem[];
  isActive: (id: CMSView) => boolean;
  onNavigate: (view: CMSView) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {items.map(({ id, label: itemLabel, icon: Icon }) => {
        const active = isActive(id);
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              background: active ? "#1d3461" : "transparent",
              border: active
                ? "1px solid rgba(59,130,246,0.2)"
                : "1px solid transparent",
              borderRadius: 8,
              color: active ? "#60a5fa" : "#71717a",
              cursor: "pointer",
              transition: "all 120ms",
            }}
            title={itemLabel}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = "#1c1c1f";
                (e.currentTarget as HTMLButtonElement).style.color = "#e4e4e7";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#71717a";
              }
            }}
          >
            <Icon
              size={18}
              style={{
                color: active ? "#60a5fa" : "#52525b",
                transition: "all 300ms",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
