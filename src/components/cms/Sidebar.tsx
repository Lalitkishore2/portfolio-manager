import {
  LayoutDashboard,
  User,
  Cpu,
  Clock,
  FolderOpen,
  Bot,
  Settings,
  HelpCircle,
  Keyboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type NavRoute =
  | "dashboard"
  | "profile"
  | "arsenal"
  | "timeline"
  | "projects"
  | "chatbot";

const NAV_ITEMS: { id: NavRoute; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "Profile Editor", icon: User },
  { id: "arsenal", label: "Technical Arsenal", icon: Cpu },
  { id: "timeline", label: "Timeline Editor", icon: Clock },
  { id: "projects", label: "Projects CMS", icon: FolderOpen },
  { id: "chatbot", label: "Chatbot Auditor", icon: Bot },
];

interface SidebarProps {
  active: NavRoute;
  onNavigate: (route: NavRoute) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ active, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      style={{
        width: collapsed ? 64 : 260,
        minWidth: collapsed ? 64 : 260,
        background: "var(--cms-bg-card)",
        borderRight: "1px solid var(--cms-border-dark)",
        fontFamily: "'Inter', sans-serif",
        transition: "width 200ms ease-out, min-width 200ms ease-out",
      }}
      className="h-full flex flex-col relative"
    >
      {/* User Header */}
      <div
        style={{ borderBottom: "1px solid var(--cms-border-dark)" }}
        className="p-4 flex items-center gap-3"
      >
        <div
          style={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            border: "1px solid var(--cms-border-glass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          LK
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600, lineHeight: "20px" }}>
              Lalit Kishore
            </div>
            <div style={{ color: "var(--cms-text-secondary)", fontSize: 12, lineHeight: "18px" }}>
              Administrator
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            style={{ color: "var(--cms-text-secondary)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 6px", borderRadius: 6 }}
            className="hover:text-white transition-colors"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "10px 12px" : "10px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                position: "relative",
                transition: "background 150ms ease-out, color 150ms ease-out",
                background: isActive ? "var(--cms-bg-obsidian)" : "transparent",
                color: isActive ? "var(--cms-text-primary)" : "var(--cms-text-secondary)",
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              className={!isActive ? "hover:bg-[#111113] hover:text-white" : ""}
            >
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 20,
                    background: "var(--cms-accent-cobalt)",
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ borderTop: "1px solid var(--cms-border-dark)" }} className="p-3 flex flex-col gap-1">
        {[
          { icon: Settings, label: "Settings" },
          { icon: HelpCircle, label: "Help" },
          { icon: Keyboard, label: "Shortcuts" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={collapsed ? label : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              width: "100%",
              background: "transparent",
              color: "var(--cms-text-secondary)",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "color 150ms ease-out",
            }}
            className="hover:text-white"
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-end",
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "var(--cms-text-secondary)",
            width: "100%",
            transition: "color 150ms ease-out",
          }}
          className="hover:text-white"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
