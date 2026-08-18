import React, { useState, useRef, useEffect } from 'react';
import { 
  Sliders, Sparkles, History, Shield, Code, ChevronRight, Save, 
  Search, Check, X, AlertCircle, AlertTriangle, Info, Plus, Trash2, 
  ArrowRight, RefreshCw, Layers, Palette, Type, Layout, ExternalLink,
  ChevronDown, CheckCircle2, RotateCcw, Hash, Maximize2, Move, AlignCenter,
  AlignLeft, AlignRight, AlignJustify, CornerUpRight, Grid, Smartphone
} from 'lucide-react';
import { useMakeStore, MakeMessage } from '@/store/makeStore';
import { FigmaElement } from './types';
import Editor from '@monaco-editor/react';

interface StudioRightInspectorProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  selectedFigmaElement: FigmaElement | null;
  setSelectedFigmaElement: React.Dispatch<React.SetStateAction<FigmaElement | null>>;
  saveContentEdits: (patch: any, fieldName?: string) => Promise<void>;
  rawCode: string;
  setRawCode: (code: string) => void;
  handleSaveCode: () => void;
  handleRevert: (version: any) => void;
  handleAccept: () => void;
  handleDiscard: () => Promise<void>;
  runAudit: () => Promise<void>;
  startGeneration: () => Promise<void>;
}

