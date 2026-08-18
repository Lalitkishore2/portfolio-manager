import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ChevronDown, Search, Check, Archive, Save, Mail, Send, Bot, MessageSquare, ExternalLink, Sparkles, Plus } from "lucide-react";
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
  type?: "chatbot_unmatched_query" | "contact_form" | "direct_mail" | string;
  lastActiveProject?: string;
  email?: string;
  name?: string;
}

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
  { value: "", label: "None (General Message / FAQ)" },
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

const TYPE_TAGS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  chatbot_unmatched_query: { label: "Chatbot Unmatched", bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  contact_form: { label: "Contact Form Mail", bg: "rgba(167,139,250,0.1)", color: "#c084fc", border: "rgba(167,139,250,0.25)" },
  direct_mail: { label: "Direct Email", bg: "rgba(16,185,129,0.1)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
};

export function ChatbotAuditorScreen({ chatbotData, onSave }: { chatbotData: any; onSave: (data: any) => Promise<void> }) {
  const [queries, setQueries] = useState<QueryEntry[]>([]);
  const [selected, setSelected] = useState<QueryEntry | null>(null);
  const [filter, setFilter] = useState<"all" | "unmatched" | "contact" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [targetProject, setTargetProject] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [contentVal, setContentVal] = useState("");
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Email reply & import state
  const [activeTab, setActiveTab] = useState<"knowledge" | "email">("knowledge");
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawEmailText, setRawEmailText] = useState("");
  const [syncingFormspree, setSyncingFormspree] = useState(false);

  async function handleSyncFormspree() {
    setSyncingFormspree(true);
    try {
      const res = await fetch("/api/formspree");
      const json = await res.json();
      if (json.success) {
        toast.success("Formspree API Synced", {
          description: json.addedCount > 0 ? `Imported ${json.addedCount} new submissions!` : "No new submissions found.",
        });
        await fetchQueries(true);
      } else if (json.hasApiKey === false) {
        toast.info("Formspree API Key Not Configured", {
          description: "Formspree emails automatically sync via your Gmail Apps Script every 5 minutes!",
        });
      } else {
        toast.error(json.error || "Failed to sync Formspree API");
      }
    } catch (e) {
      toast.error("Error syncing Formspree API");
    } finally {
      setSyncingFormspree(false);
    }
  }

  function handleImportRawEmail() {
    if (!rawEmailText.trim()) return;

    const typeMatch = rawEmailText.match(/type\s*\n\s*([^\n]+)/i);
    const queryMatch = rawEmailText.match(/query\s*\n\s*([^\n]+)/i);
    const projectMatch = rawEmailText.match(/lastActiveProject\s*\n\s*([^\n]+)/i);
    const timeMatch = rawEmailText.match(/timestamp\s*\n\s*([^\n]+)/i);
    const emailMatch = rawEmailText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const nameMatch = rawEmailText.match(/name\s*\n\s*([^\n]+)/i);

    const questionVal = queryMatch ? queryMatch[1].trim() : rawEmailText.trim().slice(0, 100);
    const typeVal = typeMatch ? typeMatch[1].trim() : "chatbot_unmatched_query";
    const projVal = projectMatch ? projectMatch[1].trim() : "general";
    const exactVal = timeMatch ? timeMatch[1].trim() : new Date().toISOString();
    const emailVal = emailMatch ? emailMatch[1] : undefined;
    const nameVal = nameMatch ? nameMatch[1].trim() : undefined;

    const newQuery: QueryEntry = {
      id: `q_imported_${Date.now()}`,
      question: questionVal,
      country: "Formspree Email",
      time: "Just imported",
      exact: exactVal,
      status: "unreviewed",
      likelyCategory: projVal,
      type: typeVal,
      lastActiveProject: projVal,
      email: emailVal,
      name: nameVal,
    };

    const updated = [newQuery, ...queries];
    setQueries(updated);
    saveQueries(updated);
    setSelected(newQuery);
    setRawEmailText("");
    setShowImportModal(false);
    toast.success("Formspree submission imported successfully!");
  }

  const saveQueries = async (updated: QueryEntry[]) => {
    try {
      await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updated }),
      });
    } catch (e) {
      console.error("Failed to persist queries to /api/queries", e);
    }
  };

  const fetchQueries = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/queries");
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data && Array.isArray(json.data)) ? json.data : [];
        setQueries(items);
        if (items.length > 0 && !selected) {
          setSelected(items[0]);
        }
        if (isManual) toast.success("Queries Refreshed", { description: "Synced with queries.json" });
      }
    } catch (e) {
      console.error("Failed to fetch queries", e);
    } finally {
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [selected]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  useEffect(() => {
    if (selected) {
      const categoryKey = selected.likelyCategory || selected.lastActiveProject || "";
      if (PROJECTS_MAP[categoryKey]) {
        setTargetProject(categoryKey);
      } else {
        setTargetProject("");
      }
      setTargetSection("techStack");
      setReplyMessage(`Hi ${selected.name || 'there'},\n\nThank you for getting in touch regarding your question: "${selected.question}".\n\nBest regards,\nS V Lalitkishore`);
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
    if (q.status === "unreviewed") {
      const updated = queries.map((e) => e.id === q.id ? { ...e, status: "in-review" as const } : e);
      setQueries(updated);
      saveQueries(updated);
    }
  }

  async function handleCommit() {
    setCommitting(true);
    
    try {
      const updatedData = JSON.parse(JSON.stringify(chatbotData || {}));
      
      if (targetProject && targetSection && contentVal) {
        if (!updatedData.projects) {
          updatedData.projects = {};
        }
        if (!updatedData.projects[targetProject]) {
          updatedData.projects[targetProject] = {};
        }
        updatedData.projects[targetProject][targetSection] = contentVal;
        await onSave(updatedData);
      } else if (contentVal) {
        if (!updatedData.generalCustomKnowledge) {
          updatedData.generalCustomKnowledge = [];
        }
        updatedData.generalCustomKnowledge.push({
          question: selected?.question || "",
          answer: contentVal,
          timestamp: new Date().toISOString(),
        });
        await onSave(updatedData);
      }

      const updatedQueries = queries.map((q) => q.id === selected?.id ? { ...q, status: "resolved" as const } : q);
      setQueries(updatedQueries);
      await saveQueries(updatedQueries);

      setCommitting(false);
      setCommitted(true);
      toast.success("Query resolved & saved successfully!");
    } catch (e) {
      toast.error("Failed to commit changes");
      setCommitting(false);
    }
  }

  async function handleArchive() {
    if (!selected) return;
    const updatedQueries = queries.map((q) => q.id === selected.id ? { ...q, status: "resolved" as const } : q);
    setQueries(updatedQueries);
    await saveQueries(updatedQueries);
    setSelected(null);
    toast("Query archived", { description: "Marked as resolved in queries.json." });
  }

  async function handleSendEmailReply() {
    if (!selected) return;
    const recipientEmail = selected.email;
    if (!recipientEmail) {
      toast.error("No recipient email address associated with this query.", {
        description: "Click 'Open in Mail App' or add an email address.",
      });
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          subject: `Re: Portfolio Inquiry regarding "${selected.question.slice(0, 30)}..."`,
          message: replyMessage,
          queryId: selected.id,
          userQuery: selected.question,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Email sent successfully to ${recipientEmail}!`);
        // Mark query as resolved
        const updatedQueries = queries.map((q) => q.id === selected.id ? { ...q, status: "resolved" as const } : q);
        setQueries(updatedQueries);
        await saveQueries(updatedQueries);
      } else if (json.fallbackMailto) {
        // Fallback to mailto link
        const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(`Re: Portfolio Inquiry`)}&body=${encodeURIComponent(replyMessage)}`;
        window.open(mailtoUrl, "_blank");
        toast.info("Opened default email application", { description: json.message });
      } else {
        toast.error(json.error || "Failed to send email reply");
      }
    } catch (e) {
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  }

  const filtered = queries.filter((q) => {
    let matchFilter = true;
    if (filter === "unmatched") {
      matchFilter = q.type === "chatbot_unmatched_query" || q.status !== "resolved";
    } else if (filter === "contact") {
      matchFilter = q.type === "contact_form" || Boolean(q.email);
    } else if (filter === "resolved") {
      matchFilter = q.status === "resolved";
    }
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase()) || (q.email && q.email.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const unreviewedCount = queries.filter((q) => q.status === "unreviewed").length;

  return (
    <div style={{ flex: 1, width: "100%", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
      {/* Page header */}
      <div style={{ minHeight: 56, padding: "12px 24px", borderBottom: "1px solid #1f1f22", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Bot size={18} style={{ color: "#3b82f6" }} />
          <span style={{ color: "#fafafa", fontSize: 17, fontWeight: 600 }}>Auditor &amp; Mail Center</span>
          <span style={{ color: "#71717a", fontSize: 12, marginLeft: 4 }}>{unreviewedCount} unresolved items</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "rgba(192,132,252,0.1)",
              border: "1px solid rgba(192,132,252,0.25)",
              borderRadius: 8,
              color: "#c084fc",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Plus size={14} />
            <span>Import Formspree Email</span>
          </button>

          <button
            onClick={handleSyncFormspree}
            disabled={syncingFormspree}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--cms-border-glass)",
              borderRadius: 8,
              color: "var(--cms-text-primary)",
              fontSize: 12,
              fontWeight: 500,
              cursor: syncingFormspree ? "default" : "pointer",
            }}
          >
            <RefreshCw size={13} className={syncingFormspree ? "animate-spin text-purple-400" : "text-gray-400"} />
            <span>{syncingFormspree ? "Syncing..." : "Sync Formspree"}</span>
          </button>

          <button
            onClick={() => fetchQueries(true)}
            disabled={isRefreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--cms-border-glass)",
              borderRadius: 8,
              color: "var(--cms-text-primary)",
              fontSize: 12,
              fontWeight: 500,
              cursor: isRefreshing ? "default" : "pointer",
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-blue-400" : "text-gray-400"} />
            <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Two-column body */}
      <div className="cms-mobile-stack" style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Query & Mail list */}
        <div className="cms-mobile-full" style={{ width: 400, minWidth: 320, maxWidth: 460, borderRight: "1px solid #1f1f22", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          {/* Filter Bar */}
          <div style={{ minHeight: 48, padding: "8px 14px", borderBottom: "1px solid #1f1f22", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
            <div className="no-scrollbar" style={{ display: "flex", gap: 4, flex: 1, overflowX: "auto", minWidth: 200 }}>
              {(["all", "unmatched", "contact", "resolved"] as const).map((tab) => (
                <button key={tab} onClick={() => setFilter(tab)}
                  style={{ padding: "5px 10px", background: filter === tab ? "rgba(59,130,246,0.1)" : "transparent", border: `1px solid ${filter === tab ? "rgba(59,130,246,0.3)" : "transparent"}`, borderRadius: 6, color: filter === tab ? "#60a5fa" : "#71717a", cursor: "pointer", fontSize: 11, fontWeight: filter === tab ? 600 : 400, fontFamily: "'Inter', sans-serif", textTransform: "capitalize", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {tab === "unmatched" ? "Unmatched" : tab === "contact" ? "Form Mails" : tab}
                </button>
              ))}
            </div>
            <div style={{ position: "relative", width: 130, flexShrink: 0 }}>
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
              const typeTag = TYPE_TAGS[q.type || "chatbot_unmatched_query"] || TYPE_TAGS["chatbot_unmatched_query"];
              const isSelected = selected?.id === q.id;
              return (
                <div key={q.id} onClick={() => selectQuery(q)}
                  style={{ padding: "14px 16px", borderBottom: "1px solid #1f1f22", borderLeft: `3px solid ${isSelected ? "#3b82f6" : "transparent"}`, background: isSelected ? "rgba(59,130,246,0.05)" : "transparent", cursor: "pointer" }}>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, padding: "2px 6px", background: typeTag.bg, color: typeTag.color, border: `1px solid ${typeTag.border}`, borderRadius: 4, fontWeight: 600 }}>
                      {typeTag.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", background: `${dot.color}12`, borderRadius: 12, border: `1px solid ${dot.color}28`, flexShrink: 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot.color, display: "inline-block" }} />
                      <span style={{ fontSize: 10, color: dot.color }}>{dot.label}</span>
                    </div>
                  </div>

                  <div style={{ color: "#fafafa", fontSize: 13, lineHeight: "20px", marginBottom: 6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {q.question}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#71717a", whiteSpace: "nowrap" }}>
                      {q.email ? `${q.name || 'Visitor'} (${q.email})` : `${q.country} · ${q.time}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Auditor & Mail Action Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a", fontSize: 14, fontStyle: "italic" }}>
              Select a query or email entry to start auditing or replying
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Header Tabs: Knowledge Trainer vs Email Reply */}
              <div style={{ padding: "12px 32px 0", borderBottom: "1px solid #1f1f22", background: "#09090b", display: "flex", gap: 16 }}>
                <button
                  onClick={() => setActiveTab("knowledge")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px 12px",
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid ${activeTab === "knowledge" ? "#3b82f6" : "transparent"}`,
                    color: activeTab === "knowledge" ? "#fafafa" : "#71717a",
                    fontSize: 13,
                    fontWeight: activeTab === "knowledge" ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  <Bot size={15} style={{ color: activeTab === "knowledge" ? "#3b82f6" : "#71717a" }} />
                  <span>Train Bot Knowledge</span>
                </button>

                <button
                  onClick={() => setActiveTab("email")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px 12px",
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid ${activeTab === "email" ? "#c084fc" : "transparent"}`,
                    color: activeTab === "email" ? "#fafafa" : "#71717a",
                    fontSize: 13,
                    fontWeight: activeTab === "email" ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  <Mail size={15} style={{ color: activeTab === "email" ? "#c084fc" : "#71717a" }} />
                  <span>Reply via Email</span>
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
                <div style={{ maxWidth: 880, margin: "0 auto" }}>
                  {/* Selected Query Context Box */}
                  <div style={{ marginBottom: 24, background: "rgba(255,255,255,0.02)", border: "1px solid #27272a", borderRadius: 12, padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "#a1a1aa", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {selected.type === "contact_form" ? "Formspree Contact Mail" : "Chatbot Unmatched Query"}
                      </span>
                      <span style={{ fontSize: 11, color: "#71717a" }}>{selected.exact || selected.time}</span>
                    </div>

                    <div style={{ color: "#fafafa", fontSize: 17, fontWeight: 600, lineHeight: "26px", marginBottom: 8 }}>
                      {selected.question}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, color: "#71717a", fontSize: 12, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                      <div>Location: <strong style={{ color: "#fafafa" }}>{selected.country}</strong></div>
                      <div>Category/Project: <strong style={{ color: "#fafafa" }}>{selected.likelyCategory || selected.lastActiveProject || 'General'}</strong></div>
                      {selected.email && <div>From: <strong style={{ color: "#c084fc" }}>{selected.name ? `${selected.name} (${selected.email})` : selected.email}</strong></div>}
                    </div>
                  </div>

                  {activeTab === "knowledge" ? (
                    /* Knowledge Trainer View */
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                        <div>
                          <div style={{ color: "#a1a1aa", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Target Project <span style={{ color: "#71717a", fontWeight: 400 }}>(Optional)</span></div>
                          <div style={{ position: "relative" }}>
                            <select value={targetProject} onChange={(e) => setTargetProject(e.target.value)}
                              style={{ width: "100%", padding: "10px 30px 10px 14px", background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", appearance: "none", cursor: "pointer" }}>
                              <option value="">None (General Message / FAQ)</option>
                              {Object.entries(PROJECTS_MAP).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#71717a", pointerEvents: "none" }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#a1a1aa", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Knowledge Section <span style={{ color: "#71717a", fontWeight: 400 }}>(Optional)</span></div>
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

                      <div style={{ marginBottom: 24 }}>
                        <div style={{ color: "#a1a1aa", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Section Content (Markdown &amp; Fact Base)</div>
                        <textarea value={contentVal} onChange={(e) => setContentVal(e.target.value)}
                          placeholder="Section content for the chatbot..." rows={9}
                          style={{ width: "100%", minHeight: 200, padding: "14px 16px", background: "#18181b", border: "1px solid #27272a", borderRadius: 10, color: "#fafafa", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none", resize: "vertical", lineHeight: "22px", boxSizing: "border-box" }} />
                      </div>
                    </div>
                  ) : (
                    /* Email Reply Composer View */
                    <div>
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ color: "#a1a1aa", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Recipient Email</div>
                        <input
                          value={selected.email || ""}
                          onChange={(e) => setSelected({ ...selected, email: e.target.value })}
                          placeholder="visitor@example.com"
                          style={{ width: "100%", padding: "10px 14px", background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                        />
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <div style={{ color: "#a1a1aa", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Reply Body</div>
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          rows={8}
                          placeholder="Type your response message..."
                          style={{ width: "100%", minHeight: 180, padding: "14px 16px", background: "#18181b", border: "1px solid #27272a", borderRadius: 10, color: "#fafafa", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", lineHeight: "22px", boxSizing: "border-box" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ padding: "16px 32px", borderTop: "1px solid #1f1f22", background: "#09090b", display: "flex", justifyContent: "flex-end", gap: 12, flexShrink: 0 }}>
                {activeTab === "knowledge" ? (
                  <>
                    <button onClick={handleArchive}
                      style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "transparent", border: "1px solid #27272a", borderRadius: 8, color: "#a1a1aa", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                      className="hover:text-white hover:border-white/20">
                      <Archive size={14} />
                      Archive / Ignore
                    </button>

                    <button onClick={handleCommit} disabled={committing || committed}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: committed ? "rgba(16,185,129,0.2)" : "#2563eb", border: `1px solid ${committed ? "rgba(16,185,129,0.4)" : "#3b82f6"}`, borderRadius: 8, color: committed ? "#34d399" : "#ffffff", cursor: committing || committed ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                      {committed ? <Check size={15} /> : committing ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
                      {committed ? "Committed & Saved" : committing ? "Committing..." : "Train Bot & Save Changes"}
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selected.email || '')}&su=${encodeURIComponent(`Re: Portfolio Inquiry regarding "${selected.question.slice(0, 30)}..."`)}&body=${encodeURIComponent(replyMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "rgba(219,68,85,0.1)", border: "1px solid rgba(219,68,85,0.3)", borderRadius: 8, color: "#ea4335", textDecoration: "none", fontSize: 13, fontWeight: 500 }}
                      className="hover:bg-red-500/20"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"/></svg>
                      <span>Open in Gmail</span>
                    </a>

                    <a
                      href={`mailto:${selected.email || ''}?subject=${encodeURIComponent(`Re: Portfolio Inquiry regarding "${selected.question.slice(0, 30)}..."`)}&body=${encodeURIComponent(replyMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "transparent", border: "1px solid #27272a", borderRadius: 8, color: "#a1a1aa", textDecoration: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                      className="hover:text-white hover:border-white/20"
                    >
                      <ExternalLink size={14} />
                      Open Mail App
                    </a>

                    <button
                      onClick={handleSendEmailReply}
                      disabled={sendingEmail}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "#9333ea", border: "1px solid #a855f7", borderRadius: 8, color: "#ffffff", cursor: sendingEmail ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}
                    >
                      {sendingEmail ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                      {sendingEmail ? "Sending..." : "Send Direct Email"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Email Import Modal */}
      {showImportModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 540, background: "#111113", border: "1px solid #27272a", borderRadius: 14, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.8)" }}>
            <h3 style={{ color: "#fafafa", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Import Formspree Email Text</h3>
            <p style={{ color: "#71717a", fontSize: 12, margin: "0 0 16px" }}>
              Paste raw text from a Formspree email notification (e.g. type: chatbot_unmatched_query, query: ...). It will be parsed into a clean entry.
            </p>

            <textarea
              value={rawEmailText}
              onChange={(e) => setRawEmailText(e.target.value)}
              placeholder={`Paste Formspree email content here:\n\ntype\nchatbot_unmatched_query\n\nquery\nHow do you handle pump safety?\n\nlastActiveProject\nsmartflow`}
              rows={8}
              style={{ width: "100%", padding: "12px", background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", outline: "none", marginBottom: 16, boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowImportModal(false)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #27272a", borderRadius: 8, color: "#a1a1aa", fontSize: 12, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleImportRawEmail} style={{ padding: "8px 20px", background: "#9333ea", border: "1px solid #a855f7", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Import Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
