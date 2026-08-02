import React, { useRef, useEffect } from 'react';
import { Sparkles, ChevronRight, X, Check } from 'lucide-react';
import { useMakeStore, MakeMessage } from '@/store/makeStore';

interface DockedChatPanelProps {
  handleAccept: () => void;
  handleDiscard: () => Promise<void>;
}

function ChatMessage({ msg }: { msg: MakeMessage }) {
  const [open, setOpen] = React.useState(msg.expanded ?? true);
  if (msg.type === "user") {
    return (
      <div className="flex justify-end mb-4 mt-2">
        <div className="max-w-[85%] bg-blue-600/20 border border-blue-500/20 rounded-2xl rounded-tr-sm px-3 py-2 text-[13px] text-zinc-200 leading-relaxed flex flex-col gap-2 shadow-sm">
          {msg.content && <div>{msg.content}</div>}
          {msg.image && <img src={msg.image} alt="User attachment" className="rounded-lg max-h-32 object-contain border border-white/10" />}
        </div>
      </div>
    );
  }
  if (msg.type === "reasoning") {
    return (
      <div className="mb-4">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 py-0.5 cursor-pointer transition-colors">
          <ChevronRight size={10} className={`transition-transform ${open ? "rotate-90" : ""}`} />
          {msg.label}
        </button>
        {open && msg.steps && (
          <div className="pl-4 flex flex-col gap-1 pt-1">
            {msg.steps.map((step, i) => (
              <div key={i} className="text-[12px] text-zinc-400 flex items-center gap-2">
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
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles size={12} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-zinc-300 leading-relaxed mb-2 mt-0.5">{msg.content}</p>
            {msg.versionName && <span className="text-[11px] text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded-md">{msg.versionName}</span>}
          </div>
        </div>
      </div>
    );
  }
  if (msg.type === "error") {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 text-[12px] text-rose-400 mb-4 flex gap-2">
        <span className="shrink-0">⚠</span>
        <span className="leading-relaxed">{msg.content}</span>
      </div>
    );
  }
  return null;
}

export function DockedChatPanel({ handleAccept, handleDiscard }: DockedChatPanelProps) {
  const { 
    chatOpen, setChatOpen,
    generationState,
    messages,
    ghostDiff,
    provider, setProvider,
    versions, currentVersionId, revertToVersion,
    inspectTab, setInspectTab,
    selectedNodeId, siteDocument, setSiteDocument
  } = useMakeStore();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<"chat" | "inspect" | "versions">("chat");

  useEffect(() => {
    if (chatOpen && chatEndRef.current && activeTab === "chat") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen, generationState, ghostDiff, activeTab]);

  const showResult = generationState === "result" && ghostDiff;

  if (!chatOpen) return null;

  return (
    <div className="w-[360px] flex flex-col bg-zinc-950 border-l border-white/5 h-full shrink-0 relative shadow-2xl z-20">
      
      {/* 2-Row Clean Header */}
      <div className="flex flex-col border-b border-white/5 shrink-0 bg-zinc-950/90 backdrop-blur-md">
        {/* Row 1: Title & Engine Controls */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-fuchsia-400" />
            <span className="text-[13px] font-semibold text-zinc-100 tracking-wide">Make Assistant</span>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="bg-zinc-900 text-zinc-200 text-[10px] font-mono border border-white/10 rounded-md px-2 py-1 outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="gemini">Gemini 2.5</option>
              <option value="groq">Groq Llama 3.3</option>
              <option value="nvidia">NVIDIA Llama</option>
              <option value="ollama">Ollama Qwen</option>
              <option value="openrouter">OpenRouter</option>
            </select>

            <button
              onClick={() => setChatOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Row 2: 100% Width Segmented Tab Strip */}
        <div className="p-1.5">
          <div className="grid grid-cols-3 gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-1 text-[11px] font-medium rounded-md transition-all text-center ${
                activeTab === "chat" ? "bg-white/10 text-white shadow-sm font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveTab("inspect")}
              className={`py-1 text-[11px] font-medium rounded-md transition-all text-center ${
                activeTab === "inspect" ? "bg-white/10 text-white shadow-sm font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🎛️ Inspect
            </button>
            <button
              onClick={() => setActiveTab("versions")}
              className={`py-1 text-[11px] font-medium rounded-md transition-all text-center ${
                activeTab === "versions" ? "bg-white/10 text-white shadow-sm font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              📜 History
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Body Based on Tab */}
      {activeTab === "chat" && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col" style={{ scrollbarWidth: "none" }}>
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-60">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center mb-4 border border-white/10">
                 <Sparkles size={20} className="text-fuchsia-400" />
              </div>
              <p className="text-[13px] text-zinc-300 font-medium mb-1">Make Studio Chat</p>
              <p className="text-[11px] text-zinc-500 max-w-[200px]">Prompt Make to transform content or click canvas elements for targeted edits.</p>
            </div>
          ) : (
            messages.map((msg: MakeMessage) => <ChatMessage key={msg.id} msg={msg} />)
          )}
          <div ref={chatEndRef} className="h-4" />
        </div>
      )}

      {activeTab === "inspect" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-zinc-300 text-[12px]" style={{ scrollbarWidth: "none" }}>
          {selectedNodeId ? (
            (() => {
              const [section, idOrIdx] = selectedNodeId.split(".");
              const sectionData = siteDocument?.[section];
              let targetItem: any = sectionData;
              if (Array.isArray(sectionData) && idOrIdx) {
                targetItem = sectionData.find((x: any, i: number) => x.slug === idOrIdx || x.id === idOrIdx || i.toString() === idOrIdx) || sectionData[0];
              }

              const handleFieldChange = (field: string, val: any) => {
                if (!siteDocument) return;
                const newDoc = JSON.parse(JSON.stringify(siteDocument));
                if (Array.isArray(newDoc[section]) && idOrIdx) {
                  const idx = newDoc[section].findIndex((x: any, i: number) => x.slug === idOrIdx || x.id === idOrIdx || i.toString() === idOrIdx);
                  if (idx !== -1) {
                    newDoc[section][idx][field] = val;
                  }
                } else if (typeof newDoc[section] === "object") {
                  newDoc[section][field] = val;
                }
                setSiteDocument(newDoc);
              };

              return (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold">Active Selection</span>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full font-mono text-zinc-400">{section}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-zinc-100 truncate">
                      {targetItem?.title || targetItem?.name || targetItem?.company || section}
                    </p>
                  </div>

                  {/* Form Controls */}
                  <div className="space-y-3 bg-zinc-900/40 border border-white/5 rounded-xl p-3">
                    {targetItem?.title !== undefined && (
                      <div>
                        <label className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">Title</label>
                        <input
                          type="text"
                          value={targetItem.title}
                          onChange={(e) => handleFieldChange("title", e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-zinc-100 outline-none focus:border-violet-500"
                        />
                      </div>
                    )}

                    {targetItem?.tagline !== undefined && (
                      <div>
                        <label className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">Tagline</label>
                        <input
                          type="text"
                          value={targetItem.tagline}
                          onChange={(e) => handleFieldChange("tagline", e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-zinc-100 outline-none focus:border-violet-500"
                        />
                      </div>
                    )}

                    {targetItem?.accentColor !== undefined && (
                      <div>
                        <label className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={targetItem.accentColor}
                            onChange={(e) => handleFieldChange("accentColor", e.target.value)}
                            className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={targetItem.accentColor}
                            onChange={(e) => handleFieldChange("accentColor", e.target.value)}
                            className="flex-1 bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] font-mono text-zinc-100 outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    )}

                    {targetItem?.overview !== undefined && (
                      <div>
                        <label className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">Overview</label>
                        <textarea
                          value={targetItem.overview}
                          onChange={(e) => handleFieldChange("overview", e.target.value)}
                          rows={3}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-[12px] text-zinc-100 outline-none focus:border-violet-500 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 opacity-60">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <Sparkles size={18} className="text-zinc-400" />
              </div>
              <p className="text-[13px] font-medium text-zinc-300 mb-1">No Element Selected</p>
              <p className="text-[11px] text-zinc-500 max-w-[200px]">Click any section on the canvas or layer tree to inspect and edit properties.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "versions" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-[12px]">No version history yet.</div>
          ) : (
            versions.map((v) => (
              <div
                key={v.id}
                onClick={() => revertToVersion(v.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  v.id === currentVersionId
                    ? "bg-violet-600/10 border-violet-500/40 text-violet-300"
                    : "bg-zinc-900/50 border-white/5 hover:border-white/20 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[12px]">{v.label}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">#{v.id}</span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  {new Date(v.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sticky Bottom Diff & Accept/Discard */}
      {showResult && (
        <div className="shrink-0 p-4 border-t border-white/5 bg-zinc-950/95 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-3 py-2 bg-zinc-800/50 border-b border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-300">Proposed Patch</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Live Preview
              </span>
            </div>
            
            <div className="px-3 py-2.5 bg-zinc-800/80 border-t border-white/5 flex gap-2">
               <button onClick={handleDiscard} className="flex-1 py-2 text-[12px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/10 cursor-pointer">
                 Discard
               </button>
               <button onClick={handleAccept} className="flex-1 py-2 text-[12px] font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(52,211,153,0.3)] cursor-pointer">
                 <Check size={14} /> Accept & Commit
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
