import React, { useState, useRef, useEffect } from "react";
import { Eye, Sparkles } from "lucide-react";
import { useMakeStore } from "../../store/makeStore";
import { StudioAiSidebar } from "./make/StudioAiSidebar";
import { StudioBrowserBar } from "./make/StudioBrowserBar";
import { StudioCanvas } from "./make/StudioCanvas";
import { StudioRightInspector } from "./make/StudioRightInspector";
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
  const [rawCode, setRawCode] = useState<string>("");
  const [isCodeView, setIsCodeView] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [mobileTab, setMobileTab] = useState<"ai" | "canvas" | "inspector">("ai");

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
      }
      if (event.data?.type === "FIGMA_AUDIT_REPORT") {
        setAuditReport(event.data.payload);
        setIsAuditing(false);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  /* ─── Actions ────────────────────────────────────────────────── */

  function handleNavigatePath(path: string) {
    setCurrentPath(path);
    if (iframeRef.current) {
      iframeRef.current.src = `http://localhost:4321${path === "/" ? "" : path}`;
    }
  }

  function handleReload() {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }

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
      handleReload();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "bot",
          content: `Done! I've updated the "${targetSection}" section. Review the preview on the right canvas.`,
        },
      ]);
      setGenerationState("result");
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
        handleReload();
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
      handleReload();
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
          handleReload();
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
      handleReload();
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
      handleReload();
    }
  }

  return (
    <div className="cms-viewport-fill flex h-[100dvh] w-[100dvw] bg-[#1E1E1E] text-zinc-100 font-sans overflow-hidden select-none">
      {/* Mobile Tab Switcher (< md screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-10 bg-[#1E1E1E] border-b border-white/10 flex items-center justify-around z-50 text-xs">
        <button
          onClick={() => setMobileTab("ai")}
          className={`py-1 px-3 rounded-md font-semibold ${mobileTab === "ai" ? "bg-[#0D99FF] text-white" : "text-zinc-400"}`}
        >
          AI Chat
        </button>
        <button
          onClick={() => setMobileTab("canvas")}
          className={`py-1 px-3 rounded-md font-semibold ${mobileTab === "canvas" ? "bg-[#0D99FF] text-white" : "text-zinc-400"}`}
        >
          Canvas
        </button>
        <button
          onClick={() => setMobileTab("inspector")}
          className={`py-1 px-3 rounded-md font-semibold ${mobileTab === "inspector" ? "bg-[#0D99FF] text-white" : "text-zinc-400"}`}
        >
          Inspector
        </button>
      </div>

      {/* 1. Left Column: AI Conversation Sidebar (Exact Figma Make Layout) */}
      <div className={`md:flex h-full shrink-0 ${mobileTab === "ai" ? "flex flex-1 w-full pt-10 md:pt-0" : "hidden"}`}>
        <StudioAiSidebar
          onBack={onBack}
          targetSection={targetSection}
          onSelectTargetSection={setTargetSection}
          startGeneration={startGeneration}
          handleRevert={handleRevert}
          handleAccept={handleAccept}
          handleDiscard={handleDiscard}
        />
      </div>

      {/* 2. Right Main Area: Browser Bar + Live Canvas + Slide-out Inspector */}
      <div className={`md:flex flex-1 flex-col h-full overflow-hidden relative ${mobileTab === "canvas" ? "flex pt-10 md:pt-0" : mobileTab === "inspector" ? "hidden" : "hidden md:flex"}`}>
        {/* Top Browser Navigation Bar with URL input */}
        <StudioBrowserBar
          currentPath={currentPath}
          onNavigatePath={handleNavigatePath}
          onReload={handleReload}
          isCodeView={isCodeView}
          setIsCodeView={setIsCodeView}
          handleSaveCode={handleSaveCode}
        />

        {/* Center Live Canvas Workspace */}
        <div className="flex-1 flex relative overflow-hidden">
          <StudioCanvas
            iframeRef={iframeRef}
            selectedFigmaElement={selectedFigmaElement}
            isCodeView={isCodeView}
            rawCode={rawCode}
            setRawCode={setRawCode}
            handleSaveCode={handleSaveCode}
          />

          {/* Slide-out Right Inspector Panel (Preserving extra design features) */}
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

      {/* Mobile Inspector View */}
      {mobileTab === "inspector" && (
        <div className="md:hidden flex flex-1 w-full h-full pt-10">
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
      )}
    </div>
  );
}
