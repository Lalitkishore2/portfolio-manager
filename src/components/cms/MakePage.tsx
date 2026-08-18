import React, { useState, useRef, useEffect } from "react";
import { Eye, Sparkles } from "lucide-react";
import { useMakeStore } from "../../store/makeStore";
import { StudioTopBar } from "./make/StudioTopBar";
import { StudioLeftTree } from "./make/StudioLeftTree";
import { StudioCanvas } from "./make/StudioCanvas";
import { StudioRightInspector } from "./make/StudioRightInspector";
import { StudioStatusBar } from "./make/StudioStatusBar";
import { FigmaElement } from "./make/types";

interface MakePageProps {
  onBack: () => void;
}

export function MakePage({ onBack }: MakePageProps) {
  // Store state
  const {
    siteDocument, setSiteDocument,
    selectedNodeId, setSelectedNodeId,
    versions, currentVersionId, addVersion, revertToVersion,
    generationState, setGenerationState,
    promptText, setPromptText,
    provider,
    setMessages,
    setGhostDiff,
    setAuditReport, setIsAuditing,
    setRightOpen, setInspectTab,
    isInspectEnabled,
    pendingImage, setPendingImage
  } = useMakeStore();

  // Local state
  const [targetSection, setTargetSection] = useState<string>("projects");
  const [selectedFigmaElement, setSelectedFigmaElement] = useState<FigmaElement | null>(null);
  const [layerNodes, setLayerNodes] = useState<string[]>([]);
  const [rawCode, setRawCode] = useState<string>("");
  const [mobileTab, setMobileTab] = useState<"preview" | "editor">("preview");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* ─── Fetch Initial Site Data ───────────────────────────────── */

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    async function fetchAll() {
      try {
        const [pr, pf, sk, ex, cb, tk] = await Promise.all([
          fetch("/api/projects"), fetch("/api/profile"),
          fetch("/api/skills"), fetch("/api/experience"),
          fetch("/api/chatbot"), fetch("/api/tokens")
        ]);
        const doc = {
          projects: (await pr.json()).data || [],
          profile: (await pf.json()).data || {},
          skills: (await sk.json()).data || [],
          experience: (await ex.json()).data || [],
          chatbot: (await cb.json()).data || {},
          tokens: (await tk.json()).data || {}
        };
        setSiteDocument(doc);
        if (useMakeStore.getState().versions.length === 0) {
          addVersion("Initial Baseline", doc);
        }
      } catch (e) { console.error("Failed to fetch site document", e); }
    }
    fetchAll();
  }, []);

  /* ─── Synchronize Raw Code Output ────────────────────────────── */

  useEffect(() => {
    if (!siteDocument) return;
    if (selectedNodeId) {
      const [section, idOrIndex] = selectedNodeId.split(".");
      const data = siteDocument[section];
      if (data) {
        let nodeData: any = null;
        if (Array.isArray(data)) {
          nodeData = idOrIndex ? data.find((item: any, i: number) => item.slug === idOrIndex || i.toString() === idOrIndex) : data;
        } else {
          nodeData = idOrIndex ? data[idOrIndex] : data;
        }
        if (nodeData) { setRawCode(JSON.stringify(nodeData, null, 2)); return; }
        setRawCode(JSON.stringify(data, null, 2)); return;
      } else {
        setRawCode(JSON.stringify({ _type: "layout_node", _message: "This node does not have associated CMS data." }, null, 2));
        return;
      }
    }
    setRawCode(JSON.stringify(siteDocument, null, 2));
  }, [selectedNodeId, siteDocument]);

  /* ─── Global Keyboard Shortcuts Listener ─────────────────────── */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const state = useMakeStore.getState();
        const idx = state.versions.findIndex((v) => v.id === state.currentVersionId);
        if (idx > 0) handleRevert(state.versions[idx - 1]);
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        const state = useMakeStore.getState();
        const idx = state.versions.findIndex((v) => v.id === state.currentVersionId);
        if (idx !== -1 && idx < state.versions.length - 1) handleRevert(state.versions[idx + 1]);
      }
      // Deselect on Escape
      if (e.key === "Escape") {
        setSelectedNodeId(null);
        setSelectedFigmaElement(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ─── Iframe PostMessage Event Listener ──────────────────────── */

  useEffect(() => {
    function onMsg(event: MessageEvent) {
      if (event.data?.type === "FIGMA_ELEMENT_SELECTED") {
        const payload = event.data.payload as FigmaElement;
        setSelectedFigmaElement(payload);
        if (payload.nodeId) setSelectedNodeId(payload.nodeId);
        setRightOpen(true);
        setInspectTab("properties");
      }
      if (event.data?.type === "FIGMA_NODE_LIST") {
        setLayerNodes(event.data.payload || []);
      }
      if (event.data?.type === "FIGMA_AUDIT_REPORT") {
        setAuditReport(event.data.payload);
        setIsAuditing(false);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_INSPECT_TOGGLE", payload: isInspectEnabled }, "*");
  }, [isInspectEnabled]);

  /* ─── Actions ────────────────────────────────────────────────── */

  async function runAudit() {
    setIsAuditing(true);
    iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_RUN_AUDIT" }, "*");
  }

  async function startGeneration() {
    if (!promptText.trim() || generationState === "generating") return;
    const userPrompt = promptText.trim();
    setPromptText("");
    setGenerationState("generating");
    setGhostDiff(null);

    const userMsgId = crypto.randomUUID();
    const imagePayload = pendingImage;
    setMessages((prev) => [...prev, { id: userMsgId, type: "user", content: userPrompt, image: imagePayload || undefined }]);
    setPendingImage(null);

    const reasoningId = crypto.randomUUID();
    const steps = [
      `Reading ${targetSection} data schema…`,
      "Understanding design intent…",
      "Generating JSON patch…",
      "Validating schema…",
    ];
    setMessages((prev) => [
      ...prev,
      { id: reasoningId, type: "reasoning", label: `Make AI (${provider})`, expanded: true, steps: [steps[0]] },
    ]);

    let si = 1;
    const interval = setInterval(() => {
      if (si < steps.length) {
        setMessages((prev) => prev.map((m) => m.id === reasoningId ? { ...m, steps: steps.slice(0, si + 1) } : m));
        si++;
      } else clearInterval(interval);
    }, 600);

    try {
      const before = JSON.parse(JSON.stringify(siteDocument[targetSection] || {}));
      const res = await fetch("/api/make", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, provider, targetSection, selectedNodeId, image: imagePayload }),
      });

      clearInterval(interval);
      if (!res.ok) throw new Error(await res.text() || "API failed");

      const result = await res.json();
      const after = result.patch;

      setGhostDiff({ before, after });
      const newDoc = { ...siteDocument, [targetSection]: after };
      setSiteDocument(newDoc);
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "bot",
          content: `Done! I've proposed updates to "${targetSection}". Review the live preview on the canvas and accept or discard.`,
        },
      ]);
      setGenerationState("result");
      setRightOpen(true);
      setInspectTab("chat");
    } catch (err: any) {
      clearInterval(interval);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), type: "error", content: err?.message || "Something went wrong." }]);
      setGenerationState("idle");
    }
  }

  async function handleSaveCode() {
    try {
      const parsed = JSON.parse(rawCode);
      const section = selectedNodeId ? selectedNodeId.split(".")[0] : targetSection;
      let updatedSection = siteDocument[section];
      if (selectedNodeId) {
        const [_, idOrIndex] = selectedNodeId.split(".");
        updatedSection = JSON.parse(JSON.stringify(updatedSection));
        if (Array.isArray(updatedSection)) {
          const idx = updatedSection.findIndex((item: any, i: number) => item.slug === idOrIndex || i.toString() === idOrIndex);
          if (idx !== -1) updatedSection[idx] = { ...updatedSection[idx], ...parsed };
        } else {
          if (idOrIndex) updatedSection[idOrIndex] = parsed;
          else updatedSection = { ...updatedSection, ...parsed };
        }
      } else {
        updatedSection = parsed[section] || parsed;
      }
      const res = await fetch(`/api/${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSection),
      });
      if (res.ok) {
        const newDoc = { ...siteDocument, [section]: updatedSection };
        addVersion("Manual Code Edit", newDoc);
        setSiteDocument(newDoc);
        if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
      }
    } catch { alert("Invalid JSON"); }
  }

  async function handleRevert(v: any) {
    try {
      const sections = Object.keys(v.data);
      await Promise.all(sections.map(async (section) => {
        await fetch(`/api/${section}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v.data[section]),
        });
      }));
      revertToVersion(v.id);
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    } catch (e) { console.error(e); }
  }

  async function handleAccept() {
    try {
      const st = useMakeStore.getState();
      const after = st.ghostDiff?.after;
      if (after) {
        const res = await fetch(`/api/${targetSection}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(after),
        });
        if (res.ok) {
          const newDoc = { ...siteDocument, [targetSection]: after };
          addVersion(`AI: ${targetSection} update`, newDoc);
          setGhostDiff(null);
          setGenerationState("idle");
          if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
        }
      }
    } catch (e) { console.error(e); }
  }

  async function handleDiscard() {
    const st = useMakeStore.getState();
    const before = st.ghostDiff?.before;
    if (before) {
      const newDoc = { ...siteDocument, [targetSection]: before };
      setSiteDocument(newDoc);
      setGhostDiff(null);
      setGenerationState("idle");
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    }
  }

  async function saveContentEdits(patch: any, fieldName?: string) {
    if (!selectedNodeId) return;
    const [section, idOrIndex] = selectedNodeId.split(".");
    let updatedSection = JSON.parse(JSON.stringify(siteDocument[section] || {}));
    if (Array.isArray(updatedSection)) {
      const idx = updatedSection.findIndex((item: any, i: number) => item.slug === idOrIndex || i.toString() === idOrIndex);
      if (idx !== -1) updatedSection[idx] = { ...updatedSection[idx], ...patch };
    } else {
      if (idOrIndex) updatedSection[idOrIndex] = { ...updatedSection[idOrIndex], ...patch };
      else updatedSection = { ...updatedSection, ...patch };
    }
    const res = await fetch(`/api/${section}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSection),
    });
    if (res.ok) {
      const newDoc = { ...siteDocument, [section]: updatedSection };
      addVersion(`Edit ${selectedNodeId}`, newDoc);
      setSiteDocument(newDoc);
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    }
  }

  return (
    <div className="cms-viewport-fill flex flex-col h-[100dvh] w-[100dvw] bg-[#1E1E1E] text-zinc-100 font-sans overflow-hidden select-none">
      {/* 1. Studio Top Command Bar */}
      <StudioTopBar
        onBack={onBack}
        targetSection={targetSection}
        onSelectTargetSection={setTargetSection}
        handleSaveCode={handleSaveCode}
      />

      {/* Mobile Tab Switcher (< md screens) */}
      <div className="md:hidden flex items-center justify-center gap-2 p-2 border-b border-white/[0.08] bg-[#1E1E1E] shrink-0">
        <button
          onClick={() => setMobileTab("preview")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 12px",
            background: mobileTab === "preview" ? "#0D99FF" : "transparent",
            border: mobileTab === "preview" ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: mobileTab === "preview" ? "#ffffff" : "#a1a1aa",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Eye size={14} />
          <span>Canvas View</span>
        </button>

        <button
          onClick={() => setMobileTab("editor")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 12px",
            background: mobileTab === "editor" ? "#9333ea" : "transparent",
            border: mobileTab === "editor" ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: mobileTab === "editor" ? "#ffffff" : "#a1a1aa",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Sparkles size={14} />
          <span>Studio Inspector</span>
        </button>
      </div>

      {/* 2. Main Studio Body Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop View / Mobile Conditional View */}
        <div className={`md:flex flex-1 h-full w-full relative overflow-hidden ${mobileTab === "preview" ? "flex" : "hidden"}`}>
          {/* Left Layers & Pages Tree */}
          <StudioLeftTree
            layerNodes={layerNodes}
            iframeRef={iframeRef}
          />

          {/* Dynamic Figma Zoom Canvas */}
          <StudioCanvas
            iframeRef={iframeRef}
            selectedFigmaElement={selectedFigmaElement}
            startGeneration={startGeneration}
            targetSection={targetSection}
          />
        </div>

        {/* Right Inspector Dock */}
        <div className={`md:flex h-full shrink-0 ${mobileTab === "editor" ? "flex flex-1 w-full" : "hidden"}`}>
          <StudioRightInspector
            iframeRef={iframeRef}
            selectedFigmaElement={selectedFigmaElement}
            setSelectedFigmaElement={setSelectedFigmaElement}
            saveContentEdits={saveContentEdits}
            rawCode={rawCode}
            setRawCode={setRawCode}
            handleSaveCode={handleSaveCode}
            handleRevert={handleRevert}
            handleAccept={handleAccept}
            handleDiscard={handleDiscard}
            runAudit={runAudit}
            startGeneration={startGeneration}
          />
        </div>
      </div>

      {/* 3. Studio Minimal Status Bar */}
      <StudioStatusBar />
    </div>
  );
}
