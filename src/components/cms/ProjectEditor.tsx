import { useState, useCallback, useRef } from "react";
import {
  ChevronRight, X, Plus, Trash2, GripVertical,
  Bold, Italic, List, Code, Wand2, Check, Loader2,
  ChevronLeft, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import type { Project, ArchitectureNode, TechGroup, Stat, ProjectStatus, ProjectCategory } from "./cms-types";
import { uid } from "./cms-types";

/* --- Shared atoms ---------------------------------------------- */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 11px",
  background: "#09090b",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7,
  color: "#e4e4e7",
  fontSize: 13,
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 120ms",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.05em",
  color: "#71717a",
  textTransform: "uppercase",
  marginBottom: 6,
  display: "block",
};

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#111113",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "13px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", letterSpacing: "0.02em" }}>
          {title}
        </span>
        {action}
      </div>
      <div style={{ padding: "18px" }}>{children}</div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function FocusInput({
  value, onChange, placeholder, style = {},
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)",
        boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
        ...style,
      }}
    />
  );
}

function FocusTextarea({
  value, onChange, placeholder, rows = 4, style = {},
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        resize: "vertical",
        lineHeight: "20px",
        borderColor: focused ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)",
        boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
        ...style,
      }}
    />
  );
}

/* --- Tag input ------------------------------------------------- */

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [inputVal, setInputVal] = useState("");
  const [focused, setFocused] = useState(false);

  function add() {
    const t = inputVal.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInputVal("");
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 5,
        padding: "6px 8px",
        background: "#09090b",
        border: `1px solid ${focused ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 7,
        boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
        transition: "border-color 120ms, box-shadow 120ms",
        minHeight: 38,
        cursor: "text",
        alignItems: "center",
      }}
      onClick={() => document.getElementById("tag-inp-" + tags.join(""))?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 7px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 5,
            fontSize: 11,
            color: "#d4d4d8",
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: "16px",
          }}
        >
          {tag}
          <button
            onClick={(e) => { e.stopPropagation(); onChange(tags.filter((_, j) => j !== i)); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#52525b", display: "flex", lineHeight: 1 }}
          >
            <X size={9} />
          </button>
        </span>
      ))}
      <input
        id={"tag-inp-" + tags.join("")}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); add(); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !inputVal && tags.length) onChange(tags.slice(0, -1));
        }}
        placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
        style={{
          background: "none",
          border: "none",
          outline: "none",
          color: "#e4e4e7",
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          minWidth: 120,
          flex: 1,
          padding: "2px 3px",
        }}
      />
    </div>
  );
}

/* --- Markdown toolbar ------------------------------------------ */

function MarkdownTextarea({ value, onChange, rows = 5, placeholder }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = before) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e);
    const newVal = value.slice(0, s) + before + selected + after + value.slice(e);
    onChange(newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + before.length, e + before.length); }, 0);
  }

  const tools = [
    { icon: Bold, action: () => wrap("**"), title: "Bold" },
    { icon: Italic, action: () => wrap("_"), title: "Italic" },
    { icon: Code, action: () => wrap("`"), title: "Inline code" },
    { icon: List, action: () => wrap("- "), title: "List item" },
  ];

  return (
    <div
      style={{
        border: `1px solid ${focused ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 7,
        overflow: "hidden",
        boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
        transition: "border-color 120ms, box-shadow 120ms",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: "5px 8px",
          background: "#0f0f11",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {tools.map(({ icon: Icon, action, title }) => (
          <button
            key={title}
            onMouseDown={(e) => { e.preventDefault(); action(); }}
            title={title}
            style={{
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              borderRadius: 5,
              color: "#52525b",
              cursor: "pointer",
              transition: "background 100ms, color 100ms",
            }}
            className="hover:bg-white/[0.05] hover:text-zinc-300"
          >
            <Icon size={12} />
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 10, color: "#3f3f46" }}>Markdown</div>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        rows={rows}
        style={{
          ...inputStyle,
          border: "none",
          borderRadius: 0,
          boxShadow: "none",
          resize: "vertical",
          lineHeight: "20px",
        }}
      />
    </div>
  );
}

/* --- Architecture node row ------------------------------------- */

const ARCH_COLORS = ["#3b82f6", "#10b981", "#a78bfa", "#f59e0b", "#f43f5e", "#06b6d4", "#ec4899"];

function ArchNodeRow({
  node,
  onUpdate,
  onDelete,
}: {
  node: ArchitectureNode;
  onUpdate: (n: ArchitectureNode) => void;
  onDelete: () => void;
}) {
  const [colorOpen, setColorOpen] = useState(false);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "24px auto 1fr 28px",
        gap: 10,
        alignItems: "start",
        padding: "12px 14px",
        background: "#18181b",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
      }}
    >
      {/* Drag handle */}
      <div style={{ paddingTop: 8, cursor: "grab", color: "#3f3f46", display: "flex", justifyContent: "center" }}>
        <GripVertical size={14} />
      </div>

      {/* Color + Label */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Color picker */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setColorOpen((v) => !v)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: node.color,
              border: "2px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
              display: "block",
              boxShadow: `0 0 8px ${node.color}60`,
            }}
          />
          {colorOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 30 }} onClick={() => setColorOpen(false)} />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  zIndex: 35,
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: 8,
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  width: 120,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                {ARCH_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { onUpdate({ ...node, color: c }); setColorOpen(false); }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: c,
                      border: node.color === c ? "2px solid #fff" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Label input */}
        <FocusInput
          value={node.label}
          onChange={(v) => onUpdate({ ...node, label: v })}
          placeholder="NODE LABEL"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.05em", width: 120 }}
        />
      </div>

      {/* Items tag input */}
      <div>
        <div style={{ fontSize: 10, color: "#3f3f46", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Items</div>
        <TagInput tags={node.items} onChange={(items) => onUpdate({ ...node, items })} />
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{
          width: 28,
          height: 28,
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "1px solid transparent",
          borderRadius: 6,
          color: "#3f3f46",
          cursor: "pointer",
          transition: "all 120ms",
        }}
        className="hover:text-rose-400 hover:border-rose-400/20 hover:bg-rose-400/5"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

/* --- Tech group row -------------------------------------------- */

function TechGroupRow({
  group,
  onUpdate,
  onDelete,
}: {
  group: TechGroup;
  onUpdate: (g: TechGroup) => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "#18181b",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        display: "flex",
        gap: 10,
        alignItems: "start",
      }}
    >
      <div style={{ paddingTop: 8, cursor: "grab", color: "#3f3f46", flexShrink: 0 }}>
        <GripVertical size={14} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FocusInput
            value={group.groupName}
            onChange={(v) => onUpdate({ ...group, groupName: v })}
            placeholder="GROUP NAME"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", width: 160 }}
          />
          <div style={{ fontSize: 10, color: "#3f3f46" }}>→</div>
          <div style={{ flex: 1 }}>
            <TagInput tags={group.items} onChange={(items) => onUpdate({ ...group, items })} />
          </div>
        </div>
      </div>

      <button
        onClick={onDelete}
        style={{
          width: 28, height: 28, marginTop: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", border: "1px solid transparent",
          borderRadius: 6, color: "#3f3f46", cursor: "pointer",
          transition: "all 120ms",
        }}
        className="hover:text-rose-400 hover:border-rose-400/20 hover:bg-rose-400/5"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

/* --- Native select --------------------------------------------- */

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          appearance: "none",
          paddingRight: 32,
          borderColor: focused ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)",
          boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#18181b" }}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#52525b", pointerEvents: "none" }} />
    </div>
  );
}

/* --- AI Assistant widget --------------------------------------- */

const AI_SUGGESTIONS = [
  "Rewrite the problem statement to be more professional and metrics-driven.",
  "Generate a concise tagline under 80 characters.",
  "Expand the overview to emphasize technical innovation.",
];

function AIAssistantWidget({ onApply }: { onApply: (field: string, value: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [focused, setFocused] = useState(false);

  const MOCK_RESPONSES: Record<string, { field: string; value: string }> = {
    problem: {
      field: "problem",
      value: "Aquaculture operations face a critical monitoring gap: manual water quality testing is performed every 4–8 hours, leaving undetected parameter excursions that result in significant livestock mortality. Commercial IoT monitors command prices exceeding $3,000 per node, placing them beyond reach for the 90% of fish farms operating at subsistence scale. AquaDot addresses this by delivering sub-second anomaly detection at a $47 total BOM cost.",
    },
    tagline: {
      field: "tagline",
      value: "Sub-second water anomaly detection at $47 BOM — edge ML for aquaculture.",
    },
    overview: {
      field: "overview",
      value: "AquaDot is a production-grade IoT platform combining ESP32-based edge inference with a cloud dashboard to deliver real-time water quality monitoring for aquaculture. By running a quantized TensorFlow Lite model directly on the microcontroller, anomaly detection operates at 500ms intervals without cloud dependency, achieving 94% accuracy on held-out validation data while consuming only 180mA average current.",
    },
  };

  function handleGenerate() {
    setLoading(true);
    setResult("");
    setTimeout(() => {
      const key = prompt.toLowerCase().includes("problem") ? "problem"
        : prompt.toLowerCase().includes("tagline") ? "tagline"
        : "overview";
      const resp = MOCK_RESPONSES[key];
      setResult(resp.value);
      setLoading(false);
    }, 1400);
  }

  function handleApply() {
    const key = prompt.toLowerCase().includes("problem") ? "problem"
      : prompt.toLowerCase().includes("tagline") ? "tagline"
      : "overview";
    const resp = MOCK_RESPONSES[key];
    onApply(resp.field, resp.value);
    setResult("");
    setPrompt("");
    toast.success("AI content applied", { description: `${resp.field} field updated` });
  }

  return (
    <div
      style={{
        background: "#111113",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "11px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(99,102,241,0.04))",
        }}
      >
        <Wand2 size={13} style={{ color: "#818cf8" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}>AI Assistant</span>
      </div>

      <div style={{ padding: 14 }}>
        {/* Suggestion chips */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
          {AI_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setPrompt(s)}
              style={{
                padding: "5px 9px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 6,
                color: "#52525b",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
                textAlign: "left",
                lineHeight: "16px",
                transition: "border-color 100ms, color 100ms",
              }}
              className="hover:border-indigo-500/30 hover:text-zinc-400"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Prompt input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder='e.g. "Rewrite the problem statement to be more professional"'
          rows={3}
          style={{
            ...inputStyle,
            resize: "none",
            lineHeight: "19px",
            fontSize: 12,
            borderColor: focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
            boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
          }}
        />

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            marginTop: 8,
            padding: "7px",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 7,
            color: "#818cf8",
            cursor: !prompt.trim() || loading ? "not-allowed" : "pointer",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            opacity: !prompt.trim() ? 0.4 : 1,
            transition: "opacity 150ms",
          }}
        >
          {loading ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Wand2 size={12} />}
          {loading ? "Generating..." : "Generate"}
        </button>

        {/* AI result */}
        {result && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                padding: "10px 12px",
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 7,
                color: "#a1a1aa",
                fontSize: 12,
                lineHeight: "19px",
                marginBottom: 8,
                fontStyle: "italic",
              }}
            >
              {result}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleApply}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 6,
                  color: "#10b981",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <Check size={11} />
                Apply
              </button>
              <button
                onClick={() => setResult("")}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6,
                  color: "#52525b",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Main ProjectEditor ---------------------------------------- */

interface ProjectEditorProps {
  project: Project;
  onBack: () => void;
  onSave: (p: Project) => void;
  onDelete?: (id: string) => void;
}

function prepareProject(project: Project): Project {
  const clone = JSON.parse(JSON.stringify(project));
  if (clone.architecture) {
    clone.architecture = clone.architecture.map((node: any) => ({
      ...node,
      id: node.id || uid()
    }));
  }
  if (clone.techStack) {
    clone.techStack = clone.techStack.map((group: any) => ({
      ...group,
      id: group.id || uid()
    }));
  }
  if (clone.stats) {
    clone.stats = clone.stats.map((stat: any) => ({
      ...stat,
      id: stat.id || uid()
    }));
  }
  return clone;
}

export function ProjectEditor({ project: initial, onBack, onSave, onDelete }: ProjectEditorProps) {
  const [draft, setDraft] = useState<Project>(() => prepareProject(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = useCallback(<K extends keyof Project>(key: K, val: Project[K]) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      setSaved(true);
      toast.success("Changes saved", { description: `projects.json updated · ${draft.slug}` });
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [selectedReverts, setSelectedReverts] = useState<Record<string, boolean>>({});

  function getActiveChanges() {
    const changes: { key: string; label: string; from: string; to: string }[] = [];
    
    const simpleFields: { key: keyof Project; label: string }[] = [
      { key: "title", label: "Title" },
      { key: "tagline", label: "Tagline" },
      { key: "overview", label: "Overview" },
      { key: "problem", label: "Problem Statement" },
      { key: "year", label: "Year" },
      { key: "accentColor", label: "Accent Color" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "nextSlug", label: "Next Project Slug" },
      { key: "prevSlug", label: "Previous Project Slug" },
      { key: "description", label: "Description" },
      { key: "metric", label: "Key Metric" },
      { key: "rotation", label: "Visual Rotation" },
    ];

    simpleFields.forEach(({ key, label }) => {
      if (draft[key] !== initial[key]) {
        changes.push({
          key: key as string,
          label,
          from: String(initial[key] ?? ""),
          to: String(draft[key] ?? ""),
        });
      }
    });

    const arrayStringFields: { key: "challenges" | "tags"; label: string }[] = [
      { key: "challenges", label: "Challenges" },
      { key: "tags", label: "Tags" },
    ];

    arrayStringFields.forEach(({ key, label }) => {
      const initArr = initial[key] || [];
      const draftArr = draft[key] || [];
      if (JSON.stringify(initArr) !== JSON.stringify(draftArr)) {
        changes.push({
          key,
          label,
          from: initArr.join(", ") || "(empty)",
          to: draftArr.join(", ") || "(empty)",
        });
      }
    });

    if (JSON.stringify(initial.architecture) !== JSON.stringify(draft.architecture)) {
      changes.push({
        key: "architecture",
        label: "Architecture Nodes",
        from: `(${initial.architecture?.length || 0} nodes)`,
        to: `(${draft.architecture?.length || 0} nodes)`,
      });
    }

    if (JSON.stringify(initial.techStack) !== JSON.stringify(draft.techStack)) {
      changes.push({
        key: "techStack",
        label: "Tech Stack Groups",
        from: `(${initial.techStack?.length || 0} groups)`,
        to: `(${draft.techStack?.length || 0} groups)`,
      });
    }

    if (JSON.stringify(initial.stats) !== JSON.stringify(draft.stats)) {
      changes.push({
        key: "stats",
        label: "Key Stats",
        from: `(${initial.stats?.length || 0} stats)`,
        to: `(${draft.stats?.length || 0} stats)`,
      });
    }

    return changes;
  }

  function revertFields(keysToRevert: string[]) {
    const preparedInitial = prepareProject(initial);
    setDraft((prev) => {
      const next = { ...prev };
      keysToRevert.forEach((key) => {
        (next as any)[key] = (preparedInitial as any)[key];
      });
      return next;
    });
    setSaved(false);
  }

  function handleDiscardClick() {
    const activeChanges = getActiveChanges();
    if (activeChanges.length === 0) {
      toast("No changes to discard");
      return;
    }
    const initialSelections: Record<string, boolean> = {};
    activeChanges.forEach((c) => {
      initialSelections[c.key] = true;
    });
    setSelectedReverts(initialSelections);
    setShowDiscardModal(true);
  }

  /* Architecture */
  function addArchNode() {
    update("architecture", [
      ...draft.architecture,
      { id: uid(), label: "NEW NODE", color: ARCH_COLORS[draft.architecture.length % ARCH_COLORS.length], items: [] },
    ]);
  }
  function updateArchNode(id: string, node: ArchitectureNode) {
    update("architecture", draft.architecture.map((n) => n.id === id ? node : n));
  }
  function deleteArchNode(id: string) {
    update("architecture", draft.architecture.filter((n) => n.id !== id));
  }

  /* Tech stack */
  function addTechGroup() {
    update("techStack", [...draft.techStack, { id: uid(), groupName: "NEW GROUP", items: [] }]);
  }
  function updateTechGroup(id: string, group: TechGroup) {
    update("techStack", draft.techStack.map((g) => g.id === id ? group : g));
  }
  function deleteTechGroup(id: string) {
    update("techStack", draft.techStack.filter((g) => g.id !== id));
  }

  /* Challenges */
  function addChallenge() { update("challenges", [...draft.challenges, ""]); }
  function updateChallenge(i: number, v: string) {
    update("challenges", draft.challenges.map((c, j) => j === i ? v : c));
  }
  function deleteChallenge(i: number) {
    update("challenges", draft.challenges.filter((_, j) => j !== i));
  }

  /* Stats */
  function updateStat(id: string, partial: Partial<Stat>) {
    update("stats", draft.stats.map((s) => s.id === id ? { ...s, ...partial } : s));
  }
  function addStat() {
    update("stats", [...draft.stats, { id: uid(), label: "", value: "", unit: "" }]);
  }
  function deleteStat(id: string) {
    update("stats", draft.stats.filter((s) => s.id !== id));
  }

  /* AI apply */
  function applyAI(field: string, value: string) {
    update(field as keyof Project, value as never);
  }

  const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: "building", label: "Building" },
    { value: "prototype", label: "Prototype" },
    { value: "live", label: "Live" },
    { value: "complete", label: "Complete" },
  ];

  const CATEGORY_OPTIONS: { value: ProjectCategory; label: string }[] = [
    { value: "IOT", label: "IOT" },
    { value: "WEB", label: "WEB" },
    { value: "AI", label: "AI" },
  ];

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        background: "#09090b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sticky page header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(9,9,11,0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Breadcrumbs + title */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#52525b",
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
              className="hover:text-zinc-400"
            >
              <ChevronLeft size={12} />
              Projects
            </button>
            <ChevronRight size={11} style={{ color: "#3f3f46" }} />
            <span style={{ color: "#a1a1aa", fontSize: 12 }}>{draft.title}</span>
          </div>
          <h1 style={{ color: "#fafafa", fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
            Edit {draft.title}
          </h1>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete this project "${draft.title}"? This cannot be undone.`)) {
                  onDelete(draft.id);
                }
              }}
              style={{
                padding: "7px 14px",
                background: "transparent",
                border: "1px solid rgba(244,63,94,0.2)",
                borderRadius: 7,
                color: "#f43f5e",
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                transition: "all 120ms",
                marginRight: 8,
              }}
              className="hover:bg-rose-950/20 hover:border-rose-500/40"
            >
              Delete Project
            </button>
          )}
          <button
            onClick={handleDiscardClick}
            style={{
              padding: "7px 14px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 7,
              color: "#71717a",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              transition: "border-color 120ms, color 120ms",
            }}
            className="hover:border-white/20 hover:text-zinc-300"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: saved ? "rgba(16,185,129,0.12)" : "linear-gradient(to bottom, #3b82f6, #2563eb)",
              border: saved ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(37,99,235,0.7)",
              borderRadius: 7,
              color: saved ? "#10b981" : "#fff",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saved ? "none" : "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 6px rgba(59,130,246,0.3)",
              transition: "all 250ms",
            }}
          >
            {saving ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : saved ? <Check size={12} /> : null}
            {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Two-column form */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 20,
          padding: "24px 28px 60px",
          alignItems: "start",
        }}
      >
        {/* -- LEFT COLUMN (70%) -- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Basic Info */}
          <Card title="Basic Info">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FieldRow label="Title">
                  <FocusInput value={draft.title} onChange={(v) => update("title", v)} placeholder="Project title" />
                </FieldRow>
                <FieldRow label="Slug">
                  <FocusInput
                    value={draft.slug}
                    onChange={(v) => update("slug", v.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="project-slug"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                  />
                </FieldRow>
              </div>

              <FieldRow label="Tagline">
                <FocusInput value={draft.tagline} onChange={(v) => update("tagline", v)} placeholder="One-line description (under 100 chars)" />
              </FieldRow>

              <FieldRow label="Overview">
                <MarkdownTextarea
                  value={draft.overview}
                  onChange={(v) => update("overview", v)}
                  rows={5}
                  placeholder="Describe the project, its goals, and key outcomes..."
                />
              </FieldRow>

              <FieldRow label="Problem Statement">
                <MarkdownTextarea
                  value={draft.problem || ""}
                  onChange={(v) => update("problem", v)}
                  rows={4}
                  placeholder="What problem does this project solve?"
                />
              </FieldRow>
            </div>
          </Card>

          {/* Architecture */}
          <Card
            title={`Architecture Nodes (${draft.architecture.length})`}
            action={
              <button
                onClick={addArchNode}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 6,
                  color: "#60a5fa",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Plus size={11} />
                Add Node
              </button>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px auto 1fr 28px",
                  gap: 10,
                  padding: "0 14px 6px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {["", "Color · Label", "Items", ""].map((h, i) => (
                  <div key={i} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", color: "#3f3f46", textTransform: "uppercase" }}>
                    {h}
                  </div>
                ))}
              </div>

              {draft.architecture.map((node) => (
                <ArchNodeRow
                  key={node.id}
                  node={node}
                  onUpdate={(n) => updateArchNode(node.id, n)}
                  onDelete={() => deleteArchNode(node.id)}
                />
              ))}

              {draft.architecture.length === 0 && (
                <div style={{ padding: "20px 0", textAlign: "center", color: "#3f3f46", fontSize: 12 }}>
                  No architecture nodes yet. Click "Add Node" to start.
                </div>
              )}
            </div>
          </Card>

          {/* Tech Stack */}
          <Card
            title={`Tech Stack (${draft.techStack.length} groups)`}
            action={
              <button
                onClick={addTechGroup}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 6,
                  color: "#60a5fa",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Plus size={11} />
                Add Group
              </button>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {draft.techStack.map((group) => (
                <TechGroupRow
                  key={group.id}
                  group={group}
                  onUpdate={(g) => updateTechGroup(group.id, g)}
                  onDelete={() => deleteTechGroup(group.id)}
                />
              ))}
              {draft.techStack.length === 0 && (
                <div style={{ padding: "20px 0", textAlign: "center", color: "#3f3f46", fontSize: 12 }}>
                  No tech groups yet.
                </div>
              )}
            </div>
          </Card>

          {/* Challenges */}
          <Card
            title={`Challenges (${draft.challenges.length})`}
            action={
              <button
                onClick={addChallenge}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 6,
                  color: "#60a5fa",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Plus size={11} />
                Add Challenge
              </button>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {draft.challenges.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "start" }}>
                  <span style={{ color: "#3f3f46", fontSize: 11, paddingTop: 10, minWidth: 20, textAlign: "right" }}>
                    {i + 1}.
                  </span>
                  <div style={{ flex: 1 }}>
                    <FocusTextarea
                      value={c}
                      onChange={(v) => updateChallenge(i, v)}
                      rows={2}
                      placeholder="Describe a key technical challenge..."
                    />
                  </div>
                  <button
                    onClick={() => deleteChallenge(i)}
                    style={{
                      width: 30, height: 30, marginTop: 4,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "transparent", border: "1px solid transparent",
                      borderRadius: 6, color: "#3f3f46", cursor: "pointer",
                      transition: "all 120ms",
                    }}
                    className="hover:text-rose-400 hover:border-rose-400/20 hover:bg-rose-400/5"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {draft.challenges.length === 0 && (
                <div style={{ padding: "16px 0", textAlign: "center", color: "#3f3f46", fontSize: 12 }}>
                  No challenges listed yet.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* -- RIGHT COLUMN (30%) -- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80 }}>

          {/* Status & Routing */}
          <Card title="Status & Routing">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FieldRow label="Status">
                <NativeSelect
                  value={draft.status}
                  onChange={(v) => update("status", v as ProjectStatus)}
                  options={STATUS_OPTIONS}
                />
              </FieldRow>

              <FieldRow label="Category">
                <NativeSelect
                  value={draft.category}
                  onChange={(v) => update("category", v as ProjectCategory)}
                  options={CATEGORY_OPTIONS}
                />
              </FieldRow>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                <div style={{ ...labelStyle, marginBottom: 8 }}>Routing</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#3f3f46", marginBottom: 4 }}>← Previous slug</div>
                    <FocusInput
                      value={draft.prevSlug}
                      onChange={(v) => update("prevSlug", v)}
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#3f3f46", marginBottom: 4 }}>→ Next slug</div>
                    <FocusInput
                      value={draft.nextSlug}
                      onChange={(v) => update("nextSlug", v)}
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card
            title="Key Stats"
            action={
              <button
                onClick={addStat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 5,
                  color: "#60a5fa",
                  cursor: "pointer",
                  fontSize: 10,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Plus size={10} />
                Add
              </button>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {draft.stats.map((stat) => (
                <div
                  key={stat.id}
                  style={{
                    padding: "10px 12px",
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 7,
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <FocusInput
                      value={stat.label}
                      onChange={(v) => updateStat(stat.id, { label: v })}
                      placeholder="Label"
                      style={{ fontSize: 11, fontWeight: 600 }}
                    />
                    <button
                      onClick={() => deleteStat(stat.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#3f3f46", marginLeft: 6, display: "flex", alignItems: "center", flexShrink: 0 }}
                      className="hover:text-rose-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <FocusInput
                      value={stat.value}
                      onChange={(v) => updateStat(stat.id, { value: v })}
                      placeholder="~70%"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700 }}
                    />
                    <FocusInput
                      value={stat.unit}
                      onChange={(v) => updateStat(stat.id, { unit: v })}
                      placeholder="unit"
                      style={{ fontSize: 10, color: "#71717a" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Assistant */}
          <AIAssistantWidget onApply={applyAI} />
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {showDiscardModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#18181b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              width: "100%",
              maxWidth: 520,
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.5)",
              color: "#fafafa",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
                Discard Changes
              </h2>
              <button
                onClick={() => setShowDiscardModal(false)}
                style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer", display: "flex", padding: 4 }}
                className="hover:text-zinc-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 13, color: "#a1a1aa", lineHeight: "20px", margin: 0 }}>
                Select the changes you want to revert back to their original values. Unchecked fields will keep their current modifications.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                {getActiveChanges().map((change) => {
                  const isChecked = !!selectedReverts[change.key];
                  return (
                    <div
                      key={change.key}
                      onClick={() => setSelectedReverts(prev => ({ ...prev, [change.key]: !isChecked }))}
                      style={{
                        padding: "10px 12px",
                        background: isChecked ? "rgba(244,63,94,0.03)" : "rgba(255,255,255,0.01)",
                        border: `1px solid ${isChecked ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.05)"}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "start",
                        gap: 12,
                        transition: "all 120ms",
                      }}
                      className="hover:border-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by div onClick
                        style={{ marginTop: 3, cursor: "pointer", accentColor: "#f43f5e" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: isChecked ? "#f43f5e" : "#fafafa", marginBottom: 2 }}>
                          {change.label}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11, color: "#71717a", fontFamily: "monospace" }}>
                          <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            <span style={{ color: "#a1a1aa", marginRight: 4 }}>From:</span> {change.from}
                          </div>
                          <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            <span style={{ color: "#a1a1aa", marginRight: 4 }}>To:</span> {change.to}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => {
                  revertFields(Object.keys(selectedReverts).filter(k => selectedReverts[k]));
                  setShowDiscardModal(false);
                  toast.success("Selected changes reverted");
                }}
                disabled={!Object.values(selectedReverts).some(Boolean)}
                style={{
                  padding: "8px 16px",
                  background: Object.values(selectedReverts).some(Boolean) ? "#f43f5e" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${Object.values(selectedReverts).some(Boolean) ? "rgba(244,63,94,0.7)" : "rgba(255,255,255,0.05)"}`,
                  borderRadius: 8,
                  color: Object.values(selectedReverts).some(Boolean) ? "#fff" : "#52525b",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: Object.values(selectedReverts).some(Boolean) ? "pointer" : "not-allowed",
                  transition: "all 150ms",
                }}
              >
                Revert Selected
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    const allKeys = getActiveChanges().map(c => c.key);
                    revertFields(allKeys);
                    setShowDiscardModal(false);
                    toast.success("All changes reverted");
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#a1a1aa",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                  className="hover:border-white/20 hover:text-zinc-300"
                >
                  Revert All
                </button>
                <button
                  onClick={() => setShowDiscardModal(false)}
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid transparent",
                    borderRadius: 8,
                    color: "#71717a",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                  className="hover:text-zinc-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