export function StudioRightInspector({
  iframeRef,
  selectedFigmaElement, setSelectedFigmaElement,
  saveContentEdits,
  rawCode, setRawCode, handleSaveCode,
  handleRevert, handleAccept, handleDiscard, runAudit, startGeneration
}: StudioRightInspectorProps) {
  const {
    rightOpen, setRightOpen,
    inspectTab, setInspectTab,
    selectedNodeId, setSelectedNodeId,
    siteDocument, setSiteDocument,
    updateSelectedNodeData,
    versions, currentVersionId,
    provider, setProvider,
    generationState, messages, ghostDiff,
    isAuditing, auditReport,
    chatThreads, currentChatId, startNewChat, switchChat
  } = useMakeStore();

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Deconstructivist Portfolio Design Tokens
  const defaultTokens = siteDocument?.tokens || {
    primary: "#FF84BA",
    background: "#FFEFE3",
    surface: "#FFFFFF",
    textMain: "#111111",
    textMuted: "#6b7280",
    fontPrimary: "Inter",
    fontMono: "JetBrains Mono"
  };

  useEffect(() => {
    if (chatEndRef.current && inspectTab === "chat") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, generationState, ghostDiff, inspectTab]);

  if (!rightOpen) return null;

  // Resolve target item data from siteDocument
  let targetItem: any = null;
  let sectionKey = "projects";
  let itemKey = "";

  if (selectedNodeId && siteDocument) {
    const parts = selectedNodeId.split(".");
    sectionKey = parts[0];
    itemKey = parts[1] || "";
    const sectionData = siteDocument[sectionKey];
    if (Array.isArray(sectionData)) {
      targetItem = itemKey 
        ? sectionData.find((x: any, i: number) => x.slug === itemKey || x.id === itemKey || i.toString() === itemKey) 
        : sectionData[0];
    } else if (typeof sectionData === "object" && sectionData !== null) {
      targetItem = itemKey ? sectionData[itemKey] : sectionData;
    }
  }

  const handleFieldUpdate = (field: string, val: any) => {
    if (!targetItem) return;
    const patch = { [field]: val };
    saveContentEdits(patch, field);

    // Also send real-time postMessage to iframe if text changed
    if (typeof val === "string" && selectedFigmaElement) {
      iframeRef.current?.contentWindow?.postMessage({
        type: "FIGMA_UPDATE_CONTENT",
        payload: {
          nodeId: selectedNodeId,
          oldValue: selectedFigmaElement.text,
          newValue: val
        }
      }, "*");
    }
  };

  const handleTokenUpdate = (tokenKey: string, val: string) => {
    const newTokens = { ...defaultTokens, [tokenKey]: val };
    const patch = { tokens: newTokens };
    saveContentEdits(patch, "tokens");

    // Post to iframe to update live css variables
    iframeRef.current?.contentWindow?.postMessage({
      type: "FIGMA_UPDATE_TOKENS",
      payload: newTokens
    }, "*");
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (< md screens) */}
      <div 
        onClick={() => setRightOpen(false)}
        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-35"
      />

      {/* Main Right Dock Container */}
      <aside className="fixed md:relative top-12 md:top-0 bottom-6 md:bottom-0 right-0 w-[92vw] sm:w-[380px] md:w-[320px] bg-[#242424] border-l border-white/[0.08] flex flex-col shrink-0 h-[calc(100vh-48px)] md:h-full overflow-hidden select-none z-40 shadow-2xl transition-all text-zinc-200">
        {/* Mobile Header with Close Button */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-white/[0.08] bg-[#1E1E1E] shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
            <Sliders size={14} className="text-purple-400" />
            <span>Inspector Dock</span>
          </div>
          <button
            onClick={() => setRightOpen(false)}
            className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Top 5-Tab Strip */}
        <div className="flex border-b border-white/[0.08] p-1 bg-[#1E1E1E] shrink-0 gap-0.5 no-scrollbar overflow-x-auto">
          {[
            { id: "properties" as const, label: "Design", icon: Sliders },
            { id: "chat" as const, label: "Assistant", icon: Sparkles },
            { id: "versions" as const, label: "History", icon: History },
            { id: "audit" as const, label: "Audit", icon: Shield },
            { id: "code" as const, label: "Code", icon: Code },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setInspectTab(id)}
              className={`flex-1 py-1.5 px-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                inspectTab === id
                  ? "bg-[#2C2C2C] text-white shadow-sm border border-white/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={12} className={inspectTab === id ? "text-[#0D99FF]" : "text-zinc-500"} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* 1. PROPERTIES / DESIGN TAB */}
        {inspectTab === "properties" && (
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 no-scrollbar text-xs">
            {/* Header selection card */}
            <div className="p-2.5 bg-[#1E1E1E] border border-white/[0.08] rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-[#0D99FF]/20 border border-[#0D99FF]/30 flex items-center justify-center shrink-0">
                  <Layout size={12} className="text-[#0D99FF]" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-zinc-100 block truncate">
                    {selectedFigmaElement?.tagName || (selectedNodeId ? selectedNodeId : "Page Root")}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block truncate">
                    {selectedNodeId || "No element selected"}
                  </span>
                </div>
              </div>

              {selectedNodeId && (
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  title="Clear Selection"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Geometry & Dimensions (Figma Style) */}
            <div className="p-3 bg-[#1E1E1E] border border-white/[0.08] rounded-xl flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Frame &amp; Geometry</span>
                <Move size={11} className="text-zinc-500" />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 bg-[#2C2C2C] px-2 py-1 rounded border border-white/5">
                  <span className="text-zinc-500 text-[10px]">W</span>
                  <span className="text-zinc-200">{selectedFigmaElement?.rect ? `${Math.round(selectedFigmaElement.rect.width)}px` : "1440px"}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#2C2C2C] px-2 py-1 rounded border border-white/5">
                  <span className="text-zinc-500 text-[10px]">H</span>
                  <span className="text-zinc-200">{selectedFigmaElement?.rect ? `${Math.round(selectedFigmaElement.rect.height)}px` : "Auto"}</span>
                </div>
              </div>
            </div>

            {/* Auto-Layout & Alignment Matrix */}
            <div className="p-3 bg-[#1E1E1E] border border-white/[0.08] rounded-xl flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Layout &amp; Alignment</span>
                <Grid size={11} className="text-zinc-500" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-[#2C2C2C] p-1 rounded border border-white/5">
                  <button className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold text-[10px]">Row</button>
                  <button className="px-2 py-0.5 rounded text-zinc-400 hover:text-white text-[10px]">Col</button>
                </div>

                {/* 9-Point Alignment Grid */}
                <div className="grid grid-cols-3 gap-1 bg-[#2C2C2C] p-1 rounded border border-white/5">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-xs transition-colors cursor-pointer ${
                        i === 4 ? "bg-[#0D99FF]" : "bg-white/10 hover:bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Design Tokens Palette Binding */}
            <div className="p-3 bg-[#1E1E1E] border border-white/[0.08] rounded-xl flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Design Tokens</span>
                <Palette size={11} className="text-purple-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Primary Brand Color */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400">Primary</span>
                  <div className="flex items-center gap-1.5 bg-[#2C2C2C] p-1 rounded border border-white/5">
                    <input
                      type="color"
                      value={defaultTokens.primary || "#FF84BA"}
                      onChange={(e) => handleTokenUpdate("primary", e.target.value)}
                      className="w-5 h-5 rounded border border-white/20 bg-transparent cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={defaultTokens.primary || "#FF84BA"}
                      onChange={(e) => handleTokenUpdate("primary", e.target.value)}
                      className="w-full bg-transparent text-[10px] font-mono text-zinc-200 outline-none"
                    />
                  </div>
                </div>

                {/* Canvas Background */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400">Background</span>
                  <div className="flex items-center gap-1.5 bg-[#2C2C2C] p-1 rounded border border-white/5">
                    <input
                      type="color"
                      value={defaultTokens.background || "#FFEFE3"}
                      onChange={(e) => handleTokenUpdate("background", e.target.value)}
                      className="w-5 h-5 rounded border border-white/20 bg-transparent cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={defaultTokens.background || "#FFEFE3"}
                      onChange={(e) => handleTokenUpdate("background", e.target.value)}
                      className="w-full bg-transparent text-[10px] font-mono text-zinc-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Content Fields if item exists */}
            {targetItem && (
              <div className="flex flex-col gap-2.5 p-3 bg-[#1E1E1E] border border-white/[0.08] rounded-xl shadow-sm">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Content Parameters</span>

                {/* Title */}
                {targetItem.title !== undefined && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 font-medium">Title</label>
                    <input
                      type="text"
                      value={targetItem.title}
                      onChange={(e) => handleFieldUpdate("title", e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#2C2C2C] border border-white/[0.08] rounded-md text-xs text-zinc-100 outline-none focus:border-[#0D99FF] transition-colors"
                    />
                  </div>
                )}

                {/* Tagline / Subtitle */}
                {targetItem.tagline !== undefined && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 font-medium">Tagline</label>
                    <input
                      type="text"
                      value={targetItem.tagline}
                      onChange={(e) => handleFieldUpdate("tagline", e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#2C2C2C] border border-white/[0.08] rounded-md text-xs text-zinc-100 outline-none focus:border-[#0D99FF] transition-colors"
                    />
                  </div>
                )}

                {/* Description / Bio */}
                {targetItem.description !== undefined && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 font-medium">Description</label>
                    <textarea
                      rows={3}
                      value={targetItem.description}
                      onChange={(e) => handleFieldUpdate("description", e.target.value)}
                      className="w-full p-2 bg-[#2C2C2C] border border-white/[0.08] rounded-md text-xs text-zinc-100 outline-none focus:border-[#0D99FF] resize-none transition-colors"
                    />
                  </div>
                )}

                {/* Accent Color */}
                {targetItem.accent !== undefined && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 font-medium">Card Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={targetItem.accent}
                        onChange={(e) => handleFieldUpdate("accent", e.target.value)}
                        className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={targetItem.accent}
                        onChange={(e) => handleFieldUpdate("accent", e.target.value)}
                        className="flex-1 px-2 py-1 bg-[#2C2C2C] border border-white/[0.08] rounded-md text-xs font-mono text-zinc-200 outline-none focus:border-[#0D99FF]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Computed Styles Inspector Group */}
            {selectedFigmaElement?.styles && (
              <div className="flex flex-col gap-2 p-3 bg-[#1E1E1E] border border-white/[0.08] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Computed CSS Styles</span>
                  <Palette size={11} className="text-purple-400" />
                </div>

                <div className="flex flex-col gap-1.5 font-mono text-[11px]">
                  {Object.entries(selectedFigmaElement.styles).slice(0, 8).map(([prop, val]) => (
                    <div key={prop} className="flex justify-between items-center py-0.5 border-b border-white/[0.03] text-zinc-400">
                      <span className="text-zinc-500">{prop}:</span>
                      <span className="text-blue-300 font-semibold truncate max-w-[150px]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ASSISTANT TAB (AI Chat) */}
        {inspectTab === "chat" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Thread Header */}
            <div className="p-2 border-b border-white/[0.08] bg-[#1E1E1E] flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles size={12} className="text-purple-400" />
                <span>Make Assistant</span>
              </span>
              <button
                onClick={startNewChat}
                className="px-2 py-1 rounded-md bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={10} />
                <span>New</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 no-scrollbar text-xs">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#1E1E1E] border border-white/10 flex items-center justify-center shadow-md">
                    <Sparkles size={18} className="text-purple-400" />
                  </div>
                  <p className="font-semibold text-zinc-300">Ready to Make</p>
                  <p className="text-zinc-500 text-[11px] px-4">Type instructions in the floating prompt bar to generate changes with instant preview.</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="flex flex-col gap-1">
                    {m.type === "user" ? (
                      <div className="self-end bg-[#0D99FF]/20 border border-[#0D99FF]/30 rounded-2xl rounded-tr-sm px-3 py-2 text-zinc-100 max-w-[90%] shadow-sm">
                        {m.content}
                        {m.image && <img src={m.image} alt="Attachment" className="mt-2 rounded-lg max-h-28 object-cover border border-white/10" />}
                      </div>
                    ) : m.type === "bot" ? (
                      <div className="self-start bg-[#1E1E1E] border border-white/[0.08] rounded-2xl rounded-tl-sm px-3 py-2 text-zinc-200 max-w-[92%] leading-relaxed shadow-sm">
                        {m.content}
                      </div>
                    ) : m.type === "reasoning" ? (
                      <div className="self-start text-[11px] font-mono bg-[#181818] border border-white/5 rounded-lg px-2.5 py-1.5 flex flex-col gap-1 w-full text-zinc-400">
                        <span className="font-semibold text-purple-400">{m.label}:</span>
                        {m.steps?.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-zinc-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Ghost Diff Sticky Footer */}
            {ghostDiff && (
              <div className="p-3 bg-purple-950/40 border-t border-purple-500/30 flex flex-col gap-2 shrink-0 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-300">AI Proposed Update</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Preview Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    <Check size={13} />
                    <span>Accept Changes</span>
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="py-1.5 px-3 bg-white/[0.06] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/10 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    <X size={13} />
                    <span>Discard</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. VERSION HISTORY TAB */}
        {inspectTab === "versions" && (
          <div className="flex-1 flex flex-col overflow-hidden p-3 gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-xs font-semibold text-zinc-200">Checkpoint History</span>
              <span className="text-[10px] font-mono text-zinc-500">{versions.length} versions</span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 no-scrollbar">
              {[...versions].reverse().map((v, idx) => {
                const isCurrent = v.id === currentVersionId;
                return (
                  <div
                    key={`v-${v.id}-${idx}`}
                    onClick={() => handleRevert(v)}
                    className={`rounded-xl border p-2.5 cursor-pointer transition-all ${
                      isCurrent
                        ? "bg-[#0D99FF]/15 border-[#0D99FF]/40 shadow-md text-white"
                        : "bg-[#1E1E1E] border-white/[0.06] hover:border-zinc-600 text-zinc-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isCurrent ? "bg-[#0D99FF] text-white" : "bg-white/5 text-zinc-400"
                      }`}>
                        v{v.id}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-medium mb-1 truncate">{v.label}</p>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                      <span>Restore snapshot</span>
                      <RotateCcw size={10} className="text-blue-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. AUDIT & DIAGNOSTICS TAB */}
        {inspectTab === "audit" && (
          <div className="flex-1 flex flex-col overflow-hidden p-3 gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-xs font-semibold text-zinc-200">Design &amp; a11y Audit</span>
              <button
                onClick={runAudit}
                disabled={isAuditing}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw size={10} className={isAuditing ? "animate-spin" : ""} />
                <span>{isAuditing ? "Scanning…" : "Scan Now"}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 text-xs">
              {!auditReport ? (
                <div className="py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                  <Shield size={22} className="text-emerald-400 opacity-60" />
                  <p className="font-medium text-zinc-300">Run Automated QA Scan</p>
                  <p className="text-[11px] text-zinc-500 px-4">Checks HTML accessibility, broken link schemas, and color contrast ratios.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-[#1E1E1E] border border-white/[0.08] rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">Overall Health</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{auditReport.score}/100</span>
                  </div>

                  {auditReport.issues?.map((issue: any, idx: number) => (
                    <div key={idx} className="p-2 bg-[#1E1E1E] border border-white/[0.06] rounded-lg flex flex-col gap-1 text-[11px]">
                      <span className="font-semibold text-zinc-200">{issue.title}</span>
                      <p className="text-zinc-400 text-[10px] leading-relaxed">{issue.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. CODE / JSON TAB (Monaco Editor) */}
        {inspectTab === "code" && (
          <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Raw JSON Data</span>
              <button
                onClick={handleSaveCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D99FF] text-white text-xs font-semibold hover:bg-[#0080FF] transition-colors cursor-pointer"
              >
                <Save size={11} />
                <span>Save</span>
              </button>
            </div>

            <div className="flex-1 border border-white/[0.08] rounded-xl overflow-hidden shadow-inner">
              <Editor
                height="100%"
                defaultLanguage="json"
                theme="vs-dark"
                value={rawCode}
                onChange={(val) => setRawCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 11,
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  lineNumbers: "off",
                  folding: true,
                  fontFamily: "JetBrains Mono, Menlo, monospace"
                }}
              />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
