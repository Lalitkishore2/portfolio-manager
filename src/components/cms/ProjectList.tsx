import { useState } from "react";
import { Plus, Search, Clock, ExternalLink, ArrowRight } from "lucide-react";
import type { Project } from "./cms-types";

const STATUS_CONFIG = {
  building:  { label: "Building",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
  prototype: { label: "Prototype", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)" },
  live:      { label: "Live",      color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)"  },
  complete:  { label: "Complete",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)"  },
};

const CATEGORY_CONFIG = {
  IOT: { color: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
  WEB: { color: "#34d399", bg: "rgba(52,211,153,0.08)" },
  AI:  { color: "#c084fc", bg: "rgba(192,132,252,0.08)" },
  HEALTHCARE: { color: "#f87171", bg: "rgba(248,113,113,0.08)" },
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}

export function ProjectList({ projects, onSelectProject, onNewProject }: ProjectListProps) {
  const [search, setSearch] = useState("");

  const query = search.toLowerCase();
  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.tagline.toLowerCase().includes(query)
  );

  return (
    <div
      className="no-scrollbar"
      style={{
        flex: 1,
        overflowY: "auto",
        background: "#09090b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Page header */}
      <div
        style={{
          padding: "28px 32px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#09090b",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <h1
            style={{
              color: "#fafafa",
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Projects
          </h1>
          <p style={{ color: "#52525b", fontSize: 12, margin: "3px 0 0" }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""} in{" "}
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3f3f46" }}>
              content/projects.json
            </span>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#3f3f46" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              style={{
                padding: "7px 12px 7px 32px",
                background: "#18181b",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                color: "#e4e4e7",
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                width: 200,
              }}
            />
          </div>

          <button
            onClick={onNewProject}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: "linear-gradient(to bottom, #3b82f6, #2563eb)",
              border: "1px solid rgba(37,99,235,0.7)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 6px rgba(59,130,246,0.3)",
            }}
          >
            <Plus size={13} />
            New Project
          </button>
        </div>
      </div>

      {/* Project table */}
      <div style={{ padding: "20px 32px" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 100px 140px 36px",
            gap: 16,
            padding: "0 16px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 4,
          }}
        >
          {["Project", "Category", "Status", "Last Updated", ""].map((h, i) => (
            <div
              key={i}
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "#3f3f46",
                textTransform: "uppercase",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map((project, idx) => {
            const status = STATUS_CONFIG[project.status] || { label: project.status || "Unknown", color: "#a1a1aa", bg: "rgba(161,161,170,0.1)", border: "rgba(161,161,170,0.2)" };
            const cat = CATEGORY_CONFIG[project.category] || { color: "#a1a1aa", bg: "rgba(161,161,170,0.1)" };

            return (
              <div
                key={project.slug || project.id || idx}
                onClick={() => onSelectProject(project.slug || project.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 100px 140px 36px",
                  gap: 16,
                  padding: "12px 16px",
                  background: "transparent",
                  border: "1px solid transparent",
                  borderRadius: 9,
                  cursor: "pointer",
                  transition: "background 100ms, border-color 100ms",
                  alignItems: "center",
                }}
                className="hover:bg-white/[0.03] hover:border-white/[0.07]"
              >
                {/* Title + tagline */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "#fafafa", fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                    {project.title}
                  </div>
                  <div
                    style={{
                      color: "#52525b",
                      fontSize: 11,
                      lineHeight: "16px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {project.tagline}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <span
                    style={{
                      padding: "3px 8px",
                      background: cat.bg,
                      borderRadius: 5,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      color: cat.color,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {project.category}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 8px",
                      background: status.bg,
                      border: `1px solid ${status.border}`,
                      borderRadius: 20,
                      fontSize: 10,
                      color: status.color,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: status.color,
                        display: "inline-block",
                      }}
                    />
                    {status.label}
                  </div>
                </div>

                {/* Updated */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#52525b", fontSize: 11 }}>
                  <Clock size={11} />
                  {formatDate(project.updatedAt)}
                </div>

                {/* Arrow */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <ArrowRight size={14} style={{ color: "#3f3f46" }} />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#52525b", fontSize: 13 }}>
              No projects match "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
