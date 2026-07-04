import { useState, useCallback } from "react";
import { GripVertical, Plus, Trash2, Wand2, Eye, Monitor, Tablet, Smartphone, RefreshCw, ToggleLeft, ToggleRight, GitCommit, Check } from "lucide-react";
import { toast } from "sonner";
import type { NavRoute } from "./Sidebar";

const SECTION_META: Record<string, { file: string; sha: string; author: string }> = {
  profile: { file: "content/profile.json", sha: "8ef1c3b", author: "Lalit Kishore" },
  arsenal: { file: "content/skills.json", sha: "a1d9f72", author: "Lalit Kishore" },
  timeline: { file: "content/experience.json", sha: "c3e8f01", author: "Lalit Kishore" },
  projects: { file: "content/projects.json", sha: "b72d5a9", author: "Lalit Kishore" },
};

interface Field {
  key: string;
  label: string;
  type: "text" | "textarea" | "tags" | "list";
  value: string | string[];
  placeholder?: string;
  aiCapable?: boolean;
}

function getSectionFields(route: NavRoute): Field[] {
  switch (route) {
    case "profile":
      return [
        { key: "name", label: "Full Name", type: "text", value: "Lalit Kishore" },
        { key: "title", label: "Title / Role", type: "text", value: "ECE + Data Science Engineer" },
        { key: "bio", label: "Biography", type: "textarea", value: "Passionate engineer at the intersection of embedded systems and machine learning. Building impactful products one commit at a time.", aiCapable: true },
        { key: "location", label: "Location", type: "text", value: "India" },
        { key: "skills_summary", label: "Skills Summary", type: "textarea", value: "Microcontrollers, Python, React, Node.js, TensorFlow, Data pipelines.", aiCapable: true },
      ];
    case "arsenal":
      return [
        { key: "languages", label: "Languages", type: "tags", value: ["Python", "C++", "TypeScript", "Go"] },
        { key: "frameworks", label: "Frameworks", type: "tags", value: ["React", "Node.js", "FastAPI", "TensorFlow"] },
        { key: "tools", label: "Tools & Platforms", type: "tags", value: ["Docker", "GitHub Actions", "Supabase", "Vercel"] },
        { key: "highlight", label: "Arsenal Highlight", type: "textarea", value: "Deep expertise in RTOS-based embedded systems and ML inference pipelines.", aiCapable: true },
      ];
    case "timeline":
      return [
        { key: "role_title", label: "Current Role Title", type: "text", value: "Software Engineering Intern" },
        { key: "org", label: "Organisation", type: "text", value: "Startup XYZ" },
        { key: "period", label: "Period", type: "text", value: "Jan 2025 – Present" },
        { key: "description", label: "Role Description", type: "textarea", value: "Developed ML-powered inventory management features, reducing overstock by 18%.", aiCapable: true },
        { key: "outcomes", label: "Key Outcomes", type: "list", value: ["Reduced overstock by 18%", "Automated 4 manual reporting workflows", "Led migration to TypeScript"] },
      ];
    default: // projects
      return [
        { key: "title", label: "Project Title", type: "text", value: "AquaDot" },
        { key: "slug", label: "Slug", type: "text", value: "aquadot" },
        { key: "subtitle", label: "Subtitle", type: "text", value: "IoT water quality monitoring system" },
        { key: "problem", label: "Problem Statement", type: "textarea", value: "Manual water quality testing in aquaculture is slow, expensive, and prone to human error, leading to livestock losses.", aiCapable: true },
        { key: "solution", label: "Solution", type: "textarea", value: "Real-time multi-parameter IoT sensor node with edge inference and a React dashboard for remote monitoring.", aiCapable: true },
        { key: "outcomes", label: "Outcomes", type: "list", value: ["Reduced testing cost by 60%", "Achieved 94% anomaly detection accuracy", "Deployed in 3 fish farms"] },
        { key: "tags", label: "Technologies", type: "tags", value: ["ESP32", "Python", "React", "MQTT", "TensorFlow Lite"] },
      ];
  }
}

function buildJson(fields: Field[]): string {
  const obj: Record<string, unknown> = {};
  for (const f of fields) obj[f.key] = f.value;
  return JSON.stringify(obj, null, 2);
}

type Breakpoint = "desktop" | "tablet" | "mobile";
const BP_WIDTHS: Record<Breakpoint, number> = { desktop: 1200, tablet: 768, mobile: 375 };

interface TriptychEditorProps {
  activeRoute: NavRoute;
  onOpenAI: (fieldLabel: string, fieldValue: string, context: string) => void;
}

