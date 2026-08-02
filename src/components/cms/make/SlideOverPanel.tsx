import React from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Search, Settings } from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';

interface SlideOverPanelProps {
  runAudit: () => Promise<void>;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export function SlideOverPanel({ runAudit, iframeRef }: SlideOverPanelProps) {
  const { 
    activeSlideOver, setActiveSlideOver,
    isAuditing, auditReport, auditFilter, setAuditFilter,
    setSelectedNodeId, zoom, setZoom
  } = useMakeStore();

  if (!activeSlideOver) return null;

  return (
    <>
      {/* Backdrop overlay (optional, but helps focus) */}
      <div className="absolute inset-0 z-40 bg-black/20" onClick={() => setActiveSlideOver(null)} />
      
      {/* Panel */}
      <div className={`absolute top-0 right-0 bottom-[24px] w-[320px] bg-[#111113] border-l border-[#1e1e22] shadow-2xl z-50 flex flex-col transition-transform duration-300 transform ${activeSlideOver ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-[48px] border-b border-[#1a1a1e] shrink-0">
          <div className="flex items-center gap-2 text-white">
            {activeSlideOver === "audit" ? <Search size={14} className="text-[#3B82F6]" /> : <Settings size={14} className="text-[#3B82F6]" />}
            <span className="text-[12px] font-bold tracking-wide uppercase">
              {activeSlideOver === "audit" ? "CMS Audit" : "Settings"}
            </span>
          </div>
          <button onClick={() => setActiveSlideOver(null)} className="text-[#888] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2e transparent" }}>
          
          {/* AUDIT MODE */}
          {activeSlideOver === "audit" && (
            <div className="flex flex-col h-full">
              {isAuditing ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-[#222] border-t-[#3B82F6] animate-spin" />
                  <p className="text-[12px] text-[#666]">Running deep scan…</p>
                </div>
              ) : auditReport ? (
                <div className="flex flex-col flex-1">
                  {/* Score Header */}
                  <div className="p-4 bg-[#121215] flex items-center justify-between border-b border-[#1a1a1e]">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 font-mono text-[18px] font-bold shadow-lg ${
                        auditReport.score >= 90 ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10" :
                        auditReport.score >= 70 ? "border-[#fb923c] text-[#fb923c] bg-[#fb923c]/10" :
                        "border-[#f87171] text-[#f87171] bg-[#f87171]/10"
                      }`}>
                        {auditReport.score}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white tracking-wide">{auditReport.score}/100 Score</h4>
                        <p className="text-[11px] text-[#888] mt-0.5">{auditReport.issues.length} check{auditReport.issues.length === 1 ? "" : "s"} run</p>
                      </div>
                    </div>
                    <button onClick={runAudit} className="text-[11px] font-medium bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 border border-[#3B82F6]/30 px-3 py-1.5 rounded-lg transition-all">
                      Re-run
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex border-b border-[#16161a] px-2 py-1.5 gap-1 bg-[#0d0d0f] shrink-0">
                    {(["all", "error", "warning", "info"] as const).map((f) => {
                      const count = f === "all" ? auditReport.issues.length : auditReport.issues.filter((i: any) => i.type === f).length;
                      return (
                        <button key={f} onClick={() => setAuditFilter(f)}
                          className={`flex-1 py-1.5 rounded text-[10px] font-mono font-medium transition-all ${
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
                  <div className="flex-1 p-3 flex flex-col gap-2">
                    {auditReport.issues.filter((i: any) => auditFilter === "all" || i.type === auditFilter).length === 0 ? (
                      <div className="py-12 text-center">
                        <CheckCircle2 size={32} className="text-[#4ade80] mx-auto mb-3 opacity-60" />
                        <p className="text-[12px] text-[#888]">No {auditFilter !== "all" ? auditFilter : ""} issues found!</p>
                      </div>
                    ) : (
                      auditReport.issues
                        .filter((i: any) => auditFilter === "all" || i.type === auditFilter)
                        .map((issue: any, idx: number) => {
                          const Icon = issue.type === "error" ? AlertCircle : issue.type === "warning" ? AlertTriangle : Info;
                          const colorClass = issue.type === "error" ? "text-[#f87171]" : issue.type === "warning" ? "text-[#fb923c]" : "text-[#60a5fa]";
                          const borderClass = issue.type === "error" ? "border-[#f87171]/20 bg-[#f87171]/5" : issue.type === "warning" ? "border-[#fb923c]/20 bg-[#fb923c]/5" : "border-[#60a5fa]/20 bg-[#60a5fa]/5";

                          return (
                            <div key={idx} className={`rounded-xl border p-3 flex flex-col gap-2 transition-all ${borderClass}`}>
                              <div className="flex items-start gap-2.5">
                                <Icon size={14} className={`${colorClass} shrink-0 mt-0.5`} />
                                <div className="min-w-0">
                                  <h5 className="text-[12px] font-semibold text-white leading-tight">{issue.title}</h5>
                                  <p className="text-[11px] text-[#888] mt-1 leading-relaxed">{issue.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
                                <span className="text-[9px] font-mono text-[#666] bg-black/40 px-1.5 py-0.5 rounded uppercase">{issue.category}</span>
                                {issue.nodeId && (
                                  <button onClick={() => {
                                    setSelectedNodeId(issue.nodeId);
                                    iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SELECT_NODE", payload: issue.nodeId }, "*");
                                  }} className="text-[10px] text-[#3B82F6] hover:underline flex items-center gap-1 font-medium">
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
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#161618] border border-[#222] flex items-center justify-center mb-2">
                    <Search size={24} className="text-[#444]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#ddd] mb-1">Ready to audit</p>
                    <p className="text-[11px] text-[#666]">Scan the portfolio for performance, accessibility, and SEO issues.</p>
                  </div>
                  <button onClick={runAudit} className="mt-2 text-[12px] font-medium bg-[#3B82F6] text-white px-6 py-2 rounded-xl hover:bg-[#2563EB] transition-colors shadow-lg">
                    Start Scan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS MODE */}
          {activeSlideOver === "settings" && (
            <div className="p-5 flex flex-col gap-6">
              
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-[#555] uppercase tracking-widest border-b border-[#1a1a1e] pb-1">Canvas Environment</h5>
                
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#888]">Portfolio URL</span>
                  <input defaultValue={"http://localhost:4321"} className="w-40 bg-[#161618] border border-[#222] rounded-md px-2 py-1.5 text-[11px] text-[#ccc] outline-none focus:border-[#3B82F6] font-mono" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#888]">Default Zoom</span>
                  <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-24 bg-[#161618] text-[#ccc] border border-[#222] rounded-md px-2 py-1.5 text-[11px] outline-none cursor-pointer focus:border-[#3B82F6]">
                    {[50, 75, 100, 125, 150, 200].map((z) => <option key={z} value={z}>{z}%</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-[#555] uppercase tracking-widest border-b border-[#1a1a1e] pb-1">API Connections</h5>
                
                {(["Gemini", "Groq", "OpenRouter", "Ollama"] as const).map((api, i) => (
                  <div key={api} className="flex items-center justify-between">
                    <span className="text-[11px] text-[#888]">{api} API</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${i < 3 ? "bg-[#4ade80]" : "bg-[#f87171]"}`} />
                      <span className={`text-[10px] font-medium ${i < 3 ? "text-[#4ade80]" : "text-[#f87171]"}`}>{i < 3 ? "Connected" : "Missing"}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-[#555] uppercase tracking-widest border-b border-[#1a1a1e] pb-1">Keyboard Shortcuts</h5>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Undo", key: "Ctrl + Z" },
                    { label: "Redo", key: "Ctrl + Shift + Z" },
                    { label: "Focus AI Prompt", key: "Ctrl + K" },
                    { label: "Select parent", key: "Esc" },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between text-[11px]">
                      <span className="text-[#666]">{s.label}</span>
                      <span className="text-[#aaa] font-mono bg-white/5 px-1.5 rounded">{s.key}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
