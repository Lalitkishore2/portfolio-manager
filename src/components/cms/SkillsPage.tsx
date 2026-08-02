import { useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Trash2, Plus, Save, Check, X } from "lucide-react";
import { toast } from "sonner";
import { FigmaCard, FigmaCardHeader } from "./figma/FigmaCard";
import { FigmaInput } from "./figma/FigmaInput";

/* --- Types ------------------------------------------------------- */
interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
  rotation?: number;
  accentColor?: string;
}

/* --- TagInput ----------------------------------------------------- */
function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-wrap gap-2 items-center min-h-[44px]">
      <AnimatePresence>
        {tags.map((t) => (
          <motion.span
            key={t}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="bg-zinc-800 border border-white/10 rounded-md px-2.5 py-1 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5"
          >
            {t}
            <button
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-0 flex leading-none bg-transparent border-none"
            >
              <X size={10} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={tags.length === 0 ? "Type + press Enter to add..." : ""}
        className="bg-transparent border-none outline-none text-[12px] text-zinc-300 font-sans min-w-[120px]"
      />
    </div>
  );
}

/* --- CategoryCard ------------------------------------------------- */
function CategoryCard({
  cat,
  onChange,
  onDelete,
}: {
  cat: SkillCategory;
  onChange: (c: SkillCategory) => void;
  onDelete: () => void;
}) {
  return (
    <FigmaCard className="mb-4 overflow-visible">
      <FigmaCardHeader className="flex flex-row items-center justify-between py-4 pb-2">
        <div className="flex items-center gap-3 w-full">
          <GripVertical size={16} className="text-zinc-500 cursor-grab shrink-0" />
          <div className="flex-1 max-w-[200px]">
            <input
              value={cat.name}
              onChange={(e) => onChange({ ...cat, name: e.target.value })}
              placeholder="Category name"
              className="bg-transparent border-none border-b border-transparent focus:border-blue-500/50 outline-none text-[13px] font-semibold text-zinc-200 w-full pb-1 transition-colors"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={onDelete}
              className="p-1 text-zinc-500 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </FigmaCardHeader>

      <div className="px-6 pb-6 pt-2">
        <TagInput
          tags={cat.skills}
          onChange={(skills) => onChange({ ...cat, skills })}
        />
      </div>
    </FigmaCard>
  );
}

/* --- SkillsPage --------------------------------------------------- */
const INITIAL: SkillCategory[] = [
  {
    id: "1",
    name: "Languages",
    skills: ["Python", "C++", "TypeScript", "JavaScript", "SQL"],
  },
  {
    id: "2",
    name: "AI / ML",
    skills: [
      "YOLO11n",
      "PyTorch",
      "TensorFlow",
      "OpenCV",
      "Scikit-learn",
      "Ollama",
    ],
  },
  {
    id: "3",
    name: "Embedded & IoT",
    skills: ["ESP32", "Raspberry Pi 4B", "FreeRTOS", "MQTT", "I2C", "SPI"],
  },
  {
    id: "4",
    name: "Web & Backend",
    skills: ["FastAPI", "React", "Next.js", "Node.js", "PostgreSQL"],
  },
  {
    id: "5",
    name: "DevOps & Tools",
    skills: ["Git", "GitHub Actions", "Docker", "Linux", "VS Code"],
  },
];

export function SkillsPage({ initialData, onSave }: { initialData: any[]; onSave: (data: any[]) => Promise<void> }) {
  const [categories, setCategories] = useState<SkillCategory[]>(() => {
    return (initialData || []).map((s: any, idx: number) => ({
      id: `${idx}-${Date.now()}`,
      name: s.title,
      skills: s.skills,
      rotation: s.rotation,
      accentColor: s.accentColor
    }));
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(id: string, updated: SkillCategory) {
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    setDirty(true);
    setSaved(false);
  }

  function remove(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDirty(true);
  }

  function add() {
    setCategories([
      ...categories,
      { id: Date.now().toString(), name: "", skills: [] },
    ]);
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      // Clean up for saving
      const clean = categories.map((c, i) => ({
        title: c.name,
        skills: c.skills,
        rotation: (i % 3) * 2 - 2, // arbitrary aesthetic rotation
        accentColor: ["#60a5fa", "#34d399", "#c084fc", "#f87171", "#fbbf24"][
          i % 5
        ],
      }));
      await onSave(clean);
      setSaved(true);
      setDirty(false);
      toast.success("Skills saved successfully");
    } catch (e) {
      toast.error("Failed to save skills");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950 font-sans"
    >
      {/* Top Bar */}
      <div className="px-8 py-5 flex items-center justify-between border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50 mb-1">
            Skills & Stack
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>{categories.length} categories in</span>
            <span className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 font-mono text-[11px] text-zinc-300">
              skills.json
            </span>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving || (!dirty && categories.length > 0)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-all shadow-[0_0_16px_rgba(59,130,246,0.2)] ${
            saved
              ? "bg-emerald-600 hover:bg-emerald-700"
              : !dirty && categories.length > 0
              ? "bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {saved ? (
            <>
              <Check size={14} /> Saved
            </>
          ) : saving ? (
            "Saving..."
          ) : (
            <>
              <Save size={14} /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto pb-12">
          <AnimatePresence>
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                cat={c}
                onChange={(u) => update(c.id, u)}
                onDelete={() => remove(c.id)}
              />
            ))}
          </AnimatePresence>
          <button
            onClick={add}
            className="w-full border border-dashed border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 text-[13px] text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all bg-transparent cursor-pointer"
          >
            <Plus size={16} /> Add Skill Category
          </button>
        </div>
      </div>
    </motion.div>
  );
}
