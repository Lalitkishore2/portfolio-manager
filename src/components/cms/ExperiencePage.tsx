import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GripVertical, ChevronDown, ChevronUp, Trash2, Plus, Save, Check, Sparkles, ArrowRight, X,
} from "lucide-react";
import { toast } from "sonner";

/* --- Types ------------------------------------------- */
interface Experience {
  id: string;
  year: string;
  label: string;
  description: string;
  accent: string;
  expanded?: boolean;
}

/* --- Shared styles ------------------------------------------- */
const S = {
  label: { fontSize: 11, fontWeight: 500, color: "#a1a1aa", marginBottom: 6, display: "block" } as React.CSSProperties,
  input: {
    background: "rgba(24,24,27,0.5)", border: "1px solid #27272a", borderRadius: 8,
    padding: "8px 12px", fontSize: 13, color: "#e4e4e7", width: "100%", outline: "none",
    transition: "border-color 200ms", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
  } as React.CSSProperties,
  textarea: {
    background: "rgba(24,24,27,0.5)", border: "1px solid #27272a", borderRadius: 8,
    padding: "12px 16px", fontSize: 13, color: "#e4e4e7", width: "100%", outline: "none",
    resize: "none" as const, fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
  } as React.CSSProperties,
  numBadge: {
    width: 24, height: 24, borderRadius: 6, background: "#27272a", border: "1px solid #3f3f46",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#71717a",
  } as React.CSSProperties,
};

