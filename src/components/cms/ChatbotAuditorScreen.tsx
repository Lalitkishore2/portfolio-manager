import { useState, useEffect } from "react";
import { RefreshCw, ChevronDown, Search, Wand2, Check, Archive, Save } from "lucide-react";
import { toast } from "sonner";

/* --- Types ---------------------------------------------------- */
type QueryStatus = "unreviewed" | "in-review" | "resolved";

interface QueryEntry {
  id: string;
  question: string;
  country: string;
  time: string;
  exact: string;
  status: QueryStatus;
  likelyCategory: string;
}

const INITIAL_MOCK_QUERIES: QueryEntry[] = [
  { id: "q1", question: "What microcontroller did you use in SmartFlow IV?", country: "IN", time: "12h ago", exact: "Jun 15 2026, 02:31 UTC", status: "unreviewed", likelyCategory: "smartflow" },
  { id: "q2", question: "How did you achieve 94% anomaly detection accuracy in AquaDot?", country: "US", time: "1d ago", exact: "Jun 14 2026, 14:10 UTC", status: "unreviewed", likelyCategory: "aquadot" },
  { id: "q3", question: "Are you open to full-time roles outside India?", country: "DE", time: "2d ago", exact: "Jun 13 2026, 09:55 UTC", status: "unreviewed", likelyCategory: "general" },
  { id: "q4", question: "What dataset did you use to train LADA AI?", country: "US", time: "3d ago", exact: "Jun 12 2026, 17:43 UTC", status: "in-review", likelyCategory: "lada" },
  { id: "q5", question: "How does CareerSight handle privacy of uploaded resumes?", country: "CA", time: "4d ago", exact: "Jun 11 2026, 11:22 UTC", status: "unreviewed", likelyCategory: "careersight" },
];

const PROJECTS_MAP: Record<string, string> = {
  aquadot: "AquaDot",
  smartflow: "SmartFlow IV",
  med: "Med Inventory",
  burfi: "Burfi Stock Manager",
  lada: "LADA AI",
  farmex: "Farmex AI Advisory",
  careersight: "CareerSight",
  parking: "Smart Parking System",
};

const SECTIONS = [
  { value: "overview", label: "Overview" },
  { value: "problem", label: "Problem" },
  { value: "solution", label: "Solution" },
  { value: "architecture", label: "Architecture" },
  { value: "techStack", label: "Tech Stack" },
  { value: "outcomes", label: "Outcomes" },
  { value: "role", label: "My Role" },
];

const STATUS_DOT: Record<QueryStatus, { color: string; label: string }> = {
  unreviewed: { color: "#f59e0b", label: "Unreviewed" },
  "in-review": { color: "var(--cms-accent-cobalt)", label: "In Review" },
  resolved: { color: "var(--cms-accent-emerald)", label: "Resolved" },
};

