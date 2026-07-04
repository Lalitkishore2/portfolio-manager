import { useState } from "react";
import { X, Save, Check, Plus, Trash2, Layers } from "lucide-react";
import type { CanvasSelection, CanvasField } from "./canvas-types";

interface RightInspectorProps {
  selection: CanvasSelection | null;
  onClose: () => void;
  onFieldChange: (id: string, key: string, value: string | string[]) => void;
  onSave: (id: string) => void;
}

export function RightInspector({ selection, onClose, onFieldChange, onSave }: RightInspectorProps) {
  const [saved, setSaved] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  function handleSave() {
    if (!selection) return;
    onSave(selection.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleFieldChange(key: string, value: string | string[]) {
    if (!selection) return;
    setSaved(false);
    onFieldChange(selection.id, key, value);
  }

  return (
    <div
      style={{
        width: 320,
        minWidth: 320,
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "#09090b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Panel header — always visible */}
      <div
        style={{
          height: 40,
          padding: "0 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Layers size={12} style={{ color: "#3f3f46" }} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.07em",
              color: "#3f3f46",
              textTransform: "uppercase",
            }}
          >
            Properties
          </span>
        </div>
        {selection && (
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "#3f3f46", padding: 4, borderRadius: 5,
              display: "flex", alignItems: "center",
            }}
            className="hover:text-zinc-400"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {!selection ? (
        /* Empty state */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: 24,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Layers size={18} style={{ color: "#3f3f46" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#52525b", fontSize: 12, fontWeight: 500, marginBottom: 3 }}>
              No element selected
            </div>
            <div style={{ color: "#3f3f46", fontSize: 11, lineHeight: "17px" }}>
              Click any element on the canvas to inspect and edit its properties
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Selected element info */}
          <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div style={{ color: "#52525b", fontSize: 10, marginBottom: 5 }}>Selected component</div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 8px",
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: 5,
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#60a5fa",
              }}
            >
              &lt;{selection.label} /&gt;
            </div>
            <div style={{ marginTop: 5, color: "#3f3f46", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>
              {selection.schemaPath}
            </div>
          </div>

          {/* Fields */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Live-update hint */}
            <div
              style={{
                padding: "6px 10px",
                background: "rgba(59,130,246,0.05)",
                border: "1px solid rgba(59,130,246,0.1)",
                borderRadius: 6,
                fontSize: 10,
                color: "#3b82f6",
                lineHeight: "16px",
              }}
            >
              ↻ Canvas updates live as you type
            </div>

            {selection.fields.map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                isFocused={focused === field.key}
                onFocus={() => setFocused(field.key)}
                onBlur={() => setFocused(null)}
                onChange={(v) => handleFieldChange(field.key, v)}
              />
            ))}
          </div>

          {/* Save footer */}
          <div
            style={{
              padding: "10px 14px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleSave}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                padding: "8px",
                background: saved
                  ? "rgba(16,185,129,0.1)"
                  : "linear-gradient(to bottom, #3b82f6, #2563eb)",
                border: saved ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(37,99,235,0.8)",
                borderRadius: 7,
                color: saved ? "#10b981" : "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                transition: "all 200ms",
                boxShadow: saved ? "none" : "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              {saved ? <Check size={12} /> : <Save size={12} />}
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* --- Field control --------------------------------------------- */

function FieldControl({ field, isFocused, onFocus, onBlur, onChange }: {
  field: CanvasField;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (v: string | string[]) => void;
}) {
  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "7px 10px",
    background: "#18181b",
    border: `1px solid ${isFocused ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 7,
    color: "#e4e4e7",
    fontSize: 12,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxShadow: isFocused ? "0 0 0 2px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
    transition: "border-color 120ms, box-shadow 120ms",
    boxSizing: "border-box",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <label
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: isFocused ? "#a1a1aa" : "#52525b",
            textTransform: "uppercase",
            transition: "color 120ms",
          }}
        >
          {field.label}
        </label>
        {field.constraint && (
          <span style={{ color: "#2d2d30", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>
            {field.constraint}
          </span>
        )}
      </div>

      {field.type === "text" && (
        <input
          value={field.value as string}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={inputBase}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          value={field.value as string}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          style={{ ...inputBase, resize: "vertical", lineHeight: "19px" }}
        />
      )}

      {field.type === "tags" && (
        <TagsEditor tags={field.value as string[]} onChange={onChange} isFocused={isFocused} />
      )}
    </div>
  );
}

/* --- Tag editor ------------------------------------------------ */

function TagsEditor({ tags, onChange, isFocused: _ }: { tags: string[]; onChange: (v: string[]) => void; isFocused: boolean }) {
  const [newTag, setNewTag] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  function addTag() {
    const t = newTag.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setNewTag("");
  }

  return (
    <div>
      {/* Existing tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 7 }}>
        {tags.map((tag, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "3px 7px",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.18)",
              borderRadius: 10,
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#60a5fa",
            }}
          >
            {tag}
            <button
              onClick={() => onChange(tags.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "rgba(96,165,250,0.5)", display: "flex", alignItems: "center", lineHeight: 1 }}
              className="hover:text-blue-400"
            >
              <Trash2 size={8} />
            </button>
          </div>
        ))}
      </div>

      {/* Add tag input */}
      <div style={{ display: "flex", gap: 5 }}>
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder="Add tag..."
          style={{
            flex: 1,
            padding: "5px 8px",
            background: "#18181b",
            border: `1px solid ${inputFocused ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 6,
            color: "#e4e4e7",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            outline: "none",
            transition: "border-color 120ms",
          }}
        />
        <button
          onClick={addTag}
          style={{
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 6, color: "#3b82f6", cursor: "pointer",
          }}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
