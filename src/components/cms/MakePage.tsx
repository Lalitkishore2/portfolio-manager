import React, { useState, useRef, useEffect } from "react";
import { useMakeStore } from "../../store/makeStore";
import { TopToolbar } from "./make/TopToolbar";
import { LeftDock } from "./make/LeftDock";
import { CanvasZone } from "./make/CanvasZone";
import { RightDock, FigmaElement } from "./make/RightDock";
import { AiMakeBar } from "./make/AiMakeBar";
import { StatusBar } from "./make/StatusBar";
import { SlideOverPanel } from "./make/SlideOverPanel";

interface MakePageProps {
  onBack: () => void;
}

function breadcrumbFromElement(el: FigmaElement | null): string[] {
  if (!el) return [];
  return ["Canvas", ...el.path.split(" > ").slice(-3).map(p => {
    let clean = p.split(".")[0];
    if (clean === "div" || clean === "section" || clean === "span" || clean === "h1" || clean === "h2" || clean === "p" || clean === "a") {
      clean = p.split(".")[1] || clean;
    }
    return clean.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  })];
}

export function MakePage({ onBack }: MakePageProps) {
  // Store
  const {
    siteDocument, setSiteDocument,
    selectedNodeId, setSelectedNodeId,
    versions, currentVersionId, addVersion, revertToVersion,
    generationState, setGenerationState,
    promptText, setPromptText,
    provider,
    chatOpen, setChatOpen, setMessages,
    setGhostDiff,
    setAuditReport, setIsAuditing,
    setRightOpen, setInspectTab,
    isInspectEnabled,
    pendingImage, setPendingImage
  } = useMakeStore();

  // Local state for things that don't need to be in the store
  const targetSection = selectedNodeId ? selectedNodeId.split('.')[0] : "projects";
  const [selectedFigmaElement, setSelectedFigmaElement] = useState<FigmaElement | null>(null);
  const [layerNodes, setLayerNodes] = useState<string[]>([]);
  const [rawCode, setRawCode] = useState("");
  const [settings, setSettings] = useState<any>(null);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* ─── Effects ──────────────────────────────────────────────── */

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    async function fetchAll() {
      try {
        const [pr, pf, sk, ex, st] = await Promise.all([
          fetch("/api/projects"), fetch("/api/profile"),
          fetch("/api/skills"), fetch("/api/experience"),
          fetch("/api/settings")
        ]);
        const doc = {
          projects: (await pr.json()).data || [],
          profile: (await pf.json()).data || {},
          skills: (await sk.json()).data || [],
          experience: (await ex.json()).data || [],
        };
        setSiteDocument(doc);
        setSettings(await st.json());
        if (useMakeStore.getState().versions.length === 0) {
          addVersion("Initial Load", doc);
        }
      } catch (e) { console.error("Failed to fetch site document", e); }
    }
    fetchAll();
  }, []);

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        const state = useMakeStore.getState();
        const idx = state.versions.findIndex((v) => v.id === state.currentVersionId);
        if (idx > 0) handleRevert(state.versions[idx - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // Revert handler fetches from state now

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

  /* ─── Actions ──────────────────────────────────────────────── */

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
    setChatOpen(true);

    const userMsgId = crypto.randomUUID();
    const imagePayload = pendingImage; // Capture it
    setMessages((prev) => [...prev, { id: userMsgId, type: "user", content: userPrompt, image: imagePayload || undefined }]);
    setPendingImage(null); // Clear after sending

    const reasoningId = crypto.randomUUID();
    const steps = [
      `Reading ${targetSection} data…`,
      "Understanding intent…",
      "Generating JSON patch…",
      "Writing to CMS…",
    ];
    setMessages((prev) => [
      ...prev,
      { id: reasoningId, type: "reasoning", label: `AI (${provider})`, expanded: true, steps: [steps[0]] },
    ]);

    let si = 1;
    const interval = setInterval(() => {
      if (si < steps.length) {
        setMessages((prev) => prev.map((m) => m.id === reasoningId ? { ...m, steps: steps.slice(0, si + 1) } : m));
        si++;
      } else clearInterval(interval);
    }, 650);

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
      
      // Update local state to preview on canvas, but do NOT save to backend yet
      setSiteDocument(newDoc);
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "bot",
          content: `Done! I've proposed changes to "${targetSection}". Review the live preview on the canvas and accept or discard.`,
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
        // 1. Write to backend
        const res = await fetch(`/api/${targetSection}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(after),
        });
        if (res.ok) {
           const newVersionName = `AI Update applied`;
           // 2. Add to version history (canvas is already previewing it)
           addVersion(newVersionName, siteDocument);
        }
      }
    } catch(e) {
      console.error(e);
    }
    setGhostDiff(null); 
    setGenerationState("idle"); 
  }
  
  async function handleDiscard() {
    const st = useMakeStore.getState();
    const before = st.ghostDiff?.before;
    if (before) {
       // Revert canvas to original state
       const newDoc = { ...siteDocument, [targetSection]: before };
       setSiteDocument(newDoc);
       if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    }
    setGhostDiff(null);
    setGenerationState("idle");
  }

  async function saveContentEdits(patch: any, fieldName?: string) {
    if (!selectedNodeId) return;
    const [section, idOrIndex] = selectedNodeId.split('.');
    
    const newDoc = JSON.parse(JSON.stringify(siteDocument));
    let targetData = newDoc[section];
    if (!targetData) return;

    if (Array.isArray(targetData)) {
      const idx = targetData.findIndex((item: any, i: number) => 
        item.slug === idOrIndex || i.toString() === idOrIndex
      );
      if (idx !== -1) {
        targetData[idx] = { ...targetData[idx], ...patch };
      }
    } else {
      if (idOrIndex) {
        targetData[idOrIndex] = { ...targetData[idOrIndex], ...patch };
      } else {
        newDoc[section] = { ...newDoc[section], ...patch };
      }
    }

    try {
      const res = await fetch(`/api/${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc[section]),
      });
      if (res.ok) {
        addVersion(fieldName ? `Updated ${section} ${fieldName}` : `Edit ${section} content`, newDoc);
        setSiteDocument(newDoc);
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      }
    } catch (e) {
      console.error("Failed to save content edit", e);
    }
  }

  /* ─── Render ────────────────────────────────────────────────── */
  
  const breadcrumb = breadcrumbFromElement(selectedFigmaElement);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }} className="flex flex-col h-full w-full overflow-hidden bg-[#0a0a0c]">
      {/* Zone 1 — Top Toolbar */}
      <TopToolbar 
        onBack={onBack}
        onUndo={() => {
          const idx = versions.findIndex((v) => v.id === currentVersionId);
          if (idx > 0) handleRevert(versions[idx - 1]);
        }}
        breadcrumb={breadcrumb}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Zone 2 — Left Dock */}
        <LeftDock 
          layerNodes={layerNodes}
          onRefreshLayers={() => iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SCAN_NODES" }, "*")}
          onSelectNode={(nid) => {
            setSelectedNodeId(nid);
            setRightOpen(true);
            setInspectTab("properties");
            iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SELECT_NODE", payload: nid }, "*");
          }}
          onScrollTo={(section) => {
            iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SCROLL_TO", payload: section }, "*");
          }}
        />

        {/* Center Content (Zone 3, 5, 6) */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Zone 3 — Canvas Zone */}
          <CanvasZone 
            iframeRef={iframeRef}
            breadcrumb={breadcrumb}
          />

          {/* Zone 5 — AI Make Bar */}
          <AiMakeBar 
            startGeneration={startGeneration}
          />

          {/* Zone 6 — Status Bar */}
          <StatusBar />

        </div>

        {/* Zone 4 — Unified Right Inspector Dock */}
        <div className="flex shrink-0 h-full relative">
          <RightDock 
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
          />
        </div>

        {/* Slide-over panels for Settings */}
        <SlideOverPanel 
          runAudit={runAudit}
          iframeRef={iframeRef}
        />
      </div>
    </div>
  );
}
