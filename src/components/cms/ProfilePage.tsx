import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Upload,
  Camera,
  Github,
  Linkedin,
  Mail,
  Globe,
  Plus,
  Trash2,
  Save,
  Sparkles,
  X,
  ArrowRight,
  Check,
} from "lucide-react";

import { FloatingAIPrompt } from "./ai/FloatingAIPrompt";
import { DiffAcceptor } from "./ai/DiffAcceptor";

/* --- Types ------------------------------------------- */
interface SocialLink { id: string; platform: "github" | "linkedin" | "mail" | "globe"; url: string; }

/* --- Helpers ------------------------------------------- */
const S = {
  label: { fontSize: 11, fontWeight: 500, color: "#a1a1aa", marginBottom: 6, display: "block" } as React.CSSProperties,
  input: {
    background: "rgba(24,24,27,0.5)",
    border: "1px solid #27272a",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    color: "#e4e4e7",
    width: "100%",
    outline: "none",
    transition: "border-color 200ms",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  } as React.CSSProperties,
  textarea: {
    background: "rgba(24,24,27,0.5)",
    border: "1px solid #27272a",
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 13,
    color: "#e4e4e7",
    width: "100%",
    outline: "none",
    resize: "none" as const,
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  } as React.CSSProperties,
  sectionHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20, marginTop: 32 } as React.CSSProperties,
  numBadge: {
    width: 24, height: 24, borderRadius: 6, background: "#27272a",
    border: "1px solid #3f3f46", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#71717a", flexShrink: 0,
  } as React.CSSProperties,
  sectionLabel: { fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.1em" },
  sectionLine: { flex: 1, height: 1, background: "rgba(39,39,42,0.5)" } as React.CSSProperties,
};

/* --- TagInput ------------------------------------------- */
function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
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
    <div style={{ background: "rgba(24,24,27,0.5)", border: "1px solid #27272a", borderRadius: 12, padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minHeight: 52 }}>
      <AnimatePresence>
        {tags.map((t) => (
          <motion.span key={t} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.15 }}
            style={{ background: "#27272a", border: "1px solid rgba(63,63,70,0.5)", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontFamily: "JetBrains Mono, monospace", fontWeight: 500, color: "#d4d4d8", display: "flex", alignItems: "center", gap: 6 }}>
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", padding: 0, lineHeight: 1, display: "flex" }}>
              <X size={10} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
        placeholder={tags.length === 0 ? (placeholder || "Type + press Enter...") : ""}
        style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#d4d4d8", fontFamily: "'Inter', sans-serif", minWidth: 140 }} />
    </div>
  );
}

