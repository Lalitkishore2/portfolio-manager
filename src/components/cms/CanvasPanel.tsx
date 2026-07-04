import { useState } from "react";
import { Monitor, Tablet, Smartphone, RefreshCw, Check, Code, Eye, Github, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { EditingContext } from "./GlobalHeader";
import type { DirtyRecord } from "./editor-types";
import type { CanvasData, CanvasSelection } from "./canvas-types";

type Viewport = "desktop" | "tablet" | "mobile";
type CanvasMode = "preview" | "code";

const VIEWPORT_SIZES: Record<Viewport, number | null> = {
  desktop: null,   // fills container
  tablet: 768,
  mobile: 375,
};

/* --- Publish button -------------------------------------------- */

function PublishButton() {
  const [state, setState] = useState<"idle" | "publishing" | "done">("idle");

  function handle() {
    setState("publishing");
    setTimeout(() => {
      setState("done");
      toast.success("Published to GitHub Pages", { description: "Deployment queued on main branch" });
      setTimeout(() => setState("idle"), 2000);
    }, 2200);
  }

  return (
    <button
      onClick={handle}
      disabled={state === "publishing"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 13px",
        background: state === "done"
          ? "rgba(16,185,129,0.12)"
          : "linear-gradient(to bottom, #3b82f6, #2563eb)",
        border: state === "done"
          ? "1px solid rgba(16,185,129,0.3)"
          : "1px solid rgba(37,99,235,0.8)",
        borderRadius: 7,
        color: state === "done" ? "#10b981" : "#fff",
        cursor: state === "publishing" ? "not-allowed" : "pointer",
        fontSize: 12,
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        transition: "all 250ms",
        boxShadow: state === "done"
          ? "none"
          : "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.4)",
        opacity: state === "publishing" ? 0.7 : 1,
      }}
    >
      {state === "done" ? <Check size={12} /> : state === "publishing" ? <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Github size={12} />}
      {state === "done" ? "Published" : state === "publishing" ? "Publishing..." : "Publish to GitHub"}
    </button>
  );
}

/* --- Clickable canvas element ---------------------------------- */

type DiffVariant = "selected" | "ai-edited" | "added" | "deleted" | "none";

function CanvasEl({
  variant,
  schemaLabel,
  onClick,
  children,
}: {
  variant: DiffVariant;
  schemaLabel: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  const ringColor =
    variant === "selected" ? "#3b82f6"
    : variant === "ai-edited" ? "#f59e0b"
    : variant === "added" ? "#10b981"
    : variant === "deleted" ? "#f43f5e"
    : hovered ? "rgba(59,130,246,0.5)"
    : "transparent";

  const borderStyle = variant === "selected" ? "solid" : "dashed";
  const borderWidth = variant === "selected" ? 2 : 1.5;

  const showBadge = variant !== "none" || hovered;
  const badgeLabel =
    variant === "selected" ? schemaLabel
    : variant === "ai-edited" ? "Edited"
    : variant === "added" ? "Added"
    : variant === "deleted" ? "Deleted"
    : schemaLabel;

  const badgeColor =
    variant === "selected" ? { text: "#60a5fa", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.4)" }
    : variant === "ai-edited" ? { text: "#fbbf24", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.35)" }
    : variant === "added" ? { text: "#34d399", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.35)" }
    : variant === "deleted" ? { text: "#fb7185", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.35)" }
    : { text: "rgba(96,165,250,0.6)", bg: "rgba(59,130,246,0.05)", border: "rgba(59,130,246,0.2)" };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 7,
        border: `${borderWidth}px ${borderStyle} ${ringColor}`,
        transition: "border-color 80ms ease-in-out",
        cursor: "pointer",
        opacity: variant === "deleted" ? 0.35 : 1,
      }}
    >
      {/* Schema label tab */}
      {showBadge && (
        <div
          style={{
            position: "absolute",
            top: variant === "selected" ? -22 : -20,
            left: -2,
            padding: "2px 7px",
            background: badgeColor.bg,
            border: `1px solid ${badgeColor.border}`,
            borderRadius: "4px 4px 0 0",
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: badgeColor.text,
            zIndex: 5,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            lineHeight: "16px",
          }}
        >
          {badgeLabel}
        </div>
      )}

      {/* Corner handles on selected */}
      {variant === "selected" &&
        [{ top: -4, left: -4 }, { top: -4, right: -4 }, { bottom: -4, left: -4 }, { bottom: -4, right: -4 }].map((pos, i) => (
          <div key={i} style={{ position: "absolute", width: 6, height: 6, background: "#3b82f6", borderRadius: 1, pointerEvents: "none", zIndex: 6, ...pos }} />
        ))
      }

      {/* Deleted overlay */}
      {variant === "deleted" && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 7, pointerEvents: "none",
          background: "repeating-linear-gradient(135deg, rgba(244,63,94,0.06) 0px, rgba(244,63,94,0.06) 2px, transparent 2px, transparent 12px)",
        }} />
      )}

      {children}
    </div>
  );
}

