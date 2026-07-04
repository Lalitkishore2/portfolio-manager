import { useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GripVertical, Trash2, Plus, Save, Check, X } from "lucide-react";
import { toast } from "sonner";

/* --- Types ------------------------------------------------------- */
interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
  rotation?: number;
  accentColor?: string;
}

/* --- Shared style atoms ------------------------------------------- */
const inp: React.CSSProperties = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #27272a",
  outline: "none",
  fontSize: 14,
  fontWeight: 600,
  color: "#e4e4e7",
  fontFamily: "'Inter', sans-serif",
  width: "100%",
  paddingBottom: 4,
  transition: "border-color 200ms",
};

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
    <div
      style={{
        background: "rgba(24,24,27,0.5)",
        border: "1px solid #27272a",
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex",
        flexWrap: "wrap" as const,
        gap: 8,
        alignItems: "center",
        minHeight: 44,
      }}
    >
      <AnimatePresence>
        {tags.map((t) => (
          <motion.span
            key={t}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              background: "#27272a",
              border: "1px solid rgba(63,63,70,0.5)",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 11,
              fontFamily: "JetBrains Mono, monospace",
              color: "#d4d4d8",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {t}
            <button
              onClick={() => onChange(tags.filter((x) => x !== t))}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#52525b",
                padding: 0,
                display: "flex",
                lineHeight: 1,
              }}
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
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 12,
          color: "#d4d4d8",
          fontFamily: "'Inter', sans-serif",
          minWidth: 120,
        }}
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{
        background: "rgba(24,24,27,0.6)",
        border: "1px solid #27272a",
        borderRadius: 16,
        padding: 20,
        marginBottom: 14,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <GripVertical
          size={16}
          color="#3f3f46"
          style={{ cursor: "grab", flexShrink: 0 }}
        />
        <input
          value={cat.name}
          onChange={(e) => onChange({ ...cat, name: e.target.value })}
          placeholder="Category name"
          style={inp}
        />
        <button
          onClick={onDelete}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#52525b",
            display: "flex",
            padding: 4,
            flexShrink: 0,
            transition: "color 150ms",
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Skills tag input */}
      <TagInput
        tags={cat.skills}
        onChange={(skills) => onChange({ ...cat, skills })}
      />
    </motion.div>
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
    const ACCENTS = ["#C6FF00", "#FF3B30", "#2D5BFF", "#FF006E", "#00E5FF", "#FF9500"];
    const payload = categories.map((cat, idx) => ({
      title: cat.name,
      skills: cat.skills,
      rotation: typeof cat.rotation === "number" ? cat.rotation : parseFloat((Math.random() * 2.4 - 1.2).toFixed(1)),
      accentColor: cat.accentColor || ACCENTS[idx % ACCENTS.length]
    }));

    try {
      await onSave(payload);
      setSaved(true);
      setDirty(false);
      toast.success("Skills saved to skills.json");
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      toast.error("Failed to save skills");
    } finally {
      setSaving(false);
    }
  }

  const totalSkills = categories.reduce((acc, c) => acc + c.skills.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "#09090b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1f1f22",
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#fafafa",
              margin: "0 0 4px",
            }}
          >
            Skills
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#71717a",
            }}
          >
            <span>
              {totalSkills} skills across {categories.length} categories in
            </span>
            <span
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 4,
                padding: "2px 8px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                color: "#a1a1aa",
              }}
            >
              skills.json
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {dirty && (
            <button
              onClick={() => {
                setCategories(INITIAL);
                setDirty(false);
              }}
              style={{
                padding: "7px 14px",
                background: "transparent",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 12,
                color: "#71717a",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Discard Changes
            </button>
          )}
          <button
            onClick={save}
            disabled={saving}
            style={{
              background: saved ? "#166534" : "#3b82f6",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 0 16px rgba(59,130,246,0.3)",
              fontFamily: "'Inter', sans-serif",
              transition: "all 200ms",
            }}
          >
            {saved ? (
              <>
                <Check size={13} /> Saved
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              <>
                <Save size={13} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <AnimatePresence mode="popLayout">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                onChange={(updated) => update(cat.id, updated)}
                onDelete={() => remove(cat.id)}
              />
            ))}
          </AnimatePresence>

          <button
            onClick={add}
            style={{
              width: "100%",
              border: "1px dashed #27272a",
              borderRadius: 12,
              padding: "12px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 13,
              color: "#52525b",
              cursor: "pointer",
              background: "none",
              fontFamily: "'Inter', sans-serif",
              transition: "all 200ms",
            }}
          >
            <Plus size={15} /> Add Category
          </button>

          <div style={{ height: 40 }} />
        </div>
      </div>
    </motion.div>
  );
}
