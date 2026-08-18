import { useState, useEffect, useCallback } from "react";
import { Mail, RefreshCw, Search, Send, ExternalLink, Check, Archive, Plus, ArrowRight, Sparkles, Code, Inbox } from "lucide-react";
import { toast } from "sonner";

interface MailEntry {
  id: string;
  question: string;
  country: string;
  time: string;
  exact: string;
  status: "unreviewed" | "in-review" | "resolved";
  likelyCategory: string;
  type?: "chatbot_unmatched_query" | "contact_form" | string;
  lastActiveProject?: string;
  email?: string;
  name?: string;
}

export function FormspreeMailsScreen() {
  const [mails, setMails] = useState<MailEntry[]>([]);
  const [selectedMail, setSelectedMail] = useState<MailEntry | null>(null);
  const [filter, setFilter] = useState<"all" | "unmatched" | "contact" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Email reply state
  const [replyBody, setReplyBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Raw Email Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawEmailText, setRawEmailText] = useState("");

  const saveQueries = async (updated: MailEntry[]) => {
    try {
      await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updated }),
      });
    } catch (e) {
      console.error("Failed to save mails", e);
    }
  };

  const fetchMails = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/queries");
      if (res.ok) {
        const json = await res.json();
        const items: MailEntry[] = Array.isArray(json) ? json : (json.data && Array.isArray(json.data)) ? json.data : [];
        
        // Filter Formspree / Chatbot query entries
        setMails(items);
        if (items.length > 0 && !selectedMail) {
          setSelectedMail(items[0]);
        }
        if (isManual) toast.success("Formspree Mails Synced", { description: `Loaded ${items.length} messages.` });
      }
    } catch (e) {
      console.error("Failed to fetch mails", e);
    } finally {
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [selectedMail]);

  useEffect(() => {
    fetchMails();
  }, [fetchMails]);

  useEffect(() => {
    if (selectedMail) {
      setReplyBody(`Hi ${selectedMail.name || 'there'},\n\nThank you for reaching out via our portfolio regarding: "${selectedMail.question}".\n\nBest regards,\nS V Lalitkishore\nhttps://lalitkishore.is-a.dev`);
    }
  }, [selectedMail]);

  function handleSelectMail(mail: MailEntry) {
    setSelectedMail(mail);
    if (mail.status === "unreviewed") {
      const updated = mails.map((m) => m.id === mail.id ? { ...m, status: "in-review" as const } : m);
      setMails(updated);
      saveQueries(updated);
    }
  }

  async function handleArchiveMail() {
    if (!selectedMail) return;
    const updated = mails.map((m) => m.id === selectedMail.id ? { ...m, status: "resolved" as const } : m);
    setMails(updated);
    await saveQueries(updated);
    toast.success("Mail marked as resolved");
  }

  async function handleSendReply() {
    if (!selectedMail) return;
    const recipient = selectedMail.email;
    if (!recipient) {
      toast.error("No recipient email specified", { description: "Use 'Open Mail App' or specify email." });
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          subject: `Re: Portfolio Inquiry regarding "${selectedMail.question.slice(0, 30)}..."`,
          message: replyBody,
          queryId: selectedMail.id,
          userQuery: selectedMail.question,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Email sent successfully to ${recipient}!`);
        const updated = mails.map((m) => m.id === selectedMail.id ? { ...m, status: "resolved" as const } : m);
        setMails(updated);
        await saveQueries(updated);
      } else if (json.fallbackMailto) {
        const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(`Re: Portfolio Inquiry`)}&body=${encodeURIComponent(replyBody)}`;
        window.open(mailtoUrl, "_blank");
        toast.info("Opened default email application");
      } else {
        toast.error(json.error || "Failed to send email");
      }
    } catch (e) {
      toast.error("Error sending email");
    } finally {
      setSendingEmail(false);
    }
  }

  function handleImportRawEmail() {
    if (!rawEmailText.trim()) return;

    // Parse Formspree email text (e.g. type, query, lastActiveProject, timestamp, email)
    const typeMatch = rawEmailText.match(/type\s*\n\s*([^\n]+)/i);
    const queryMatch = rawEmailText.match(/query\s*\n\s*([^\n]+)/i);
    const projectMatch = rawEmailText.match(/lastActiveProject\s*\n\s*([^\n]+)/i);
    const timeMatch = rawEmailText.match(/timestamp\s*\n\s*([^\n]+)/i);
    const emailMatch = rawEmailText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const nameMatch = rawEmailText.match(/name\s*\n\s*([^\n]+)/i);

    const questionVal = queryMatch ? queryMatch[1].trim() : rawEmailText.trim().slice(0, 100);
    const typeVal = typeMatch ? typeMatch[1].trim() : "chatbot_unmatched_query";
    const projVal = projectMatch ? projectMatch[1].trim() : "none";
    const exactVal = timeMatch ? timeMatch[1].trim() : new Date().toISOString();
    const emailVal = emailMatch ? emailMatch[1] : undefined;
    const nameVal = nameMatch ? nameMatch[1].trim() : undefined;

    const newMail: MailEntry = {
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

    const updated = [newMail, ...mails];
    setMails(updated);
    saveQueries(updated);
    setSelectedMail(newMail);
    setRawEmailText("");
    setShowImportModal(false);
    toast.success("Formspree submission imported successfully!");
  }

  const filteredMails = mails.filter((m) => {
    let matchFilter = true;
    if (filter === "unmatched") matchFilter = m.type === "chatbot_unmatched_query" || m.status !== "resolved";
    else if (filter === "contact") matchFilter = m.type === "contact_form" || Boolean(m.email);
    else if (filter === "resolved") matchFilter = m.status === "resolved";

    const matchSearch = !search || m.question.toLowerCase().includes(search.toLowerCase()) || (m.email && m.email.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const unreviewedCount = mails.filter((m) => m.status === "unreviewed").length;

  return (
    <div style={{ flex: 1, width: "100%", paddingTop: 60, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header */}
      <div style={{ height: 56, padding: "0 24px", borderBottom: "1px solid #1f1f22", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Inbox size={18} style={{ color: "#c084fc" }} />
          <span style={{ color: "#fafafa", fontSize: 17, fontWeight: 600 }}>Formspree Mails &amp; Inbox</span>
          <span style={{ color: "#71717a", fontSize: 12, marginLeft: 8 }}>{unreviewedCount} unread submissions</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            onClick={() => fetchMails(true)}
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
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-purple-400" : "text-gray-400"} />
            <span>{isRefreshing ? "Syncing..." : "Sync Formspree"}</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="cms-mobile-stack" style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Column: Mail Inbox List */}
        <div className="cms-mobile-full" style={{ width: 400, minWidth: 320, maxWidth: 460, borderRight: "1px solid #1f1f22", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          {/* Filters */}
          <div style={{ height: 48, padding: "0 14px", borderBottom: "1px solid #1f1f22", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 4, flex: 1 }}>
              {(["all", "unmatched", "contact", "resolved"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    padding: "4px 8px",
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid ${filter === tab ? "#c084fc" : "transparent"}`,
                    color: filter === tab ? "#fafafa" : "#71717a",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: filter === tab ? 600 : 400,
                    textTransform: "capitalize",
                  }}
                >
                  {tab === "unmatched" ? "Unmatched" : tab === "contact" ? "Form Mails" : tab}
                </button>
              ))}
            </div>
            <div style={{ position: "relative", width: 120 }}>
              <Search size={11} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#71717a" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mail..."
                style={{ width: "100%", padding: "5px 8px 5px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid #27272a", borderRadius: 6, color: "#fafafa", fontSize: 11, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* List items */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredMails.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#71717a", fontSize: 13 }}>No Formspree messages found.</div>
            ) : (
              filteredMails.map((m) => {
                const isSelected = selectedMail?.id === m.id;
                const isUnmatched = m.type === "chatbot_unmatched_query";
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMail(m)}
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid #1f1f22",
                      borderLeft: `3px solid ${isSelected ? "#c084fc" : "transparent"}`,
                      background: isSelected ? "rgba(192,132,252,0.05)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, padding: "2px 6px", background: isUnmatched ? "rgba(59,130,246,0.1)" : "rgba(167,139,250,0.1)", color: isUnmatched ? "#60a5fa" : "#c084fc", borderRadius: 4, fontWeight: 600 }}>
                        {isUnmatched ? "Chatbot Unmatched" : "Formspree Mail"}
                      </span>
                      <span style={{ fontSize: 10, color: m.status === "resolved" ? "#34d399" : "#f59e0b" }}>
                        {m.status === "resolved" ? "Resolved" : "Unread"}
                      </span>
                    </div>

                    <div style={{ color: "#fafafa", fontSize: 13, fontWeight: 500, lineHeight: "20px", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.question}
                    </div>

                    <div style={{ fontSize: 11, color: "#71717a" }}>
                      {m.email ? `${m.name || 'Visitor'} (${m.email})` : `${m.country} · ${m.time}`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Mail Inspector & Email Sender */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selectedMail ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a", fontSize: 14 }}>
              Select a Formspree message from the list
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
                <div style={{ maxWidth: 880, margin: "0 auto" }}>
                  {/* Mail Overview Banner */}
                  <div style={{ marginBottom: 24, background: "rgba(255,255,255,0.02)", border: "1px solid #27272a", borderRadius: 12, padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ color: "#c084fc", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {selectedMail.type === "chatbot_unmatched_query" ? "Formspree Chatbot Unmatched Query" : "Formspree Contact Form Mail"}
                      </span>
                      <span style={{ fontSize: 11, color: "#71717a" }}>{selectedMail.exact || selectedMail.time}</span>
                    </div>

                    <div style={{ color: "#fafafa", fontSize: 18, fontWeight: 600, lineHeight: "28px", marginBottom: 12 }}>
                      {selectedMail.question}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#a1a1aa" }}>
                      <div>Sender: <strong style={{ color: "#fafafa" }}>{selectedMail.name || 'Anonymous Visitor'}</strong></div>
                      <div>Recipient Email: <strong style={{ color: "#c084fc" }}>{selectedMail.email || 'None provided'}</strong></div>
                      <div>Target Project: <strong style={{ color: "#fafafa" }}>{selectedMail.likelyCategory || selectedMail.lastActiveProject || 'General'}</strong></div>
                      <div>Status: <strong style={{ color: selectedMail.status === 'resolved' ? '#34d399' : '#f59e0b' }}>{selectedMail.status.toUpperCase()}</strong></div>
                    </div>
                  </div>

                  {/* Reply Composer */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ color: "#a1a1aa", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                      Reply Message (Sent via SMTP or Default Email Client)
                    </div>
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={9}
                      style={{ width: "100%", minHeight: 200, padding: "14px 16px", background: "#18181b", border: "1px solid #27272a", borderRadius: 10, color: "#fafafa", fontSize: 13, lineHeight: "22px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ padding: "16px 32px", borderTop: "1px solid #1f1f22", background: "#09090b", display: "flex", justifyContent: "flex-end", gap: 12, flexShrink: 0 }}>
                <button
                  onClick={handleArchiveMail}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "transparent", border: "1px solid #27272a", borderRadius: 8, color: "#a1a1aa", cursor: "pointer", fontSize: 13 }}
                  className="hover:text-white"
                >
                  <Archive size={14} />
                  Mark as Resolved
                </button>

                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedMail.email || '')}&su=${encodeURIComponent(`Re: Portfolio Inquiry regarding "${selectedMail.question.slice(0, 30)}..."`)}&body=${encodeURIComponent(replyBody)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "rgba(219,68,85,0.1)", border: "1px solid rgba(219,68,85,0.3)", borderRadius: 8, color: "#ea4335", textDecoration: "none", fontSize: 13, fontWeight: 500 }}
                  className="hover:bg-red-500/20"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"/></svg>
                  <span>Open in Gmail</span>
                </a>

                <a
                  href={`mailto:${selectedMail.email || ''}?subject=${encodeURIComponent(`Re: Portfolio Inquiry regarding "${selectedMail.question.slice(0, 30)}..."`)}&body=${encodeURIComponent(replyBody)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "transparent", border: "1px solid #27272a", borderRadius: 8, color: "#a1a1aa", textDecoration: "none", fontSize: 13 }}
                  className="hover:text-white"
                >
                  <ExternalLink size={14} />
                  Open Mail App
                </a>

                <button
                  onClick={handleSendReply}
                  disabled={sendingEmail}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "#9333ea", border: "1px solid #a855f7", borderRadius: 8, color: "#ffffff", cursor: sendingEmail ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  {sendingEmail ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  {sendingEmail ? "Sending..." : "Send Direct Email"}
                </button>
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
