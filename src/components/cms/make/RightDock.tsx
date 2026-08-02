import React, { useState, useRef, useEffect } from 'react';
import { 
  MousePointer2, Box, Move, Palette, Type, ChevronRight, Save, Sparkles, Send,
  Search, History, Code, Sliders, X, Check, AlertCircle, AlertTriangle, Info, CheckCircle2 
} from 'lucide-react';
import { useMakeStore, MakeMessage } from '@/store/makeStore';
import { tokens } from './design-tokens';
import Editor from '@monaco-editor/react';

export interface FigmaElement {
  id: string;
  tagName: string;
  className: string;
  path: string;
  rect: { top: number; left: number; width: number; height: number };
  styles: Record<string, string>;
  text: string;
  nodeId?: string;
}

interface RightDockProps {
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

function parseColorToHex(val: string): string {
  if (!val) return "#000000";
  if (val.startsWith("#")) return val.slice(0, 7);
  const match = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  if (val === "transparent") return "#ffffff";
  return "#000000";
}

function PropSection({ title, Icon, children }: { title: string; Icon: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-0.5">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 px-1 rounded-md hover:bg-[#141416] transition-colors cursor-pointer">
        <ChevronRight size={10} className={`text-[#444] transition-transform ${open ? "rotate-90" : ""}`} />
        <Icon size={11} className="text-[#3B82F6]" />
        <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">{title}</span>
        <div className="flex-1 h-px bg-[#1a1a1e] ml-1" />
      </button>
      {open && <div className="pl-4 pr-1 pb-2 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

function PropField({ label, value, onChange, onBlur, multiline = false, isColor = false }: {
  label: string; value: string; onChange: (val: string) => void; onBlur?: () => void; multiline?: boolean; isColor?: boolean;
}) {
  const displayLabel = label.replace(/([A-Z])/g, " $1").replace(/-/g, " ").toLowerCase();
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] text-[#666] uppercase tracking-wide truncate" title={label}>{displayLabel}</label>
      {isColor ? (
        <div className="flex items-center gap-1.5">
          <input type="color" value={parseColorToHex(value)} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
            className="w-6 h-6 rounded cursor-pointer border border-[#222]" />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
            className="flex-1 bg-[#161618] border border-[#1e1e22] rounded-md px-2 py-1 text-[11px] text-[#ccc] outline-none focus:border-[#3B82F6] transition-colors font-mono" />
        </div>
      ) : multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          className="bg-[#161618] border border-[#1e1e22] rounded-md px-2 py-1 text-[11px] text-[#ccc] outline-none focus:border-[#3B82F6] transition-colors resize-none min-h-[48px] w-full" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          className="bg-[#161618] border border-[#1e1e22] rounded-md px-2 py-1 text-[11px] text-[#ccc] w-full outline-none focus:border-[#3B82F6] transition-colors" />
      )}
    </div>
  );
}

function ChatMessageItem({ msg }: { msg: MakeMessage }) {
  const [open, setOpen] = useState(msg.expanded ?? true);
  if (msg.type === "user") {
    return (
      <div className="flex justify-end mb-3 mt-1">
        <div className="max-w-[88%] bg-blue-600/20 border border-blue-500/30 rounded-2xl rounded-tr-sm px-3 py-2 text-[12px] text-zinc-200 leading-relaxed flex flex-col gap-1.5 shadow-sm">
          {msg.content && <div>{msg.content}</div>}
          {msg.image && <img src={msg.image} alt="Attachment" className="rounded-lg max-h-32 object-contain border border-white/10" />}
        </div>
      </div>
    );
  }
  if (msg.type === "reasoning") {
    return (
      <div className="mb-3">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 py-0.5 cursor-pointer transition-colors">
          <ChevronRight size={10} className={`transition-transform ${open ? "rotate-90" : ""}`} />
          {msg.label}
        </button>
        {open && msg.steps && (
          <div className="pl-3 flex flex-col gap-1 pt-1 border-l border-white/5 ml-1">
            {msg.steps.map((step, i) => (
              <div key={i} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${step.includes("✓") ? "bg-emerald-400" : "bg-zinc-600"}`} />{step}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  if (msg.type === "bot") {
    return (
      <div className="mb-3">
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-md mt-0.5">
            <Sparkles size={11} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-zinc-300 leading-relaxed mb-1">{msg.content}</p>
            {msg.versionName && <span className="text-[10px] text-emerald-400 font-mono bg-emerald-400/10 px-2 py-0.5 rounded-md">{msg.versionName}</span>}
          </div>
        </div>
      </div>
    );
  }
  if (msg.type === "error") {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 text-[11px] text-rose-400 mb-3 flex gap-2">
        <span className="shrink-0">⚠</span>
        <span className="leading-relaxed">{msg.content}</span>
      </div>
    );
  }
  return null;
}

export function RightDock({ 
  iframeRef, 
  selectedFigmaElement, setSelectedFigmaElement, 
  saveContentEdits,
  rawCode, setRawCode, handleSaveCode,
  handleRevert, handleAccept, handleDiscard, runAudit, startGeneration
}: RightDockProps) {
  const { 
    rightOpen, 
    inspectTab, setInspectTab,
    selectedNodeId, setSelectedNodeId,
    siteDocument,
    updateSelectedNodeData,
    versions, currentVersionId,
    setLeftTab, setLeftOpen,
    provider, setProvider,
    generationState, messages, ghostDiff,
    isAuditing, auditReport, auditFilter, setAuditFilter,
    promptText, setPromptText
  } = useMakeStore();

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inspectTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, inspectTab, generationState, ghostDiff]);

  if (!rightOpen) return null;

  function getNodeData() {
    if (!selectedNodeId || !siteDocument) return null;
    const [section, idOrIndex] = selectedNodeId.split(".");
    const data = siteDocument[section];
    if (!data) return null;
    if (Array.isArray(data)) return data.find((item: any, i: number) => item.slug === idOrIndex || i.toString() === idOrIndex) ?? null;
    return idOrIndex ? data[idOrIndex] : data;
  }

  const nodeData = getNodeData();
  const showResult = generationState === "result" && ghostDiff;

  return (
    <div className="w-[340px] flex flex-col shrink-0 h-full overflow-hidden border-l border-[#1e1e22] bg-[#0d0d0f] z-20 shadow-2xl relative">
      
      {/* Top Unified 4-Tab Strip */}
      <div className="flex border-b border-[#1a1a1e] px-1.5 py-1 bg-[#111113] shrink-0 gap-0.5">
        {[
          { id: "properties" as const, label: "Properties", icon: Sliders },
          { id: "chat" as const, label: "Assistant", icon: Sparkles },
          { id: "audit" as const, label: "Audit", icon: Search },
          { id: "code" as const, label: "JSON & Logs", icon: Code },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setInspectTab(id)}
            className={`flex-1 py-1.5 px-1 flex items-center justify-center gap-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
              inspectTab === id ? "bg-[#1f1f26] text-white shadow-sm font-semibold border border-white/10" : "text-[#777] hover:text-[#bbb] hover:bg-white/5 border border-transparent"
            }`}>
            <Icon size={11} className={inspectTab === id ? "text-[#3B82F6]" : "text-[#555]"} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* 1. PROPERTIES TAB */}
      {inspectTab === "properties" && (
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2e transparent" }}>
          {!selectedFigmaElement ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#161618] border border-[#1e1e22] flex items-center justify-center">
                <MousePointer2 size={20} className="text-[#444]" />
              </div>
              <div>
                <p className="text-[13px] text-[#ddd] font-medium mb-1">Select Canvas Element</p>
                <p className="text-[11px] text-[#666] leading-relaxed">Click any section or component on the live preview canvas to inspect styles & content.</p>
              </div>
              <button onClick={() => { setLeftTab("layers"); setLeftOpen(true); iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SCAN_NODES" }, "*"); }}
                className="text-[11px] text-[#3B82F6] hover:underline cursor-pointer font-medium">
                Scan layer tree →
              </button>
            </div>
          ) : (
            <div className="p-3">
              {/* Header */}
              <div className="mb-3 pb-3 border-b border-[#1a1a1e] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/25 flex items-center justify-center shrink-0">
                    <Box size={13} className="text-[#3B82F6]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#ddd] truncate">{selectedFigmaElement.tagName}</p>
                    {selectedNodeId && <p className="text-[9px] font-mono text-[#555] truncate">{selectedNodeId}</p>}
                  </div>
                </div>
                <button onClick={() => setSelectedFigmaElement(null)} className="text-[#666] hover:text-white p-1 rounded hover:bg-white/5 transition-colors">
                  <X size={13} />
                </button>
              </div>

              {/* Content section */}
              {nodeData && typeof nodeData === "object" && (
                <PropSection title="Content" Icon={Type}>
                  {Object.entries(nodeData)
                    .filter(([, v]) => typeof v === "string" || typeof v === "number" || Array.isArray(v))
                    .map(([key, value]) => (
                      <PropField key={key} label={key}
                        value={Array.isArray(value) ? (value as any[]).join(", ") : String(value)}
                        multiline={key === "description" || key === "overview"}
                        onChange={(val) => {
                          const final = key === "tags" ? val.split(",").map((s) => s.trim()) : val;
                          const oldVal = nodeData[key];
                          updateSelectedNodeData({ [key]: final });
                          iframeRef.current?.contentWindow?.postMessage({
                            type: "FIGMA_UPDATE_CONTENT",
                            payload: { field: key, oldValue: String(oldVal), newValue: String(final), nodeId: selectedNodeId }
                          }, "*");
                        }}
                        onBlur={() => {
                          const rawVal = nodeData[key];
                          saveContentEdits({ [key]: rawVal }, key);
                        }}
                      />
                    ))}
                </PropSection>
              )}

              {/* Layout CSS */}
              {(() => {
                const keys = ["padding", "margin", "display", "gap", "width", "height", "align", "justify", "flex", "position"];
                const fields = Object.entries(selectedFigmaElement.styles).filter(([k]) => keys.some((p) => k.toLowerCase().includes(p)));
                return fields.length > 0 ? (
                  <PropSection title="Layout" Icon={Move}>
                    {fields.map(([k, v]) => (
                      <PropField key={k} label={k} value={v} onChange={(val) => {
                        setSelectedFigmaElement((prev) => prev ? { ...prev, styles: { ...prev.styles, [k]: val } } : prev);
                        iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_UPDATE_STYLE", payload: { property: k, value: val } }, "*");
                      }} />
                    ))}
                  </PropSection>
                ) : null;
              })()}

              {/* Style CSS */}
              {(() => {
                const keys = ["background", "color", "border", "shadow", "opacity", "radius"];
                const fields = Object.entries(selectedFigmaElement.styles).filter(([k]) => keys.some((p) => k.toLowerCase().includes(p)));
                return fields.length > 0 ? (
                  <PropSection title="Style" Icon={Palette}>
                    {fields.map(([k, v]) => (
                      <PropField key={k} label={k} value={v}
                        isColor={k.toLowerCase().includes("color") || k.toLowerCase().includes("background")}
                        onChange={(val) => {
                          setSelectedFigmaElement((prev) => prev ? { ...prev, styles: { ...prev.styles, [k]: val } } : prev);
                          iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_UPDATE_STYLE", payload: { property: k, value: val } }, "*");
                        }} />
                    ))}
                  </PropSection>
                ) : null;
              })()}

              {/* Typography CSS */}
              {(() => {
                const keys = ["font", "line-height", "text-align", "letter-spacing", "text-transform"];
                const fields = Object.entries(selectedFigmaElement.styles).filter(([k]) => keys.some((p) => k.toLowerCase().includes(p)));
                return fields.length > 0 ? (
                  <PropSection title="Typography" Icon={Type}>
                    {fields.map(([k, v]) => (
                      <PropField key={k} label={k} value={v} onChange={(val) => {
                        setSelectedFigmaElement((prev) => prev ? { ...prev, styles: { ...prev.styles, [k]: val } } : prev);
                        iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_UPDATE_STYLE", payload: { property: k, value: val } }, "*");
                      }} />
                    ))}
                  </PropSection>
                ) : null;
              })()}

              {/* Quick AI Action */}
              <div className="pt-3 mt-1">
                <button onClick={() => {
                  setInspectTab("chat");
                  setPromptText(`Rewrite and enhance the ${selectedFigmaElement.tagName} section`);
                }}
                  className="w-full py-2 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#3B82F6] text-[11px] font-medium hover:bg-[#3B82F6]/20 transition-colors cursor-pointer">
                  <Sparkles size={11} className="inline mr-1.5" />Ask AI to Improve Section
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. AI ASSISTANT TAB */}
      {inspectTab === "chat" && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0c]">
          {/* Header Bar */}
          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-[#111113]">
            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
              <Sparkles size={12} className="text-fuchsia-400" /> Model Provider:
            </span>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}
              className="bg-[#161618] text-zinc-200 text-[10px] font-mono border border-white/10 rounded px-2 py-0.5 outline-none focus:border-violet-500 cursor-pointer">
              <option value="gemini">Gemini 2.5</option>
              <option value="groq">Groq Llama 3.3</option>
              <option value="nvidia">NVIDIA Llama</option>
              <option value="ollama">Ollama Qwen</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2e transparent" }}>
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 opacity-60">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center mb-3 border border-white/10">
                   <Sparkles size={18} className="text-fuchsia-400" />
                </div>
                <p className="text-[12px] text-zinc-300 font-medium mb-1">Make AI Assistant</p>
                <p className="text-[10px] text-zinc-500 max-w-[200px]">Prompt Make to rewrite content or edit canvas selections.</p>
              </div>
            ) : (
              messages.map((msg: MakeMessage) => <ChatMessageItem key={msg.id} msg={msg} />)
            )}
            <div ref={chatEndRef} className="h-2" />
          </div>

          {/* Accept / Discard Floating Commit Bar */}
          {showResult && (
            <div className="p-3 border-t border-white/10 bg-[#121215] shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-zinc-300">Proposed Changes</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Live Preview</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDiscard} className="flex-1 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-white/10 rounded-lg transition-colors border border-white/10 cursor-pointer">
                  Discard
                </button>
                <button onClick={handleAccept} className="flex-1 py-1.5 text-[11px] font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-md cursor-pointer">
                  <Check size={13} /> Accept
                </button>
              </div>
            </div>
          )}

          {/* Inline Assistant Prompt Bar */}
          <div className="p-2 border-t border-white/10 bg-[#111113] shrink-0">
            <div className="flex items-center gap-2 bg-[#18181b] border border-white/10 rounded-lg px-2.5 py-1.5 focus-within:border-violet-500">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && promptText.trim()) startGeneration(); }}
                placeholder="Ask Make AI..."
                className="flex-1 bg-transparent border-none outline-none text-[12px] text-zinc-100 placeholder:text-zinc-500 font-medium"
                disabled={generationState === "generating"}
              />
              <button
                onClick={startGeneration}
                disabled={!promptText.trim() || generationState === "generating"}
                className="w-7 h-7 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 text-white disabled:opacity-40 flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0"
                title="Send prompt"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDIT TAB */}
      {inspectTab === "audit" && (
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2e transparent" }}>
          {isAuditing ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-[#222] border-t-[#3B82F6] animate-spin" />
              <p className="text-[12px] text-[#666]">Running deep scan…</p>
            </div>
          ) : auditReport ? (
            <div className="flex flex-col h-full">
              {/* Score Header */}
              <div className="p-3.5 bg-[#121215] flex items-center justify-between border-b border-[#1a1a1e]">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 font-mono text-[16px] font-bold shadow-lg ${
                    auditReport.score >= 90 ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10" :
                    auditReport.score >= 70 ? "border-[#fb923c] text-[#fb923c] bg-[#fb923c]/10" :
                    "border-[#f87171] text-[#f87171] bg-[#f87171]/10"
                  }`}>
                    {auditReport.score}
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-white tracking-wide">{auditReport.score}/100 Score</h4>
                    <p className="text-[10px] text-[#888]">{auditReport.issues.length} issue{auditReport.issues.length === 1 ? "" : "s"} detected</p>
                  </div>
                </div>
                <button onClick={runAudit} className="text-[10px] font-medium bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 border border-[#3B82F6]/30 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
                  Re-run
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-[#16161a] px-2 py-1.5 gap-1 bg-[#0d0d0f] shrink-0">
                {(["all", "error", "warning", "info"] as const).map((f) => {
                  const count = f === "all" ? auditReport.issues.length : auditReport.issues.filter((i: any) => i.type === f).length;
                  return (
                    <button key={f} onClick={() => setAuditFilter(f)}
                      className={`flex-1 py-1 rounded text-[9px] font-mono font-medium transition-all ${
                        auditFilter === f
                          ? "bg-[#1a1a24] text-[#3B82F6] border border-[#2a2a3e]"
                          : "text-[#666] hover:text-[#aaa] border border-transparent hover:bg-white/5"
                      }`}>
                      {f.toUpperCase()} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Issues List */}
              <div className="p-3 flex flex-col gap-2">
                {auditReport.issues.filter((i: any) => auditFilter === "all" || i.type === auditFilter).length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 size={28} className="text-[#4ade80] mx-auto mb-2 opacity-60" />
                    <p className="text-[11px] text-[#888]">No {auditFilter !== "all" ? auditFilter : ""} issues found!</p>
                  </div>
                ) : (
                  auditReport.issues
                    .filter((i: any) => auditFilter === "all" || i.type === auditFilter)
                    .map((issue: any, idx: number) => {
                      const Icon = issue.type === "error" ? AlertCircle : issue.type === "warning" ? AlertTriangle : Info;
                      const colorClass = issue.type === "error" ? "text-[#f87171]" : issue.type === "warning" ? "text-[#fb923c]" : "text-[#60a5fa]";
                      const borderClass = issue.type === "error" ? "border-[#f87171]/20 bg-[#f87171]/5" : issue.type === "warning" ? "border-[#fb923c]/20 bg-[#fb923c]/5" : "border-[#60a5fa]/20 bg-[#60a5fa]/5";

                      return (
                        <div key={idx} className={`rounded-xl border p-2.5 flex flex-col gap-1.5 transition-all ${borderClass}`}>
                          <div className="flex items-start gap-2">
                            <Icon size={13} className={`${colorClass} shrink-0 mt-0.5`} />
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-semibold text-white leading-tight">{issue.title}</h5>
                              <p className="text-[10px] text-[#888] mt-0.5 leading-relaxed">{issue.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/10">
                            <span className="text-[8px] font-mono text-[#666] bg-black/40 px-1.5 py-0.5 rounded uppercase">{issue.category}</span>
                            {issue.nodeId && (
                              <button onClick={() => {
                                setSelectedNodeId(issue.nodeId);
                                iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SELECT_NODE", payload: issue.nodeId }, "*");
                              }} className="text-[10px] text-[#3B82F6] hover:underline flex items-center gap-1 font-medium cursor-pointer">
                                Highlight node →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-6 text-center py-16">
              <div className="w-12 h-12 rounded-full bg-[#161618] border border-[#222] flex items-center justify-center mb-1">
                <Search size={20} className="text-[#555]" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#ddd] mb-1">CMS Deep Auditor</p>
                <p className="text-[10px] text-[#666]">Scan portfolio content for broken links, missing tags, and performance issues.</p>
              </div>
              <button onClick={runAudit} className="mt-2 text-[11px] font-medium bg-[#3B82F6] text-white px-5 py-1.5 rounded-lg hover:bg-[#2563EB] transition-colors shadow-md cursor-pointer">
                Start Audit Scan
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. JSON CODE & HISTORY TAB */}
      {inspectTab === "code" && (
        <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2">
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-[#666] uppercase tracking-wider">Raw JSON Data</span>
            <button onClick={handleSaveCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#3B82F6] text-white text-[10px] font-medium hover:bg-[#2563EB] transition-colors cursor-pointer">
              <Save size={11} /> Save Changes
            </button>
          </div>

          {/* Code Editor */}
          <div className="h-[220px] border border-[#1e1e22] rounded-lg overflow-hidden shrink-0">
            <Editor height="100%" defaultLanguage="json" theme="vs-dark" value={rawCode}
              onChange={(val) => setRawCode(val || "")}
              options={{ minimap: { enabled: false }, fontSize: 10, wordWrap: "on", scrollBeyondLastLine: false, lineNumbers: "off", folding: true }} />
          </div>

          {/* History Header */}
          <div className="flex items-center justify-between px-1 pt-2 border-t border-[#1a1a1e]">
            <span className="text-[10px] font-bold text-[#666] uppercase tracking-wider flex items-center gap-1">
              <History size={11} /> Version History
            </span>
            <span className="text-[9px] font-mono text-[#555]">{versions.length} checkpoints</span>
          </div>

          {/* Version History List */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2e transparent" }}>
            {[...versions].reverse().map((v, idx) => {
              const isCurrent = v.id === currentVersionId;
              return (
                <div key={`version-${v.id}-${idx}`} onClick={() => handleRevert(v)}
                  className={`rounded-lg border p-2 cursor-pointer transition-all ${isCurrent ? "bg-[#1a1a2e] border-[#3a3a6e]" : "bg-[#111113] border-[#1e1e22] hover:border-[#2a2a2e]"}`}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-[11px] font-bold ${isCurrent ? "text-white" : "text-[#aaa]"}`}>v{v.id}</span>
                    <span className="text-[9px] text-[#555]">{new Date(v.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-[#666] truncate">{v.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
