import {
  FolderOpen,
  User,
  Briefcase,
  Cpu,
  BarChart2,
  Bot,
  Settings,
  Github,
  ChevronRight,
  Sparkles,
  Loader2,
  Check,
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
        width: 240,
        minWidth: 240,
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
          padding: "16px 16px 14px",
          borderBottom: "1px solid #1f1f22",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Avatar */}
          <div
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
            }}
          >
            LK
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#fafafa",
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                lineHeight: "14px",
                whiteSpace: "nowrap" as const,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              LK Portfolio CMS
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 3,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                  animation: "pulse-green 2s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: 10, color: "#52525b" }}>
                Live on GitHub Pages
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* -- Nav -- */}
      <nav
        style={{
          flex: 1,
          padding: "14px 10px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <NavSection
          label="Content"
          items={CONTENT_NAV}
          isActive={isActive}
          onNavigate={onNavigate}
        />
        <NavSection
          label="AI & Analytics"
          items={AI_NAV}
          isActive={isActive}
          onNavigate={onNavigate}
        />
        <NavSection
          label="System"
          items={SYSTEM_NAV}
          isActive={isActive}
          onNavigate={onNavigate}
        />
      </nav>

      {/* -- Bottom: Publish -- */}
      <div
        style={{
          padding: "12px 12px 16px",
          borderTop: "1px solid #1f1f22",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onPublish}
          disabled={publishing}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 14px",
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
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            cursor: publishing ? "not-allowed" : "pointer",
            transition: "all 250ms",
          }}
          className="publish-btn"
        >
          <Github size={15} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: "left" as const }}>
            {published
              ? "Published!"
              : publishing
              ? "Publishing..."
              : "Publish to GitHub"}
          </span>
          {publishing && (
            <Loader2
              size={13}
              color="#60a5fa"
              style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
            />
          )}
          {published && (
            <Check size={13} color="#4ade80" style={{ flexShrink: 0 }} />
          )}
        </button>

        <div style={{ marginTop: 8, paddingLeft: 2 }}>
          <div style={{ fontSize: 10, color: "#3f3f46" }}>
            Last published: Jun 14, 2026
          </div>
          <div style={{ fontSize: 10, color: "#3f3f46", marginTop: 1 }}>
            3 files changed
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-green { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .publish-btn:not(:disabled):hover { background: #1c1c1f !important; border-color: rgba(59,130,246,0.3) !important; }
      `}</style>
    </aside>
  );
}

/* --- NavSection -------------------------------------------------- */
function NavSection({
  label,
  items,
  isActive,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  isActive: (id: CMSView) => boolean;
  onNavigate: (view: CMSView) => void;
}) {
  return (
    <div>
      {/* Section header */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.09em",
          color: "#3f3f46",
          textTransform: "uppercase" as const,
          padding: "0 8px",
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map(({ id, label: itemLabel, icon: Icon }) => {
          const active = isActive(id);
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 10px",
                background: active ? "#1d3461" : "transparent",
                border: active
                  ? "1px solid rgba(59,130,246,0.2)"
                  : "1px solid transparent",
                borderRadius: 8,
                color: active ? "#60a5fa" : "#71717a",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                fontWeight: active ? 500 : 400,
                textAlign: "left" as const,
                width: "100%",
                transition: "background 120ms, color 120ms, border-color 120ms",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#1c1c1f";
                  (e.currentTarget as HTMLButtonElement).style.color = "#e4e4e7";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#71717a";
                }
              }}
            >
              <Icon
                size={15}
                style={{
                  flexShrink: 0,
                  color: active ? "#60a5fa" : "#52525b",
                }}
              />
              <span style={{ flex: 1 }}>{itemLabel}</span>
              {active && (
                <ChevronRight
                  size={12}
                  style={{ color: "#52525b", flexShrink: 0 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
