import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, ChevronDown, ChevronUp, Trash2, Plus, Save, Check, ArrowRight, X,
} from "lucide-react";
import { toast } from "sonner";
import { FigmaInput } from "./figma/FigmaInput";
import { FigmaCard, FigmaCardHeader } from "./figma/FigmaCard";
import { FloatingAIPrompt } from "./ai/FloatingAIPrompt";

/* --- Types ------------------------------------------- */
interface Experience {
  id: string;
  year: string;
  label: string;
  description: string;
  accent: string;
  expanded?: boolean;
}

/* --- ExperienceCard ------------------------------------------- */
function ExperienceCard({ exp, onChange, onDelete }: { exp: Experience; onChange: (e: Experience) => void; onDelete: () => void }) {
  const descRef = useRef<HTMLTextAreaElement>(null);

  function set(key: keyof Experience, val: string | boolean) {
    onChange({ ...exp, [key]: val });
  }

  return (
    <FigmaCard className="mb-4">
      {/* Card header */}
      <FigmaCardHeader className="flex flex-row items-center justify-between py-4 cursor-pointer" onClick={() => set("expanded", !exp.expanded)}>
        <div className="flex items-center gap-3">
          <div onClick={(e) => e.stopPropagation()}><GripVertical size={16} className="text-zinc-500 cursor-grab" /></div>
          {!exp.expanded && (
            <div className="flex items-center gap-2 text-[13px] text-zinc-400">
              <span className="text-zinc-200 font-medium">{exp.year || "Year"}</span>
              <span style={{ color: exp.accent || "#FF3B30" }} className="font-mono text-[11px]">{exp.label || "Index"}</span>
              <span className="truncate max-w-[300px]">— {exp.description || "No description"}</span>
            </div>
          )}
          {exp.expanded && <span className="text-zinc-200 text-[13px] font-medium">Edit Timeline Event</span>}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={onDelete} className="p-1 text-zinc-500 hover:text-rose-500 transition-colors">
            <Trash2 size={14} />
          </button>
          <div className="p-1 text-zinc-500">
            {exp.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </FigmaCardHeader>

      {exp.expanded && (
        <div className="p-6 pt-0 flex flex-col gap-5 border-t border-white/5 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <FigmaInput label="Year" value={exp.year} onChange={(e) => set("year", e.target.value)} placeholder="2025" />
            <FigmaInput label="Label / Index" value={exp.label} onChange={(e) => set("label", e.target.value)} placeholder="01/" />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={exp.accent.startsWith("#") ? exp.accent : "#FF3B30"} onChange={(e) => set("accent", e.target.value)} className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer shrink-0" />
                <FigmaInput value={exp.accent} onChange={(e) => set("accent", e.target.value)} placeholder="#FF3B30" />
              </div>
            </div>
          </div>
          
          <div className="relative">
            <label className="text-[11px] font-semibold tracking-wide text-zinc-400 uppercase mb-1.5 block">Description</label>
            <textarea 
              ref={descRef}
              value={exp.description} 
              onChange={(e) => set("description", e.target.value)} 
              rows={3} 
              className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-[13px] text-zinc-200 outline-none focus:border-blue-500 transition-colors resize-none" 
              placeholder="B.Tech ECE + Data Science, SRMIST" 
            />
            <FloatingAIPrompt onApply={(text) => set("description", text)} />
          </div>
        </div>
      )}
    </FigmaCard>
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
      className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950 font-sans">

      {/* Top Bar */}
      <div className="px-8 py-5 flex items-center justify-between border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50 mb-1">History & Timeline</h1>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>{experiences.length} entries in</span>
            <span className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 font-mono text-[11px] text-zinc-300">experience.json</span>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-all shadow-[0_0_16px_rgba(59,130,246,0.2)] ${saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}>
          {saved ? <><Check size={14} /> Saved</> : saving ? "Saving..." : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto pb-12">
          <AnimatePresence>
            {experiences.map((exp) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}>
                <ExperienceCard exp={exp} onChange={(updated) => update(exp.id, updated)} onDelete={() => remove(exp.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
          <button onClick={add} className="w-full border border-dashed border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 text-[13px] text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all bg-transparent">
            <Plus size={16} /> Add Timeline Event
          </button>
        </div>
      </div>
    </motion.div>
  );
}