/* --- AIDrawerWidget ------------------------------------------- */
function AIDrawerWidget({ onApply, onClose }: { onApply: (text: string) => void; onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [generating, setGenerating] = useState(false);

  const CHIPS = ["Make professional", "Make concise", "Add technical detail", "Fix grammar"];
  const SAMPLES = [
    "Passionate ECE and Data Science student building AI-powered IoT systems. Experienced with edge computing, computer vision using YOLO11n, and full-stack development with FastAPI and React.",
    "Final-year ECE student specializing in AI/IoT integration. Building real-time computer vision pipelines and intelligent embedded systems at the intersection of hardware and software.",
  ];

  function generate(instruction: string) {
    setGenerating(true);
    setResponse("");
    const text = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      setResponse(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setGenerating(false); }
    }, 30);
  }

  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20, background: "#09090b", borderTop: "1px solid #27272a", borderRadius: "16px 16px 0 0", boxShadow: "0 -8px 32px rgba(0,0,0,0.5)" }}>
      <div style={{ width: 32, height: 4, background: "#3f3f46", borderRadius: 9999, margin: "12px auto 16px" }} />
      <div style={{ padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color="#a855f7" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>AI Assistant</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", display: "flex" }}><X size={16} /></button>
      </div>
      <div style={{ padding: "0 20px", display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {CHIPS.map((c) => (
          <button key={c} onClick={() => generate(c)} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 9999, padding: "6px 12px", fontSize: 11, color: "#a1a1aa", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 150ms" }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ padding: "0 20px", display: "flex", gap: 8, marginBottom: response ? 16 : 20 }}>
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && prompt.trim() && generate(prompt)}
          placeholder="Custom instruction..." style={{ ...S.input, flex: 1, margin: 0 }} />
        <button onClick={() => prompt.trim() && generate(prompt)} style={{ background: "#7c3aed", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}>
          <ArrowRight size={14} />
        </button>
      </div>
      {response && (
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ background: "rgba(24,24,27,0.6)", border: "1px solid #27272a", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#a855f7", marginBottom: 8 }}>AI Draft</div>
            <p style={{ fontSize: 13, color: "#d4d4d8", lineHeight: 1.6, margin: 0 }}>{response}{generating && <span style={{ animation: "blink 1s step-end infinite" }}>|</span>}</p>
            {!generating && (
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => { onApply(response); onClose(); }} style={{ background: "rgba(5,46,22,0.8)", border: "1px solid rgba(22,101,52,0.5)", color: "#4ade80", fontSize: 11, fontWeight: 500, padding: "6px 16px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif" }}>
                  <Check size={12} /> Apply to field
                </button>
                <button onClick={onClose} style={{ background: "#18181b", border: "1px solid #27272a", color: "#71717a", fontSize: 11, padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  Discard
                </button>
              </div>
            )}
          </div>5OLPO
        </div>
      )}
    </motion.div>
  );
}

/* --- ProfilePage ------------------------------------------- */
export function ProfilePage({ initialData, onSave }: { initialData: any; onSave: (data: any) => Promise<void> }) {
  const [name, setName] = useState(initialData?.name || "");
  const [title, setTitle] = useState(initialData?.descriptor || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [institution, setInstitution] = useState(initialData?.education?.institution || "");
  const [degree, setDegree] = useState(initialData?.education?.degree || "");
  const [duration, setDuration] = useState(initialData?.education?.duration || "");
  const [gpa, setGpa] = useState(initialData?.education?.gpa || "");
  const [location, setLocation] = useState(initialData?.education?.location || "");
  const [workingWith, setWorkingWith] = useState<string[]>(initialData?.currentlyWorkingWith || []);
  const [links, setLinks] = useState<SocialLink[]>(() => {
    return (initialData?.socials || []).map((s: any, idx: number) => {
      let plat = s.label.toLowerCase();
      if (plat === "email") plat = "mail";
      if (plat !== "github" && plat !== "linkedin" && plat !== "mail" && plat !== "globe") {
        plat = "globe";
      }
      return {
        id: String(idx),
        platform: plat as SocialLink["platform"],
        url: s.href.startsWith("mailto:") ? s.href.slice(7) : s.href
      };
    });
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiProposedBio, setAiProposedBio] = useState("");
  const [enforcingTone, setEnforcingTone] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const PLATFORM_ICONS: Record<string, React.ReactNode> = {
    github: <Github size={16} color="#a1a1aa" />,
    linkedin: <Linkedin size={16} color="#a1a1aa" />,
    mail: <Mail size={16} color="#a1a1aa" />,
    globe: <Globe size={16} color="#a1a1aa" />,
  };

  function addLink() {
    setLinks([...links, { id: Date.now().toString(), platform: "github", url: "" }]);
  }
  function updateLink(id: string, key: keyof SocialLink, val: string) {
    setLinks(links.map((l) => l.id === id ? { ...l, [key]: val } : l));
  }
  function deleteLink(id: string) {
    setLinks(links.filter((l) => l.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    const socialsJson = links.map((l) => ({
      label: l.platform === "mail" ? "EMAIL" : l.platform.toUpperCase(),
      href: l.platform === "mail" && !l.url.startsWith("mailto:") ? `mailto:${l.url}` : l.url
    }));

    const payload = {
      name,
      descriptor: title,
      tagline,
      socials: socialsJson,
      education: {
        degree,
        institution,
        location,
        duration,
        gpa,
        gpaMax: "10.0"
      },
      currentlyWorkingWith: workingWith,
      tickerItems: initialData?.tickerItems || [],
      bio
    };

    try {
      await onSave(payload);
      setSaved(true);
      toast.success("Profile saved successfully");
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      toast.error("Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleToneEnforce() {
    setEnforcingTone(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: "Rewrite to be more professional", 
          context: bio, 
          type: "tone" 
        }),
      });
      
      if (!response.ok) throw new Error("Failed to generate");
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let completeText = "";
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                completeText += JSON.parse(line.substring(2));
              } catch (e) {}
            }
          }
        }
      }
      setAiProposedBio(completeText);
      setShowDiff(true);
    } catch (e) {
      toast.error("AI Generation Failed");
    } finally {
      setEnforcingTone(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#09090b", fontFamily: "'Inter', sans-serif" }}>

      {/* Top Bar */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1f1f22", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#fafafa", marginBottom: 4 }}>Profile & Bio</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#71717a" }}>
            <span>Your identity in</span>
            <span style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 4, padding: "2px 8px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#a1a1aa" }}>profile.json</span>
          </div>
        </div>
        <button onClick={handleSave}
          style={{ background: saved ? "#166534" : "#3b82f6", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 200ms", boxShadow: "0 0 16px rgba(59,130,246,0.3)", fontFamily: "'Inter', sans-serif" }}>
          {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* SECTION 1 — Identity */}
          <div style={{ ...S.sectionHeader, marginTop: 0 }}>
            <div style={S.numBadge}>01</div>
            <span style={S.sectionLabel}>Identity</span>
            <div style={S.sectionLine} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={S.label}>Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} style={S.input} />
              </div>
              <div>
                <label style={S.label}>Title / Role</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} style={S.input} />
              </div>
              <div>
                <label style={S.label}>Tagline</label>
                <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2} style={{ ...S.textarea, minHeight: 64 }} />
              </div>
            </div>
            {/* Avatar */}
            <div style={{ width: 140, flexShrink: 0 }}>
              <label style={S.label}>Photo</label>
              <div onClick={() => fileRef.current?.click()} style={{ width: 140, height: 140, borderRadius: 16, background: "#18181b", border: "2px dashed #3f3f46", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative", transition: "border-color 200ms" }}>
                {avatarUrl ? (
                  <>
                    <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 200ms" }} className="avatar-overlay">
                      <Camera size={20} color="#fff" />
                      <span style={{ fontSize: 11, color: "#fff", marginTop: 6 }}>Change</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={20} color="#52525b" />
                    <span style={{ fontSize: 11, color: "#52525b", marginTop: 8, textAlign: "center" }}>Upload photo</span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setAvatarUrl(URL.createObjectURL(f));
              }} />
            </div>
          </div>

          {/* SECTION 2 — Bio */}
          <div style={{ ...S.sectionHeader, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <div style={S.numBadge}>02</div>
              <span style={S.sectionLabel}>Bio / About</span>
              <div style={S.sectionLine} />
            </div>
            {!showDiff && (
              <button 
                onClick={handleToneEnforce} 
                disabled={enforcingTone}
                style={{ background: "rgba(39,39,42,0.8)", border: "1px solid rgba(63,63,70,0.5)", borderRadius: 6, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, color: enforcingTone ? "#a1a1aa" : "#a855f7", cursor: enforcingTone ? "not-allowed" : "pointer", backdropFilter: "blur(8px)", fontFamily: "'Inter', sans-serif", marginLeft: 12, flexShrink: 0 }}
              >
                <Sparkles size={12} /> {enforcingTone ? "Generating..." : "Enforce Tone"}
              </button>
            )}
          </div>
          <div style={{ position: "relative" }}>
            {showDiff ? (
              <DiffAcceptor 
                originalText={bio}
                proposedText={aiProposedBio}
                onAccept={() => {
                  setBio(aiProposedBio);
                  setShowDiff(false);
                  toast.success("AI Bio Accepted");
                }}
                onReject={() => setShowDiff(false)}
              />
            ) : (
              <>
                <FloatingAIPrompt onApply={(text) => {
                  setBio(text);
                  toast.success("AI edit applied!");
                }} />
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} style={{ ...S.textarea, minHeight: 160 }} placeholder="Write your bio..." />
              </>
            )}
          </div>
          <p style={{ fontSize: 11, color: "#52525b", marginTop: 8 }}>This appears in the About section of your portfolio. Select text for inline AI actions.</p>

          {/* SECTION 3 — Education */}
          <div style={S.sectionHeader}>
            <div style={S.numBadge}>03</div>
            <span style={S.sectionLabel}>Education</span>
            <div style={S.sectionLine} />
          </div>
          <div style={{ background: "rgba(24,24,27,0.4)", border: "1px solid #27272a", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={S.label}>Institution</label>
                <input value={institution} onChange={(e) => setInstitution(e.target.value)} style={S.input} />
              </div>
              <div>
                <label style={S.label}>Duration</label>
                <input value={duration} onChange={(e) => setDuration(e.target.value)} style={S.input} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "end" }}>
              <div>
                <label style={S.label}>Degree / Program</label>
                <input value={degree} onChange={(e) => setDegree(e.target.value)} style={S.input} />
              </div>
              <div>
                <label style={S.label}>GPA</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input value={gpa} onChange={(e) => setGpa(e.target.value)} style={{ ...S.input, width: 64, textAlign: "center" }} />
                  <span style={{ fontSize: 12, color: "#52525b", whiteSpace: "nowrap" }}>/ 10.0</span>
                </div>
              </div>
            </div>
            <div>
              <label style={S.label}>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} style={S.input} />
            </div>
          </div>

          {/* SECTION 4 — Social Links */}
          <div style={S.sectionHeader}>
            <div style={S.numBadge}>04</div>
            <span style={S.sectionLabel}>Social Links</span>
            <div style={S.sectionLine} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {links.map((link) => (
              <div key={link.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, background: "#18181b", border: "1px solid #27272a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {PLATFORM_ICONS[link.platform]}
                </div>
                <select value={link.platform} onChange={(e) => updateLink(link.id, "platform", e.target.value as SocialLink["platform"])}
                  style={{ ...S.input, width: 120, appearance: "none", cursor: "pointer" }}>
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="mail">Email</option>
                  <option value="globe">Website</option>
                </select>
                <input value={link.url} onChange={(e) => updateLink(link.id, "url", e.target.value)} placeholder="https://..." style={{ ...S.input, flex: 1 }} />
                <button onClick={() => deleteLink(link.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", padding: 4, display: "flex", transition: "color 150ms" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={addLink} style={{ width: "100%", border: "1px dashed #27272a", borderRadius: 12, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: "#52525b", cursor: "pointer", background: "none", fontFamily: "'Inter', sans-serif", transition: "all 200ms" }}>
              <Plus size={14} /> Add Link
            </button>
          </div>

          {/* SECTION 5 — Currently Working With */}
          <div style={S.sectionHeader}>
            <div style={S.numBadge}>05</div>
            <span style={S.sectionLabel}>Currently Working With</span>
            <div style={S.sectionLine} />
          </div>
          <TagInput tags={workingWith} onChange={setWorkingWith} placeholder="Type + press Enter to add tech..." />

          <div style={{ height: 40 }} />
        </div>
      </div>
    </motion.div>
  );
}
