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
  const isActive = (id: CMSView) =>
    id === "projects"
      ? activeView === "projects" || activeView === "project-editor"
      : activeView === id;

  return (
    <aside
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
      }}
    >
      {/* -- Header -- */}
      <div
        style={{
          padding: "16px 0 14px",
          borderBottom: "1px solid #1f1f22",
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          title="LK Portfolio CMS"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
            color: "#fff",
            flexShrink: 0,
            letterSpacing: "0.02em",
            cursor: "pointer",
            transition: "transform 200ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          LK
        </div>
      </div>

      {/* -- Nav -- */}
      <nav
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

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .publish-btn:not(:disabled):hover { background: #1c1c1f !important; border-color: rgba(59,130,246,0.3) !important; }
      `}</style>
    </aside>
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