export function ChatbotAuditorScreen({ chatbotData, onSave }: { chatbotData: any; onSave: (data: any) => Promise<void> }) {
  const [queries, setQueries] = useState<QueryEntry[]>(INITIAL_MOCK_QUERIES);
  const [selected, setSelected] = useState<QueryEntry | null>(null);
  const [filter, setFilter] = useState<"all" | "unreviewed" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [targetProject, setTargetProject] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [contentVal, setContentVal] = useState("");
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    if (selected) {
      if (PROJECTS_MAP[selected.likelyCategory]) {
        setTargetProject(selected.likelyCategory);
      } else {
        setTargetProject("");
      }
      setTargetSection("techStack");
    }
  }, [selected]);

  useEffect(() => {
    if (targetProject && targetSection && chatbotData?.projects?.[targetProject]) {
      setContentVal(chatbotData.projects[targetProject][targetSection] || "");
    } else {
      setContentVal("");
    }
  }, [targetProject, targetSection, chatbotData]);

  function selectQuery(q: QueryEntry) {
    setSelected(q);
    setCommitted(false);
    setQueries((prev) =>
      prev.map((e) => e.id === q.id && e.status === "unreviewed" ? { ...e, status: "in-review" } : e)
    );
  }

  async function handleCommit() {
    if (!targetProject || !targetSection) {
      toast.error("Please select a target project and section to update.");
      return;
    }
    setCommitting(true);
    
    // Deep clone chatbotData
    const updatedData = JSON.parse(JSON.stringify(chatbotData));
    if (!updatedData.projects[targetProject]) {
      updatedData.projects[targetProject] = {};
    }
    updatedData.projects[targetProject][targetSection] = contentVal;

    try {
      await onSave(updatedData);
      setCommitting(false);
      setCommitted(true);
      setQueries((prev) =>
        prev.map((q) => q.id === selected?.id ? { ...q, status: "resolved" } : q)
      );
      toast.success("Chatbot Knowledge updated successfully!");
    } catch (e) {
      toast.error("Failed to commit knowledge changes");
      setCommitting(false);
    }
  }

  function handleArchive() {
    if (!selected) return;
    setQueries((prev) => prev.map((q) => q.id === selected.id ? { ...q, status: "resolved" } : q));
    setSelected(null);
    toast("Query archived", { description: "Marked as resolved." });
  }

  const filtered = queries.filter((q) => {
    const matchFilter = filter === "all" || (filter === "unreviewed" ? q.status !== "resolved" : q.status === "resolved");
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const unreviewedCount = queries.filter((q) => q.status === "unreviewed").length;

  return (
    <div style={{ paddingTop: 60, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
      {/* Page header */}
      <div style={{ height: 56, padding: "0 24px", borderBottom: "1px solid #1f1f22", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <span style={{ color: "#fafafa", fontSize: 17, fontWeight: 600 }}>Chatbot Auditor</span>
          <span style={{ color: "#71717a", fontSize: 12, marginLeft: 12 }}>{unreviewedCount} unresolved query</span>
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Query list */}
        <div style={{ width: "45%", borderRight: "1px solid #1f1f22", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* List header */}
          <div style={{ height: 48, padding: "0 16px", borderBottom: "1px solid #1f1f22", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 2, flex: 1 }}>
              {(["all", "unreviewed", "resolved"] as const).map((tab) => (
                <button key={tab} onClick={() => setFilter(tab)}
                  style={{ padding: "4px 10px", background: "transparent", border: "none", borderBottom: `2px solid ${filter === tab ? "#3b82f6" : "transparent"}`, color: filter === tab ? "#fafafa" : "#71717a", cursor: "pointer", fontSize: 12, fontWeight: filter === tab ? 500 : 400, fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ position: "relative", width: 160 }}>
              <Search size={11} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#71717a" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                style={{ width: "100%", padding: "5px 8px 5px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid #27272a", borderRadius: 6, color: "#fafafa", fontSize: 11, fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Query cards */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: "#71717a", fontSize: 13 }}>No queries match this filter.</div>
            )}
            {filtered.map((q) => {
              const dot = STATUS_DOT[q.status];
              const isSelected = selected?.id === q.id;
              return (
                <div key={q.id} onClick={() => selectQuery(q)}
                  style={{ padding: "14px 16px", borderBottom: "1px solid #1f1f22", borderLeft: `3px solid ${isSelected ? "#3b82f6" : "transparent"}`, background: isSelected ? "rgba(59,130,246,0.05)" : "transparent", cursor: "pointer" }}>
                  <div style={{ color: "#fafafa", fontSize: 13, lineHeight: "20px", marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {q.question}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "#71717a" }}>{q.country}</span>
                    <span style={{ fontSize: 12, color: "#71717a" }}>{q.time}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto", padding: "2px 8px", background: `${dot.color}12`, borderRadius: 12, border: `1px solid ${dot.color}28` }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot.color, display: "inline-block" }} />
                      <span style={{ fontSize: 11, color: dot.color }}>{dot.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Knowledge Trainer */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a", fontSize: 14, fontStyle: "italic" }}>
              Select a query to start training
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                {/* Query Context */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: "#a1a1aa", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>User Asked</div>
                  <div style={{ color: "#fafafa", fontSize: 16, fontWeight: 600, lineHeight: "24px", marginBottom: 10 }}>{selected.question}</div>
                </div>

                {/* Target Project */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ color: "#a1a1aa", fontSize: 12, marginBottom: 6 }}>Target Project</div>
                  <div style={{ position: "relative" }}>
                    <select value={targetProject} onChange={(e) => setTargetProject(e.target.value)}
                      style={{ width: "100%", padding: "9px 30px 9px 12px", background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", appearance: "none", cursor: "pointer" }}>
                      <option value="">Select project...</option>
                      {Object.entries(PROJECTS_MAP).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#71717a", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Target Section */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ color: "#a1a1aa", fontSize: 12, marginBottom: 6 }}>Target Knowledge Section</div>
                  <div style={{ position: "relative" }}>
                    <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)}
                      style={{ width: "100%", padding: "9px 30px 9px 12px", background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", appearance: "none", cursor: "pointer" }}>
                      {SECTIONS.map((sec) => (
                        <option key={sec.value} value={sec.value}>{sec.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#71717a", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Section Content Editor */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ color: "#a1a1aa", fontSize: 12, marginBottom: 6 }}>Section Content</div>
                  <textarea value={contentVal} onChange={(e) => setContentVal(e.target.value)}
                    placeholder="Section content for the chatbot..." rows={8}
                    style={{ width: "100%", minHeight: 180, padding: "10px 12px", background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", lineHeight: "21px", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid #1f1f22", background: "#09090b", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                <button onClick={handleCommit} disabled={committing || committed}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "11px", background: committed ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)", border: `1px solid ${committed ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.3)"}`, borderRadius: 8, color: committed ? "#10b981" : "#3b82f6", cursor: committing || committed ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: "all 300ms" }}>
                  {committed ? <Check size={14} /> : committing ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
                  {committed ? "Committed to chatbot.json" : committing ? "Committing..." : "Train Bot & Save Changes"}
                </button>

                <button onClick={handleArchive}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "9px", background: "transparent", border: "1px solid #27272a", borderRadius: 8, color: "#71717a", cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", transition: "color 150ms, border-color 150ms" }}
                  className="hover:text-white hover:border-white/20">
                  <Archive size={13} />
                  Archive / Ignore
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
