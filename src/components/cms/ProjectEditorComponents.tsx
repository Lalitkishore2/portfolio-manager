import React, { useState, useRef } from "react";
import { X, GripVertical, Bold, Italic, List, Code, Wand2, Check, Loader2, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ArchitectureNode, TechGroup } from "./cms-types";

/* --- Shared atoms ---------------------------------------------- */

export const inputStyle: React.CSSProperties = {
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

export const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.05em",
  color: "#71717a",
  textTransform: "uppercase",
  marginBottom: 6,
  display: "block",
};

export function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
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

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export function FocusInput({
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

export function FocusTextarea({
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

export function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
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

export function MarkdownTextarea({ value, onChange, rows = 5, placeholder }: {
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

export const ARCH_COLORS = ["#3b82f6", "#10b981", "#a78bfa", "#f59e0b", "#f43f5e", "#06b6d4", "#ec4899"];

export function ArchNodeRow({
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

export function TechGroupRow({
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

export function NativeSelect({
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

export function AIAssistantWidget({ onApply }: { onApply: (field: string, value: string) => void }) {
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