/* --- Portfolio canvas sections --------------------------------- */

function ProjectsView({ data, selectedId, aiEditedIds, onSelect }: {
  data: CanvasData["projects"];
  selectedId: string | null;
  aiEditedIds: Set<string>;
  onSelect: (s: CanvasSelection) => void;
}) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: "#fafafa", fontSize: 18, fontWeight: 700, margin: "0 0 3px", letterSpacing: "-0.02em" }}>Projects</h2>
        <p style={{ color: "#52525b", fontSize: 10, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>content/projects.json</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.map((p) => {
          const variant: DiffVariant =
            selectedId === p.id ? "selected"
            : aiEditedIds.has(p.id) ? "ai-edited"
            : "none";

          return (
            <CanvasEl
              key={p.id}
              variant={variant}
              schemaLabel={`projects.${p.id}`}
              onClick={() =>
                onSelect({
                  id: p.id,
                  schemaPath: `projects.${p.id}`,
                  label: p.title,
                  fields: [
                    { key: "title", label: "Title", type: "text", value: p.title, constraint: "8–80 chars" },
                    { key: "overview", label: "Overview", type: "textarea", value: p.overview, constraint: "40–400 chars", placeholder: "Describe the project..." },
                    { key: "role", label: "Role", type: "text", value: p.role },
                    { key: "tags", label: "Technologies", type: "tags", value: p.tags },
                  ],
                })
              }
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 8,
                  padding: 18,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ color: "#fafafa", fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>{p.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#52525b", fontSize: 11 }}>{p.role}</span>
                    <ExternalLink size={11} style={{ color: "#3f3f46" }} />
                  </div>
                </div>
                <p style={{ color: "#71717a", fontSize: 12, lineHeight: "19px", margin: "0 0 12px" }}>{p.overview}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                  {p.tags.map((t) => (
                    <span key={t} style={{ padding: "2px 7px", background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, fontSize: 10, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace" }}>{t}</span>
                  ))}
                </div>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 3 }}>
                  {p.outcomes.map((o, i) => (
                    <li key={i} style={{ display: "flex", gap: 6, fontSize: 11, color: "#52525b" }}>
                      <span style={{ color: "#10b981", flexShrink: 0 }}>▸</span>{o}
                    </li>
                  ))}
                </ul>
              </div>
            </CanvasEl>
          );
        })}
      </div>
    </div>
  );
}

