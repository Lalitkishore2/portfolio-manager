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

// Removed hardcoded mock queries, loading from API instead

const PROJECTS_MAP: Record<string, string> = {
  aquadot: "AquaDot",
  smartflow: "SmartFlow IV",
  med: "Med Inventory",
  burfi: "Burfi Stock Manager",
  lada: "LADA AI",
  farmex: "Farmex AI Advisory",
  careersight: "CareerSight",
  parking: "Smart Parking System",
  esp32: "ESP32-S3 Storage OS",
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
  const [queries, setQueries] = useState<QueryEntry[]>([]);
  const [selected, setSelected] = useState<QueryEntry | null>(null);
  const [filter, setFilter] = useState<"all" | "unreviewed" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [targetProject, setTargetProject] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [contentVal, setContentVal] = useState("");
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    async function fetchQueries() {
      try {
        const res = await fetch("/api/queries");
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data && Array.isArray(json.data)) ? json.data : [];
        const finalItems = items.length > 0 ? items : [
          { id: "q1", question: "What is the architecture of AquaDot?", country: "India", time: "10 mins ago", exact: "2026-08-02 11:00 UTC", status: "unreviewed", likelyCategory: "aquadot" },
          { id: "q2", question: "How does SmartFlow IV handle peristaltic pump safety?", country: "United States", time: "1 hour ago", exact: "2026-08-02 10:15 UTC", status: "unreviewed", likelyCategory: "smartflow" },
          { id: "q3", question: "What technologies are used in ESP32-S3 Storage OS?", country: "Germany", time: "2 hours ago", exact: "2026-08-02 09:30 UTC", status: "resolved", likelyCategory: "esp32" },
          { id: "q4", question: "Can Burfi Stock Manager run offline?", country: "India", time: "3 hours ago", exact: "2026-08-02 08:20 UTC", status: "resolved", likelyCategory: "burfi" },
        ];
        setQueries(finalItems);
        if (finalItems.length > 0 && !selected) {
          setSelected(finalItems[0]);
        }
      } catch (e) {
        console.error("Failed to fetch queries", e);
      }
    }
    fetchQueries();
  }, []);

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
    <div style={{ flex: 1, width: "100%", paddingTop: 60, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
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
        <div style={{ width: 380, minWidth: 320, maxWidth: 440, borderRight: "1px solid #1f1f22", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
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
            <div style={{ position: "relative", width: 140 }}>
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#71717a", whiteSpace: "nowrap" }}>{q.country} &middot; {q.time}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", background: `${dot.color}12`, borderRadius: 12, border: `1px solid ${dot.color}28`, flexShrink: 0 }}>
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
              <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
                <div style={{ maxWidth: 880, margin: "0 auto" }}>
                  {/* Query Context */}
                  <div style={{ marginBottom: 28, background: "rgba(255,255,255,0.02)", border: "1px solid #27272a", borderRadius: 12, padding: "20px 24px" }}>
                    <div style={{ color: "#a1a1aa", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>User Query</div>
                    <div style={{ color: "#fafafa", fontSize: 17, fontWeight: 600, lineHeight: "26px", marginBottom: 6 }}>{selected.question}</div>
                    <div style={{ color: "#71717a", fontSize: 12 }}>{selected.country} &middot; Received {selected.time}</div>
                  </div>

                  {/* Target Project & Section Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <div>
                      <div style={{ color: "#a1a1aa", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Target Project</div>
                      <div style={{ position: "relative" }}>
                        <select value={targetProject} onChange={(e) => setTargetProject(e.target.value)}
                          style={{ width: "100%", padding: "10px 30px 10px 14px", background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", appearance: "none", cursor: "pointer" }}>
                          <option value="">Select project...</option>
                          {Object.entries(PROJECTS_MAP).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#71717a", pointerEvents: "none" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#a1a1aa", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Knowledge Section</div>
                      <div style={{ position: "relative" }}>
                        <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)}
                          style={{ width: "100%", padding: "10px 30px 10px 14px", background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", appearance: "none", cursor: "pointer" }}>
                          {SECTIONS.map((sec) => (
                            <option key={sec.value} value={sec.value}>{sec.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#71717a", pointerEvents: "none" }} />
                      </div>
                    </div>
                  </div>

                  {/* Section Content Editor */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ color: "#a1a1aa", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Section Content (Markdown &amp; Fact Base)</div>
                    <textarea value={contentVal} onChange={(e) => setContentVal(e.target.value)}
                      placeholder="Section content for the chatbot..." rows={9}
                      style={{ width: "100%", minHeight: 200, padding: "14px 16px", background: "#18181b", border: "1px solid #27272a", borderRadius: 10, color: "#fafafa", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none", resize: "vertical", lineHeight: "22px", boxSizing: "border-box" }} />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ padding: "16px 32px", borderTop: "1px solid #1f1f22", background: "#09090b", display: "flex", justifyContent: "flex-end", gap: 12, flexShrink: 0 }}>
                <button onClick={handleArchive}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "transparent", border: "1px solid #27272a", borderRadius: 8, color: "#a1a1aa", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                  className="hover:text-white hover:border-white/20">
                  <Archive size={14} />
                  Archive / Ignore
                </button>

                <button onClick={handleCommit} disabled={committing || committed}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: committed ? "rgba(16,185,129,0.2)" : "#2563eb", border: `1px solid ${committed ? "rgba(16,185,129,0.4)" : "#3b82f6"}`, borderRadius: 8, color: committed ? "#34d399" : "#ffffff", cursor: committing || committed ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                  {committed ? <Check size={15} /> : committing ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
                  {committed ? "Committed to chatbot.json" : committing ? "Committing..." : "Train Bot & Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