export function TriptychEditor({ activeRoute, onOpenAI }: TriptychEditorProps) {
  const meta = SECTION_META[activeRoute] || SECTION_META.projects;
  const [fields, setFields] = useState<Field[]>(() => getSectionFields(activeRoute));
  const [showDiff, setShowDiff] = useState(true);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [committed, setCommitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<string | null>(null);

  const originalJson = buildJson(getSectionFields(activeRoute));
  const currentJson = buildJson(fields);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      if (f.type === "text" || f.type === "textarea") {
        if (!f.value || (f.value as string).trim() === "") {
          errs[f.key] = `${f.label} is required.`;
        } else if (f.key === "title" && (f.value as string).length > 120) {
          errs[f.key] = "Title must be under 120 characters.";
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [fields]);

  function handleCommit() {
    if (!validate()) return;
    setCommitted(true);
    toast.success("Changes committed to main", {
      description: `${meta.file} updated via Octokit`,
      action: { label: "View on GitHub", onClick: () => {} },
    });
    setTimeout(() => setCommitted(false), 2500);
  }

  function updateField(key: string, value: string | string[]) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function addListItem(key: string) {
    setFields((prev) =>
      prev.map((f) => f.key === key && Array.isArray(f.value) ? { ...f, value: [...f.value, ""] } : f)
    );
  }

  function removeListItem(key: string, idx: number) {
    setFields((prev) =>
      prev.map((f) =>
        f.key === key && Array.isArray(f.value)
          ? { ...f, value: (f.value as string[]).filter((_, i) => i !== idx) }
          : f
      )
    );
  }

  function updateListItem(key: string, idx: number, val: string) {
    setFields((prev) =>
      prev.map((f) =>
        f.key === key && Array.isArray(f.value)
          ? { ...f, value: (f.value as string[]).map((v, i) => (i === idx ? val : v)) }
          : f
      )
    );
  }

  // Simple diff renderer
  function renderDiff() {
    const origLines = originalJson.split("\n");
    const currLines = currentJson.split("\n");
    const maxLen = Math.max(origLines.length, currLines.length);
    const rows = [];
    for (let i = 0; i < maxLen; i++) {
      const o = origLines[i] ?? "";
      const c = currLines[i] ?? "";
      const changed = o !== c;
      if (changed && o && !c) {
        rows.push({ type: "removed", line: o, num: i + 1 });
      } else if (changed && !o && c) {
        rows.push({ type: "added", line: c, num: i + 1 });
      } else if (changed) {
        rows.push({ type: "removed", line: o, num: i + 1 });
        rows.push({ type: "added", line: c, num: i + 1 });
      } else {
        rows.push({ type: "unchanged", line: c, num: i + 1 });
      }
    }
    return rows;
  }

  const diffRows = renderDiff();

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Left: Form Editor */}
      <div
        style={{
          width: 420,
          minWidth: 420,
          borderRight: "1px solid var(--cms-border-dark)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowY: "auto",
        }}
      >
        {/* Section header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--cms-border-dark)",
            position: "sticky",
            top: 0,
            background: "var(--cms-bg-card)",
            zIndex: 1,
          }}
        >
          <div style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600 }}>
            {meta.file}
          </div>
          <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
            Last commit: {meta.sha} · {meta.author}
          </div>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {fields.map((field) => (
            <div key={field.key}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label
                  style={{
                    color: "var(--cms-text-secondary)",
                    fontSize: 12,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {field.label}
                </label>
                {field.aiCapable && (
                  <button
                    onClick={() =>
                      onOpenAI(field.label, field.value as string, `${meta.file} → ${field.key}`)
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 8px",
                      background: "rgba(167,139,250,0.1)",
                      border: "1px solid rgba(167,139,250,0.2)",
                      borderRadius: 6,
                      color: "#a78bfa",
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <Wand2 size={11} />
                    Improve with AI
                  </button>
                )}
              </div>

              {field.type === "text" && (
                <input
                  value={field.value as string}
                  onFocus={() => setActiveField(field.key)}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${errors[field.key] ? "var(--cms-accent-rose)" : activeField === field.key ? "var(--cms-accent-cobalt)" : "var(--cms-border-dark)"}`,
                    borderRadius: 8,
                    color: "var(--cms-text-primary)",
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    outline: "none",
                    boxShadow: activeField === field.key ? "0 0 0 1px rgba(59,130,246,0.3)" : "none",
                    transition: "border-color 150ms, box-shadow 150ms",
                    boxSizing: "border-box",
                  }}
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  value={field.value as string}
                  onFocus={() => setActiveField(field.key)}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${errors[field.key] ? "var(--cms-accent-rose)" : activeField === field.key ? "var(--cms-accent-cobalt)" : "var(--cms-border-dark)"}`,
                    borderRadius: 8,
                    color: "var(--cms-text-primary)",
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: "22px",
                    boxShadow: activeField === field.key ? "0 0 0 1px rgba(59,130,246,0.3)" : "none",
                    transition: "border-color 150ms, box-shadow 150ms",
                    boxSizing: "border-box",
                  }}
                />
              )}

              {field.type === "tags" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(field.value as string[]).map((tag, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        background: "rgba(59,130,246,0.1)",
                        border: "1px solid rgba(59,130,246,0.2)",
                        borderRadius: 20,
                        fontSize: 12,
                        color: "var(--cms-accent-cobalt)",
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => {
                          const tags = (field.value as string[]).filter((_, j) => j !== i);
                          updateField(field.key, tags);
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", display: "flex", alignItems: "center" }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateField(field.key, [...(field.value as string[]), "New Tag"])}
                    style={{
                      padding: "4px 10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px dashed var(--cms-border-dark)",
                      borderRadius: 20,
                      fontSize: 12,
                      color: "var(--cms-text-secondary)",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    + Add
                  </button>
                </div>
              )}

              {field.type === "list" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(field.value as string[]).map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <GripVertical size={14} style={{ color: "var(--cms-text-secondary)", cursor: "grab", flexShrink: 0 }} />
                      <input
                        value={item}
                        onChange={(e) => updateListItem(field.key, i, e.target.value)}
                        style={{
                          flex: 1,
                          padding: "7px 10px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--cms-border-dark)",
                          borderRadius: 6,
                          color: "var(--cms-text-primary)",
                          fontSize: 13,
                          fontFamily: "'Inter', sans-serif",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() => removeListItem(field.key, i)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cms-text-secondary)", display: "flex", alignItems: "center", padding: 4 }}
                        className="hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addListItem(field.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 10px",
                      background: "transparent",
                      border: "1px dashed var(--cms-border-dark)",
                      borderRadius: 6,
                      color: "var(--cms-text-secondary)",
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <Plus size={12} />
                    Add item
                  </button>
                </div>
              )}

              {errors[field.key] && (
                <div style={{ color: "var(--cms-accent-rose)", fontSize: 11, marginTop: 4 }}>
                  {errors[field.key]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Commit bar */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--cms-border-dark)",
            position: "sticky",
            bottom: 0,
            background: "var(--cms-bg-card)",
          }}
        >
          <button
            onClick={handleCommit}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "11px 16px",
              background: committed ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
              border: `1px solid ${committed ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.3)"}`,
              borderRadius: 8,
              color: committed ? "var(--cms-accent-emerald)" : "var(--cms-accent-cobalt)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              transition: "all 300ms",
            }}
          >
            {committed ? <Check size={15} /> : <GitCommit size={15} />}
            {committed ? "Committed!" : "Save & Commit to GitHub"}
          </button>
        </div>
      </div>

      {/* Middle: Diff Panel */}
      {showDiff && (
        <div
          style={{
            width: 380,
            minWidth: 380,
            borderRight: "1px solid var(--cms-border-dark)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid var(--cms-border-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "var(--cms-text-secondary)", fontSize: 12, fontWeight: 500 }}>
              CODE DIFF
            </span>
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 11 }}>
              <span style={{ color: "rgba(16,185,129,0.8)" }}>+ added</span>
              <span style={{ color: "rgba(244,63,94,0.8)" }}>- removed</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
            {diffRows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  background:
                    row.type === "added"
                      ? "rgba(16,185,129,0.08)"
                      : row.type === "removed"
                      ? "rgba(244,63,94,0.08)"
                      : "transparent",
                  borderLeft: `3px solid ${
                    row.type === "added"
                      ? "rgba(16,185,129,0.5)"
                      : row.type === "removed"
                      ? "rgba(244,63,94,0.5)"
                      : "transparent"
                  }`,
                }}
              >
                <span
                  style={{
                    minWidth: 36,
                    padding: "2px 8px",
                    color: "rgba(161,161,170,0.4)",
                    borderRight: "1px solid var(--cms-border-dark)",
                    userSelect: "none",
                    textAlign: "right",
                  }}
                >
                  {row.num}
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    color:
                      row.type === "added"
                        ? "rgba(16,185,129,0.9)"
                        : row.type === "removed"
                        ? "rgba(244,63,94,0.7)"
                        : "var(--cms-text-secondary)",
                    whiteSpace: "pre",
                  }}
                >
                  {row.type === "added" ? "+ " : row.type === "removed" ? "- " : "  "}
                  {row.line}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right: Preview */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Preview toolbar */}
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid var(--cms-border-dark)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Diff toggle */}
          <button
            onClick={() => setShowDiff((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              background: "transparent",
              border: "1px solid var(--cms-border-dark)",
              borderRadius: 6,
              color: showDiff ? "var(--cms-accent-cobalt)" : "var(--cms-text-secondary)",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {showDiff ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            Diff
          </button>

          <div style={{ width: 1, height: 20, background: "var(--cms-border-dark)" }} />

          {/* Breakpoints */}
          {(["desktop", "tablet", "mobile"] as Breakpoint[]).map((bp) => {
            const Icon = bp === "desktop" ? Monitor : bp === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={bp}
                onClick={() => setBreakpoint(bp)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  background: breakpoint === bp ? "rgba(59,130,246,0.1)" : "transparent",
                  border: `1px solid ${breakpoint === bp ? "rgba(59,130,246,0.3)" : "var(--cms-border-dark)"}`,
                  borderRadius: 6,
                  color: breakpoint === bp ? "var(--cms-accent-cobalt)" : "var(--cms-text-secondary)",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Icon size={13} />
                {bp === "desktop" ? "1200" : bp === "tablet" ? "768" : "375"}
              </button>
            );
          })}

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              style={{
                padding: "5px 8px",
                background: "transparent",
                border: "1px solid var(--cms-border-dark)",
                borderRadius: 6,
                color: "var(--cms-text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <RefreshCw size={13} />
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                background: "transparent",
                border: "1px solid var(--cms-border-dark)",
                borderRadius: 6,
                color: "var(--cms-text-secondary)",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Eye size={13} />
              Preview
            </button>
          </div>
        </div>

        {/* Preview frame container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: 24,
            overflowY: "auto",
            background: "var(--cms-bg-obsidian)",
          }}
        >
          <div
            style={{
              width: BP_WIDTHS[breakpoint],
              maxWidth: "100%",
              background: "#0f0f10",
              border: "1px solid var(--cms-border-dark)",
              borderRadius: 10,
              minHeight: 300,
              padding: 24,
              transition: "width 250ms ease-out",
            }}
          >
            <PreviewContent fields={fields} route={activeRoute} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewContent({ fields, route }: { fields: Field[]; route: NavRoute }) {
  const get = (key: string) => fields.find((f) => f.key === key)?.value ?? "";

  if (route === "projects") {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, marginBottom: 8 }}>
          PREVIEW · content/projects.json
        </div>
        <h1 style={{ color: "var(--cms-text-primary)", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>
          {get("title") as string}
        </h1>
        <p style={{ color: "var(--cms-accent-cobalt)", fontSize: 14, margin: "0 0 16px" }}>
          {get("subtitle") as string}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {((get("tags") as string[]) || []).map((t) => (
            <span key={t} style={{ padding: "3px 10px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, fontSize: 11, color: "var(--cms-accent-cobalt)" }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 600, marginBottom: 6 }}>PROBLEM</div>
          <p style={{ color: "var(--cms-text-primary)", fontSize: 13, lineHeight: "21px", margin: 0 }}>{get("problem") as string}</p>
        </div>
        <div>
          <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, fontWeight: 600, marginBottom: 6 }}>OUTCOMES</div>
          <ul style={{ color: "var(--cms-text-primary)", fontSize: 13, lineHeight: "21px", paddingLeft: 16, margin: 0 }}>
            {((get("outcomes") as string[]) || []).map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      </div>
    );
  }

  if (route === "profile") {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, marginBottom: 12 }}>PREVIEW · content/profile.json</div>
        <h1 style={{ color: "var(--cms-text-primary)", fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>
          {get("name") as string}
        </h1>
        <p style={{ color: "var(--cms-accent-cobalt)", fontSize: 15, margin: "0 0 12px" }}>{get("title") as string}</p>
        <p style={{ color: "var(--cms-text-secondary)", fontSize: 13, lineHeight: "22px", margin: 0 }}>{get("bio") as string}</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "var(--cms-text-secondary)", fontSize: 13 }}>
      <div style={{ marginBottom: 8, fontSize: 11 }}>PREVIEW · {SECTION_META[route]?.file}</div>
      {fields.map((f) => (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <div style={{ color: "var(--cms-text-secondary)", fontSize: 11, marginBottom: 4, textTransform: "uppercase" }}>{f.label}</div>
          <div style={{ color: "var(--cms-text-primary)", fontSize: 13 }}>
            {Array.isArray(f.value) ? f.value.join(", ") : f.value}
          </div>
        </div>
      ))}
    </div>
  );
}