function ProfileView({ data, selectedId, onSelect }: {
  data: CanvasData["profile"]; selectedId: string | null;
  onSelect: (s: CanvasSelection) => void;
}) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <p style={{ color: "#52525b", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>content/profile.json</p>
      <CanvasEl variant={selectedId === "profile-hero" ? "selected" : "none"} schemaLabel="profile.name + tagline"
        onClick={() => onSelect({ id: "profile-hero", schemaPath: "profile.name + tagline", label: "Hero Block", fields: [
          { key: "name", label: "Full Name", type: "text", value: data.name },
          { key: "tagline", label: "Tagline", type: "textarea", value: data.tagline },
        ] })}>
        <div style={{ padding: "8px 4px" }}>
          <h1 style={{ color: "#fafafa", fontSize: 32, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.03em" }}>{data.name}</h1>
          <p style={{ color: "#3b82f6", fontSize: 15, margin: 0 }}>{data.tagline}</p>
        </div>
      </CanvasEl>
      <div style={{ height: 14 }} />
      <CanvasEl variant={selectedId === "profile-bio" ? "selected" : "none"} schemaLabel="profile.bio"
        onClick={() => onSelect({ id: "profile-bio", schemaPath: "profile.bio", label: "Biography", fields: [
          { key: "bio", label: "Biography", type: "textarea", value: data.bio },
        ] })}>
        <p style={{ color: "#71717a", fontSize: 13, lineHeight: "22px", margin: 0, padding: "4px 0" }}>{data.bio}</p>
      </CanvasEl>
    </div>
  );
}

function SkillsView({ data, selectedId, onSelect }: {
  data: CanvasData["skills"]; selectedId: string | null;
  onSelect: (s: CanvasSelection) => void;
}) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <p style={{ color: "#52525b", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>content/skills.json</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {data.map((g) => (
          <CanvasEl key={g.id} variant={selectedId === g.id ? "selected" : "none"} schemaLabel={`skills.${g.id}`}
            onClick={() => onSelect({ id: g.id, schemaPath: `skills.${g.id}`, label: g.category, fields: [
              { key: "category", label: "Category", type: "text", value: g.category },
              { key: "skills", label: "Skills", type: "tags", value: g.skills },
            ] })}>
            <div style={{ padding: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: g.color }} />
                <span style={{ color: "#e4e4e7", fontSize: 13, fontWeight: 600 }}>{g.category}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {g.skills.map((s) => <span key={s} style={{ padding: "2px 7px", background: `${g.color}12`, border: `1px solid ${g.color}28`, borderRadius: 6, fontSize: 10, color: g.color, fontFamily: "'JetBrains Mono', monospace" }}>{s}</span>)}
              </div>
            </div>
          </CanvasEl>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ data, selectedId, onSelect }: {
  data: CanvasData["timeline"]; selectedId: string | null;
  onSelect: (s: CanvasSelection) => void;
}) {
  const colors: Record<string, string> = { work: "#3b82f6", education: "#10b981", project: "#a78bfa" };
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <p style={{ color: "#52525b", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>content/experience.json</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.map((e) => {
          const color = colors[e.type] ?? "#71717a";
          return (
            <CanvasEl key={e.id} variant={selectedId === e.id ? "selected" : "none"} schemaLabel={`experience.${e.id}`}
              onClick={() => onSelect({ id: e.id, schemaPath: `experience.${e.id}`, label: `${e.title} @ ${e.org}`, fields: [
                { key: "year", label: "Period", type: "text", value: e.year },
                { key: "org", label: "Organisation", type: "text", value: e.org },
                { key: "title", label: "Role Title", type: "text", value: e.title },
                { key: "description", label: "Description", type: "textarea", value: e.description },
              ] })}>
              <div style={{ padding: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                <div style={{ color: "#e4e4e7", fontSize: 13, fontWeight: 600 }}>{e.title}</div>
                <div style={{ color, fontSize: 11, marginTop: 2 }}>{e.org} · {e.year}</div>
                <div style={{ color: "#52525b", fontSize: 11, marginTop: 5, lineHeight: "17px" }}>{e.description}</div>
              </div>
            </CanvasEl>
          );
        })}
      </div>
    </div>
  );
}

/* --- Code view ------------------------------------------------- */

function CodeView({ context, canvasData }: { context: EditingContext; canvasData: CanvasData }) {
  const json: Record<EditingContext, unknown> = {
    overview: canvasData,
    projects: canvasData.projects,
    skills: canvasData.skills,
    timeline: canvasData.timeline,
    profile: canvasData.profile,
  };
  return (
    <pre style={{ color: "#52525b", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", lineHeight: "18px", margin: 0, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(json[context], null, 2)}
    </pre>
  );
}

/* --- Revision Toolbar ------------------------------------------ */

function RevisionToolbar({ count, onCommit, onDiscard }: { count: number; onCommit: () => void; onDiscard: () => void }) {
  const [committing, setCommitting] = useState(false);
  const [done, setDone] = useState(false);

  function handleCommit() {
    setCommitting(true);
    setTimeout(() => {
      setCommitting(false);
      setDone(true);
      toast.success("Committed to main", { description: "chore(content): update content files" });
      onCommit();
      setTimeout(() => setDone(false), 2000);
    }, 1800);
  }

  if (count === 0 && !done) return null;

  return (
    <div
      style={{
        position: "fixed", bottom: 20, right: 340, zIndex: 150,
        background: "rgba(9,9,11,0.9)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)", padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 12,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ color: "#71717a", fontSize: 11 }}>{count} pending change{count !== 1 ? "s" : ""}</div>
      <button onClick={handleCommit} disabled={committing || done}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
          background: done ? "rgba(16,185,129,0.12)" : "linear-gradient(to bottom, #3b82f6, #2563eb)",
          border: done ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(37,99,235,0.8)",
          borderRadius: 7, color: done ? "#10b981" : "#fff",
          cursor: committing || done ? "not-allowed" : "pointer",
          fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif",
          boxShadow: done ? "none" : "inset 0 1px 0 rgba(255,255,255,0.2)",
          transition: "all 250ms",
        }}
      >
        {done ? <Check size={12} /> : committing ? <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Github size={12} />}
        {done ? "Committed!" : committing ? "Committing..." : "Accept & Commit"}
      </button>
      <button onClick={onDiscard}
        style={{
          padding: "6px 10px", background: "transparent",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7,
          color: "#52525b", cursor: "pointer", fontSize: 11, fontFamily: "'Inter', sans-serif",
          transition: "color 120ms, border-color 120ms",
        }}
        className="hover:text-zinc-300 hover:border-white/20"
      >
        Discard
      </button>
    </div>
  );
}

/* --- Main CanvasPanel ------------------------------------------ */

interface CanvasPanelProps {
  editingContext: EditingContext;
  dirtyRecords: DirtyRecord[];
  aiEditedIds: Set<string>;
  canvasData: CanvasData;
  selectedId: string | null;
  onSelectElement: (s: CanvasSelection | null) => void;
  onCommit: () => void;
  onDiscard: () => void;
}

export function CanvasPanel({ editingContext, dirtyRecords, aiEditedIds, canvasData, selectedId, onSelectElement, onCommit, onDiscard }: CanvasPanelProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [mode, setMode] = useState<CanvasMode>("preview");

  function renderSection() {
    if (mode === "code") return <CodeView context={editingContext} canvasData={canvasData} />;
    if (editingContext === "projects" || editingContext === "overview")
      return <ProjectsView data={canvasData.projects} selectedId={selectedId} aiEditedIds={aiEditedIds} onSelect={onSelectElement} />;
    if (editingContext === "profile")
      return <ProfileView data={canvasData.profile} selectedId={selectedId} onSelect={onSelectElement} />;
    if (editingContext === "skills")
      return <SkillsView data={canvasData.skills} selectedId={selectedId} onSelect={onSelectElement} />;
    if (editingContext === "timeline")
      return <TimelineView data={canvasData.timeline} selectedId={selectedId} onSelect={onSelectElement} />;
    return null;
  }

  const stageWidth = VIEWPORT_SIZES[viewport];

  return (
    <>
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#09090b" }}
        onClick={() => onSelectElement(null)}
      >
        {/* Toolbar */}
        <div
          style={{
            height: 44,
            padding: "0 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            background: "#09090b",
          }}
        >
          {/* Preview / Code toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: 2, gap: 1 }}>
            {(["preview", "code"] as CanvasMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                  background: mode === m ? "rgba(255,255,255,0.07)" : "transparent",
                  border: "1px solid transparent",
                  borderRadius: 5, color: mode === m ? "#e4e4e7" : "#52525b",
                  cursor: "pointer", fontSize: 11, fontFamily: "'Inter', sans-serif", transition: "all 120ms",
                }}
              >
                {m === "preview" ? <Eye size={11} /> : <Code size={11} />}
                {m === "preview" ? "Preview" : "Code"}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {([{ vp: "desktop" as Viewport, Icon: Monitor }, { vp: "tablet" as Viewport, Icon: Tablet }, { vp: "mobile" as Viewport, Icon: Smartphone }]).map(({ vp, Icon }) => (
                <button key={vp} onClick={() => setViewport(vp)} title={vp}
                  style={{
                    width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                    background: viewport === vp ? "rgba(59,130,246,0.1)" : "transparent",
                    border: viewport === vp ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                    borderRadius: 6, color: viewport === vp ? "#3b82f6" : "#52525b",
                    cursor: "pointer", transition: "all 120ms",
                  }}
                  className={viewport !== vp ? "hover:text-zinc-400" : ""}
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>

            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />

            <button
              style={{
                width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "1px solid transparent",
                borderRadius: 6, color: "#52525b", cursor: "pointer",
              }}
              className="hover:text-zinc-400"
            >
              <RefreshCw size={12} />
            </button>

            <PublishButton />
          </div>
        </div>

        {/* Stage — dot-matrix canvas */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "32px 24px 80px",
            background: "#000",
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Website container */}
          <div
            style={{
              width: stageWidth ? stageWidth : "100%",
              maxWidth: stageWidth ?? 1024,
              background: "#0c0c0e",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
              padding: mode === "preview" ? 28 : 20,
              transition: "width 200ms ease-out",
              minHeight: 400,
            }}
          >
            {/* Browser chrome strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {["#ef4444", "#f59e0b", "#22c55e"].map((c, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.6 }} />
              ))}
              <div
                style={{
                  flex: 1,
                  marginLeft: 8,
                  padding: "3px 10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 5,
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#3f3f46",
                  maxWidth: 280,
                }}
              >
                lalitkishore.dev
              </div>
            </div>

            {renderSection()}
          </div>
        </div>
      </div>

      <RevisionToolbar count={dirtyRecords.length} onCommit={onCommit} onDiscard={onDiscard} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

export type { CanvasData, CanvasSelection };