/* --- AI mini drawer ------------------------------------------- */
function AIWidget({ onApply }: { onApply: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [generating, setGenerating] = useState(false);

  const SAMPLE = "AquaDot, SmartFlow IV, Med Inventory — multi-system IoT & Edge AI builds successfully completed and validated.";

  function generate() {
    setGenerating(true);
    setResponse("");
    let i = 0;
    const interval = setInterval(() => {
      i += 4;
      setResponse(SAMPLE.slice(0, i));
      if (i >= SAMPLE.length) { clearInterval(interval); setGenerating(false); }
    }, 25);
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(39,39,42,0.8)", border: "1px solid rgba(63,63,70,0.5)", borderRadius: 6, padding: "4px 8px", display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, color: "#a855f7", cursor: "pointer", backdropFilter: "blur(8px)", fontFamily: "'Inter', sans-serif" }}>
      <Sparkles size={12} /> AI
    </button>
  );

  return (
    <div style={{ marginTop: 12, background: "#09090b", border: "1px solid #27272a", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={14} color="#a855f7" /><span style={{ fontSize: 12, fontWeight: 600, color: "#e4e4e7" }}>AI Assistant</span></div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", display: "flex" }}><X size={14} /></button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {["Summarize timeline entry", "Make professional", "Add technical keywords"].map((c) => (
          <button key={c} onClick={generate} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 9999, padding: "4px 10px", fontSize: 11, color: "#a1a1aa", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: response ? 12 : 0 }}>
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} placeholder="Custom instruction..." style={{ ...S.input, flex: 1, padding: "6px 10px", fontSize: 12 }} />
        <button onClick={generate} style={{ background: "#7c3aed", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}><ArrowRight size={13} /></button>
      </div>
      {response && (
        <div style={{ background: "rgba(24,24,27,0.6)", border: "1px solid #27272a", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#a855f7", marginBottom: 6 }}>AI Draft</div>
          <p style={{ fontSize: 12, color: "#d4d4d8", lineHeight: 1.6, margin: 0 }}>{response}{generating && "|"}</p>
          {!generating && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => { onApply(response); setOpen(false); setResponse(""); }} style={{ background: "rgba(5,46,22,0.8)", border: "1px solid rgba(22,101,52,0.5)", color: "#4ade80", fontSize: 11, padding: "5px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif" }}><Check size={12} /> Apply</button>
              <button onClick={() => setResponse("")} style={{ background: "#18181b", border: "1px solid #27272a", color: "#71717a", fontSize: 11, padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Discard</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --- ExperienceCard ------------------------------------------- */
function ExperienceCard({ exp, onChange, onDelete }: { exp: Experience; onChange: (e: Experience) => void; onDelete: () => void }) {
  function set(key: keyof Experience, val: string | boolean) {
    onChange({ ...exp, [key]: val });
  }

  return (
    <div style={{ background: "rgba(24,24,27,0.6)", border: "1px solid #27272a", borderRadius: 16, padding: 20, marginBottom: 16 }}>
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: exp.expanded ? 20 : 0 }}>
        <GripVertical size={16} color="#3f3f46" style={{ cursor: "grab", flexShrink: 0 }} />
        {!exp.expanded && (
          <div style={{ flex: 1, fontSize: 13, color: "#a1a1aa" }}>
            <span style={{ color: "#e4e4e7", fontWeight: 500, marginRight: 8 }}>{exp.year || "Year"}</span>
            <span style={{ color: exp.accent || "#FF3B30", fontFamily: "JetBrains Mono, monospace", fontSize: 11, marginRight: 8 }}>{exp.label || "Index"}</span>
            <span style={{ color: "#71717a" }}>— {exp.description || "No description"}</span>
          </div>
        )}
        {exp.expanded && <div style={{ flex: 1 }} />}
        <button onClick={() => set("expanded", !exp.expanded)} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", display: "flex", padding: 4 }}>
          {exp.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", display: "flex", padding: 4, transition: "color 150ms" }}>
          <Trash2 size={14} />
        </button>
      </div>

      {exp.expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div><label style={S.label}>Year</label><input value={exp.year} onChange={(e) => set("year", e.target.value)} style={S.input} placeholder="2025" /></div>
            <div><label style={S.label}>Label / Index</label><input value={exp.label} onChange={(e) => set("label", e.target.value)} style={S.input} placeholder="01/" /></div>
            <div>
              <label style={S.label}>Accent Color</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={exp.accent.startsWith("#") ? exp.accent : "#FF3B30"} onChange={(e) => set("accent", e.target.value)} style={{ width: 32, height: 32, padding: 0, border: "1px solid #27272a", background: "none", cursor: "pointer" }} />
                <input value={exp.accent} onChange={(e) => set("accent", e.target.value)} style={S.input} placeholder="#FF3B30" />
              </div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <label style={S.label}>Description</label>
            <textarea value={exp.description} onChange={(e) => set("description", e.target.value)} rows={3} style={{ ...S.textarea, minHeight: 80, paddingRight: 60 }} placeholder="B.Tech ECE + Data Science, SRMIST" />
            <AIWidget onApply={(text) => set("description", text)} />
          </div>
        </div>
      )}
    </div>
  );
}

/* --- ExperiencePage ------------------------------------------- */
export function ExperiencePage({ initialData, onSave }: { initialData: Experience[]; onSave: (data: Experience[]) => Promise<void> }) {
  const [experiences, setExperiences] = useState<Experience[]>(() => {
    return (initialData || []).map((e, idx) => ({
      ...e,
      id: e.id || `${idx}-${Date.now()}`,
      expanded: false
    }));
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(id: string, updated: Experience) {
    setExperiences((prev) => prev.map((e) => e.id === id ? updated : e));
  }
  function remove(id: string) { setExperiences((prev) => prev.filter((e) => e.id !== id)); }
  function add() {
    const nextIdx = String(experiences.length + 1).padStart(2, "0") + "/";
    setExperiences([...experiences, { id: Date.now().toString(), year: new Date().getFullYear().toString(), label: nextIdx, description: "", accent: "#FF3B30", expanded: true }]);
  }
  async function save() {
    setSaving(true);
    // Strip client-only expanded state
    const cleanData = experiences.map(({ id, expanded, ...rest }) => rest);
    try {
      await onSave(cleanData as any);
      setSaved(true);
      toast.success("Timeline saved successfully");
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      toast.error("Failed to save timeline changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#09090b", fontFamily: "'Inter', sans-serif" }}>

      {/* Top Bar */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1f1f22", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#fafafa", marginBottom: 4 }}>History & Timeline</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#71717a" }}>
            <span>{experiences.length} entries in</span>
            <span style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 4, padding: "2px 8px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#a1a1aa" }}>experience.json</span>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          style={{ background: saved ? "#166534" : "#3b82f6", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 200ms", boxShadow: "0 0 16px rgba(59,130,246,0.3)", fontFamily: "'Inter', sans-serif" }}>
          {saved ? <><Check size={14} /> Saved</> : saving ? "Saving..." : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <AnimatePresence>
            {experiences.map((exp) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}>
                <ExperienceCard exp={exp} onChange={(updated) => update(exp.id, updated)} onDelete={() => remove(exp.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
          <button onClick={add} style={{ width: "100%", border: "1px dashed #27272a", borderRadius: 12, padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: "#52525b", cursor: "pointer", background: "none", fontFamily: "'Inter', sans-serif", transition: "all 200ms" }}>
            <Plus size={16} /> Add Timeline Event
          </button>
          <div style={{ height: 32 }} />
        </div>
      </div>
    </motion.div>
  );
}
