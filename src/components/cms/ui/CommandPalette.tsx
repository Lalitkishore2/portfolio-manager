import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, FolderOpen, User, Settings, Sparkles, FileText, Check } from "lucide-react";
import { CMSView } from "../CMSSidebar";
import { useMakeStore } from "../../../store/makeStore";

interface CommandPaletteProps {
  onNavigate: (view: CMSView) => void;
  onSelectProject?: (id: string) => void;
}

export function CommandPalette({ onNavigate, onSelectProject }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const { siteDocument } = useMakeStore();
  const projects = siteDocument?.projects || [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div 
        style={{
          width: "100%",
          maxWidth: 500,
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          fontFamily: "'Inter', sans-serif",
          transform: open ? "scale(1)" : "scale(0.95)",
          opacity: open ? 1 : 0,
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          label="Global Command Menu"
          shouldFilter={true}
          style={{ width: "100%" }}
        >
          <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Search size={16} color="#71717a" style={{ marginRight: 12 }} />
            <Command.Input
              autoFocus
              placeholder="Type a command or search..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fafafa",
                fontSize: 14,
                width: "100%",
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            />
          </div>

          <Command.List style={{ maxHeight: 300, overflowY: "auto", padding: 8 }}>
            <Command.Empty style={{ padding: "20px", textAlign: "center", color: "#71717a", fontSize: 13 }}>
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" style={{ padding: "8px 4px", fontSize: 11, color: "#71717a", fontWeight: 600 }}>
              <CommandItem onSelect={() => { onNavigate("projects"); setOpen(false); }} icon={<FolderOpen size={14} />} label="Go to Projects" />
              <CommandItem onSelect={() => { onNavigate("profile"); setOpen(false); }} icon={<User size={14} />} label="Go to Profile" />
              <CommandItem onSelect={() => { onNavigate("make"); setOpen(false); }} icon={<Sparkles size={14} />} label="Go to Figma Make" />
              <CommandItem onSelect={() => { onNavigate("tokens"); setOpen(false); }} icon={<Settings size={14} />} label="Go to Design Tokens" />
              <CommandItem onSelect={() => { onNavigate("settings"); setOpen(false); }} icon={<Settings size={14} />} label="Go to Settings" />
            </Command.Group>

            {projects.length > 0 && (
              <Command.Group heading="Projects" style={{ padding: "8px 4px", fontSize: 11, color: "#71717a", fontWeight: 600 }}>
                {projects.map((p: any) => (
                  <CommandItem
                    key={p.id}
                    onSelect={() => {
                      if (onSelectProject) onSelectProject(p.id);
                      setOpen(false);
                    }}
                    icon={<FileText size={14} />}
                    label={`Edit ${p.title}`}
                  />
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>

      {/* Backdrop click closer */}
      <div 
        onClick={() => setOpen(false)}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }}
      />
    </div>
  );
}

function CommandItem({ onSelect, icon, label }: { onSelect: () => void, icon: React.ReactNode, label: string }) {
  const [active, setActive] = useState(false);
  return (
    <Command.Item
      onSelect={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: 6,
        cursor: "pointer",
        color: active ? "#fff" : "#a1a1aa",
        background: active ? "#1d3461" : "transparent",
        fontSize: 13,
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <span style={{ marginRight: 12, display: "flex", alignItems: "center" }}>{icon}</span>
      {label}
    </Command.Item>
  );
}
