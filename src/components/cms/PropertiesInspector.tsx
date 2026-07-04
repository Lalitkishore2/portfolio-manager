import { useState } from "react";
import { X, Wand2, Plus, Trash2, GripVertical } from "lucide-react";
import type { SelectedElement, EditableField } from "./editor-types";

interface PropertiesInspectorProps {
  element: SelectedElement | null;
  onClose: () => void;
  onFieldChange: (sectionId: string, recordId: string, key: string, value: string | string[]) => void;
  onOpenAI: (fieldLabel: string, fieldValue: string, context: string) => void;
}

export function PropertiesInspector({
  element,
  onClose,
  onFieldChange,
  onOpenAI,
}: PropertiesInspectorProps) {
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(field: EditableField, value: string): string | null {
    if (!field.constraint) return null;
    const s = typeof value === "string" ? value.trim() : "";
    if (!s) return `${field.label} is required.`;
    if (field.constraint.includes("80 chars") && s.length > 80) return "Must be under 80 characters.";
    if (field.constraint.includes("400 chars") && s.length > 400) return "Must be under 400 characters.";
    if (field.constraint.includes("past-tense") && !/^[A-Z]/.test(s)) return "Must start with a capital letter (past-tense verb).";
    return null;
  }

  function handleChange(field: EditableField, value: string | string[]) {
    if (!element) return;
    const err = typeof value === "string" ? validate(field, value) : null;
    setErrors((prev) => {
      const n = { ...prev };
      if (err) n[field.key] = err;
      else delete n[field.key];
      return n;
    });
    onFieldChange(element.sectionId, element.recordId, field.key, value);
  }

  function addListItem(field: EditableField) {
    handleChange(field, [...(field.value as string[]), ""]);
  }

  function removeListItem(field: EditableField, idx: number) {
    const arr = (field.value as string[]).filter((_, i) => i !== idx);
    handleChange(field, arr);
  }

  function updateListItem(field: EditableField, idx: number, val: string) {
    const arr = (field.value as string[]).map((v, i) => (i === idx ? val : v));
    handleChange(field, arr);
  }

  const diffBadge = element?.diffState && element.diffState !== "clean"
    ? {
        added: { label: "Added", color: "var(--cms-accent-emerald)", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
        modified: { label: "Edited", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
        deleted: { label: "Deleted", color: "var(--cms-accent-rose)", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.2)" },
        clean: null,
      }[element.diffState]
    : null;

  return (
    <div
      style={{
        position: "fixed",
        top: 64,
        right: 0,
        bottom: 0,
        width: 320,
        zIndex: 80,
        background: "linear-gradient(135deg, rgba(24,24,27,0.97), rgba(9,9,11,0.99))",
        backdropFilter: "blur(16px)",
        borderLeft: "1px solid var(--cms-border-dark)",
        boxShadow: "-12px 0 40px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        transform: element ? "translateX(0)" : "translateX(100%)",
        transition: "transform 300ms ease-out",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {element && (
        <>
          {/* Header */}
          <div
            style={{
              padding: "16px 16px 12px",
              borderBottom: "1px solid var(--cms-border-dark)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "var(--cms-text-primary)", fontSize: 14, fontWeight: 600, lineHeight: "20px" }}>
                {element.label}
              </div>
              <div
                style={{
                  color: "var(--cms-text-secondary)",
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {element.fieldPath}
              </div>
              {diffBadge && (
                <div
                  style={{
                    marginTop: 6,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "2px 8px",
                    background: diffBadge.bg,
                    border: `1px solid ${diffBadge.border}`,
                    borderRadius: 12,
                    fontSize: 11,
                    color: diffBadge.color,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: diffBadge.color, display: "inline-block" }} />
                  {diffBadge.label}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--cms-text-secondary)",
                padding: 4,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
              className="hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Fields */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
            {element.fields.map((field) => (
              <FieldEditor
                key={field.key}
                field={field}
                error={errors[field.key]}
                isFocused={focusedKey === field.key}
                onFocus={() => setFocusedKey(field.key)}
                onBlur={() => setFocusedKey(null)}
                onChange={(v) => handleChange(field, v)}
                onAddListItem={() => addListItem(field)}
                onRemoveListItem={(i) => removeListItem(field, i)}
                onUpdateListItem={(i, v) => updateListItem(field, i, v)}
                onOpenAI={() =>
                  onOpenAI(
                    field.label,
                    typeof field.value === "string" ? field.value : field.value.join(", "),
                    element.fieldPath
                  )
                }
              />
            ))}
          </div>

          {/* Constraint hint footer */}
          {focusedKey && (() => {
            const f = element.fields.find((f) => f.key === focusedKey);
            return f?.constraint ? (
              <div
                style={{
                  padding: "8px 16px",
                  borderTop: "1px solid var(--cms-border-dark)",
                  color: "var(--cms-text-secondary)",
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                constraint: {f.constraint}
              </div>
            ) : null;
          })()}
        </>
      )}
    </div>
  );
}

function FieldEditor({
  field,
  error,
  isFocused,
  onFocus,
  onBlur,
  onChange,
  onAddListItem,
  onRemoveListItem,
  onUpdateListItem,
  onOpenAI,
}: {
  field: EditableField;
  error?: string;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (v: string | string[]) => void;
  onAddListItem: () => void;
  onRemoveListItem: (i: number) => void;
  onUpdateListItem: (i: number, v: string) => void;
  onOpenAI: () => void;
}) {
  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${error ? "var(--cms-accent-rose)" : isFocused ? "var(--cms-accent-cobalt)" : "var(--cms-border-dark)"}`,
    borderRadius: 7,
    color: "var(--cms-text-primary)",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxShadow: isFocused && !error ? "0 0 0 1px rgba(59,130,246,0.25)" : "none",
    transition: "border-color 150ms, box-shadow 150ms",
    boxSizing: "border-box" as const,
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <label
          style={{
            color: "var(--cms-text-secondary)",
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {field.label}
        </label>
        {field.aiCapable && (
          <button
            onClick={onOpenAI}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 7px",
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.2)",
              borderRadius: 5,
              color: "#a78bfa",
              cursor: "pointer",
              fontSize: 10,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Wand2 size={10} />
            AI
          </button>
        )}
      </div>

      {field.type === "text" && (
        <input
          value={field.value as string}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          style={inputStyle}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          value={field.value as string}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={4}
          style={{ ...inputStyle, resize: "vertical", lineHeight: "20px" }}
        />
      )}

      {field.type === "tags" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {(field.value as string[]).map((tag, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: 14,
                fontSize: 11,
                color: "var(--cms-accent-cobalt)",
              }}
            >
              {tag}
              <button
                onClick={() => {
                  const arr = (field.value as string[]).filter((_, j) => j !== i);
                  onChange(arr);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", display: "flex", alignItems: "center", lineHeight: 1 }}
              >
                <X size={9} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...(field.value as string[]), "New"])}
            style={{
              padding: "3px 8px",
              background: "transparent",
              border: "1px dashed var(--cms-border-dark)",
              borderRadius: 14,
              fontSize: 11,
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
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {(field.value as string[]).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <GripVertical size={12} style={{ color: "var(--cms-text-secondary)", cursor: "grab", flexShrink: 0, opacity: 0.5 }} />
              <input
                value={item}
                onChange={(e) => onUpdateListItem(i, e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px 9px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--cms-border-dark)",
                  borderRadius: 6,
                  color: "var(--cms-text-primary)",
                  fontSize: 12,
                  fontFamily: "'Inter', sans-serif",
                  outline: "none",
                }}
              />
              <button
                onClick={() => onRemoveListItem(i)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--cms-text-secondary)",
                  padding: 3,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
                className="hover:text-rose-400"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          <button
            onClick={onAddListItem}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 9px",
              background: "transparent",
              border: "1px dashed var(--cms-border-dark)",
              borderRadius: 6,
              color: "var(--cms-text-secondary)",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Plus size={10} />
            Add item
          </button>
        </div>
      )}

      {error && (
        <div style={{ color: "var(--cms-accent-rose)", fontSize: 11, marginTop: 4, lineHeight: "16px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
