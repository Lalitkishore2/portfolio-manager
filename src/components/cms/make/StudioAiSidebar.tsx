import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, ArrowLeft, ChevronDown, Plus, Calendar, Mic, ArrowUp, 
  Paperclip, Image as ImageIcon, X, ThumbsUp, ThumbsDown, MoreHorizontal,
  CheckCircle2, AlertTriangle, Shield, Check, RotateCcw, Brain, FileCode2
} from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';

interface StudioAiSidebarProps {
  onBack: () => void;
  targetSection: string;
  onSelectTargetSection: (section: string) => void;
  startGeneration: () => Promise<void>;
  handleRevert: (version: any) => void;
  handleAccept: () => void;
  handleDiscard: () => Promise<void>;
}

export function StudioAiSidebar({
  onBack,
  targetSection,
  onSelectTargetSection,
  startGeneration,
  handleRevert,
  handleAccept,
  handleDiscard
}: StudioAiSidebarProps) {
  const {
    promptText, setPromptText,
    generationState,
    pendingImage, setPendingImage,
    selectedNodeId, setSelectedNodeId,
    messages, ghostDiff,
    versions, currentVersionId,
    provider, setProvider
  } = useMakeStore();

  const [promptMode, setPromptMode] = useState<string>("Build");
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isGenerating = generationState === "generating";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generationState, ghostDiff]);

  function toggleReasoning(id: string) {
    setExpandedReasoning(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPendingImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (promptText.trim() && !isGenerating) {
        startGeneration();
      }
    }
  }

  const currentVer = versions.find(v => v.id === currentVersionId) || versions[versions.length - 1] || { id: 62, label: "Initial Baseline" };

  return (
    <aside className="w-[380px] lg:w-[400px] h-full bg-[#1E1E1E] border-r border-white/[0.08] flex flex-col shrink-0 select-none text-zinc-200 overflow-hidden relative z-30">
      {/* 1. Header Bar: Figma Logo, File Title Dropdown, AI Badge & Version Switcher */}
      <div className="h-12 border-b border-white/[0.08] px-3 flex items-center justify-between shrink-0 bg-[#1E1E1E]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Back to CMS Dashboard (Esc)"
          >
            <ArrowLeft size={14} />
          </button>

          {/* Figma File Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFileMenuOpen(!fileMenuOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-100 hover:text-white transition-colors cursor-pointer truncate max-w-[180px]"
            >
              <div className="w-4 h-4 rounded bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shrink-0">
                <Sparkles size={9} className="text-white" />
              </div>
              <span className="truncate">Deconstructivist Portfo...</span>
              <ChevronDown size={11} className="text-zinc-500 shrink-0" />
            </button>

            {fileMenuOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-56 bg-[#2C2C2C] border border-white/10 rounded-xl shadow-2xl p-1 z-50 text-xs flex flex-col gap-0.5">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Switch Section Target</div>
                {[
                  { id: "projects", label: "Projects Database" },
                  { id: "profile", label: "Profile & Bio" },
                  { id: "skills", label: "Skills Matrix" },
                  { id: "experience", label: "Experience Timeline" },
                  { id: "chatbot", label: "Chatbot Knowledge" },
                  { id: "tokens", label: "Design Tokens" }
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      onSelectTargetSection(sec.id);
                      setFileMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex justify-between ${
                      targetSection === sec.id ? "bg-[#0D99FF]/20 text-[#0D99FF] font-semibold" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{sec.label}</span>
                    {targetSection === sec.id && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Badge & Version History Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-[10px] font-mono text-zinc-300 font-semibold border border-white/5">
            AI
          </span>

          <div className="relative">
            <button
              onClick={() => setVersionDropdownOpen(!versionDropdownOpen)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer border border-white/5"
            >
              <span>Version {currentVer.id}</span>
              <ChevronDown size={10} className="text-zinc-500" />
            </button>

            {versionDropdownOpen && (
              <div className="absolute top-full mt-1.5 right-0 w-64 bg-[#2C2C2C] border border-white/10 rounded-xl shadow-2xl p-1 z-50 text-xs flex flex-col gap-1 max-h-72 overflow-y-auto no-scrollbar">
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Version Checkpoints</div>
                {[...versions].reverse().map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      handleRevert(v);
                      setVersionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between text-[11px] ${
                      v.id === currentVersionId ? "bg-[#0D99FF]/20 text-[#0D99FF] font-semibold" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="font-medium truncate">{v.label}</span>
                      <span className="text-[9px] font-mono text-zinc-500">{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="font-mono text-[10px] px-1 rounded bg-white/5">v{v.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle Scrollable Chat & Reasoning Thread (Figma Make Style) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 no-scrollbar text-xs">
        {/* Status Notice (Matching Figma Make Reference) */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
          <CheckCircle2 size={13} className="shrink-0" />
          <span>No sensitive data stored</span>
        </div>

        {/* Security & Deployment Status Box */}
        <div className="p-3 bg-[#242424] border border-white/[0.08] rounded-xl flex flex-col gap-1.5 shadow-sm">
          <span className="font-bold text-zinc-100 text-xs">Deployment Status:</span>
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <AlertTriangle size={12} className="shrink-0" />
            <span>NEEDS FIXES - Safe to deploy, but fix rate limiting ASAP</span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed pt-1">
            All findings are documented with severity levels, exploit methods, and specific code solutions in the security report.
          </p>
        </div>

        {/* Conversation Message Feed */}
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col gap-2">
            {/* User Message */}
            {m.type === "user" && (
              <div className="self-end bg-[#0D99FF]/20 border border-[#0D99FF]/30 rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-zinc-100 max-w-[92%] shadow-sm leading-relaxed">
                {m.content}
                {m.image && <img src={m.image} alt="Attachment" className="mt-2 rounded-lg max-h-28 object-cover border border-white/10" />}
              </div>
            )}

            {/* AI Reasoning Step Pill */}
            {m.type === "reasoning" && (
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => toggleReasoning(m.id)}
                  className="w-fit flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] text-[11px] font-medium text-purple-300 transition-colors cursor-pointer"
                >
                  <Brain size={12} className="text-purple-400" />
                  <span>Reasoning</span>
                  <ChevronDown size={10} className={`text-zinc-500 transition-transform ${expandedReasoning[m.id] ? "rotate-180" : ""}`} />
                </button>

                {expandedReasoning[m.id] && (
                  <div className="p-2.5 bg-[#181818] border border-white/5 rounded-xl flex flex-col gap-1 text-[11px] font-mono text-zinc-400 animate-in fade-in duration-150">
                    {m.steps?.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Bot Response Text */}
            {m.type === "bot" && (
              <div className="self-start bg-[#242424] border border-white/[0.08] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-zinc-200 max-w-[95%] leading-relaxed shadow-sm">
                <p>{m.content}</p>
              </div>
            )}
          </div>
        ))}

        {/* Active Selected Node Chip inside Conversation */}
        {selectedNodeId && (
          <div className="flex items-center gap-2 p-2 bg-[#2C2C2C] border border-white/10 rounded-xl">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0D99FF]/20 text-[#0D99FF] font-semibold">
              ❖ {selectedNodeId}
            </span>
            <span className="text-[11px] text-zinc-300">Selected on canvas</span>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="ml-auto text-zinc-500 hover:text-white p-1"
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* Ghost Diff Sticky Review Card if proposed */}
        {ghostDiff && (
          <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl flex flex-col gap-2 shadow-lg animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-300">AI Proposed Patch</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">Preview Ready</span>
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

        {/* Latest Checkpoint Card (Exact Figma Make Style) */}
        <div className="p-3 bg-[#242424] border border-white/[0.08] rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-100 text-xs">{currentVer.label}</span>
            <span className="text-[10px] font-mono text-zinc-500">Version {currentVer.id}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Feedback Thumbs Buttons */}
            <button
              onClick={() => setFeedbackGiven(prev => ({ ...prev, [currentVer.id]: "up" }))}
              className={`p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
                feedbackGiven[currentVer.id] === "up" ? "text-emerald-400 bg-emerald-500/10" : ""
              }`}
              title="Helpful"
            >
              <ThumbsUp size={12} />
            </button>
            <button
              onClick={() => setFeedbackGiven(prev => ({ ...prev, [currentVer.id]: "down" }))}
              className={`p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
                feedbackGiven[currentVer.id] === "down" ? "text-rose-400 bg-rose-500/10" : ""
              }`}
              title="Not helpful"
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        </div>

        <div ref={chatEndRef} />
      </div>

      {/* 3. Bottom "Ask for changes" Composer Box (Exact Figma Make Layout) */}
      <div className="p-3 border-t border-white/[0.08] bg-[#1E1E1E] flex flex-col gap-2 shrink-0">
        <div className="w-full bg-[#141414] border border-white/10 focus-within:border-[#0D99FF]/60 rounded-2xl p-2.5 flex flex-col gap-2 shadow-inner transition-colors">
          {/* Attached Image Preview */}
          {pendingImage && (
            <div className="flex items-center gap-2 p-1.5 bg-black/50 border border-white/10 rounded-lg w-fit">
              <img src={pendingImage} alt="Attachment" className="w-7 h-7 rounded object-cover" />
              <span className="text-[10px] text-zinc-300 font-mono">Image attached</span>
              <button onClick={() => setPendingImage(null)} className="text-zinc-500 hover:text-white">
                <X size={11} />
              </button>
            </div>
          )}

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for changes"
            className="w-full bg-transparent border-none text-xs text-zinc-100 placeholder-zinc-500 outline-none resize-none font-sans leading-relaxed"
            disabled={isGenerating}
          />

          {/* Composer Tools Row: + , Calendar , Build ▾ , Default ▾ , Mic , Submit ↑ */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
            {/* Left Tool Buttons */}
            <div className="flex items-center gap-1 text-zinc-400">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Plus Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Attach context image or screenshot"
              >
                <Plus size={13} />
              </button>

              {/* Calendar / Tasks Button */}
              <button
                className="p-1 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Task & Planning Mode"
              >
                <Calendar size={13} />
              </button>

              {/* Mode Dropdown: Build ▾ */}
              <div className="relative">
                <select
                  value={promptMode}
                  onChange={(e) => setPromptMode(e.target.value)}
                  className="bg-transparent text-[11px] font-medium text-zinc-300 hover:text-white outline-none cursor-pointer pr-3 appearance-none"
                >
                  <option value="Build" className="bg-[#2C2C2C]">Build</option>
                  <option value="Rewrite" className="bg-[#2C2C2C]">Rewrite</option>
                  <option value="Style" className="bg-[#2C2C2C]">Style</option>
                </select>
                <ChevronDown size={9} className="text-zinc-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Model Dropdown: Default ▾ */}
              <div className="relative ml-1">
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="bg-transparent text-[11px] font-medium text-zinc-300 hover:text-white outline-none cursor-pointer pr-3 appearance-none"
                >
                  <option value="gemini" className="bg-[#2C2C2C]">Default</option>
                  <option value="groq" className="bg-[#2C2C2C]">Groq 70B</option>
                  <option value="nvidia" className="bg-[#2C2C2C]">NVIDIA</option>
                  <option value="openrouter" className="bg-[#2C2C2C]">DeepSeek</option>
                </select>
                <ChevronDown size={9} className="text-zinc-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Voice input"
              >
                <Mic size={13} />
              </button>

              {/* Submit Circular Button */}
              <button
                onClick={() => {
                  if (promptText.trim() && !isGenerating) {
                    startGeneration();
                  }
                }}
                disabled={!promptText.trim() || isGenerating}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  promptText.trim() && !isGenerating
                    ? "bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-blue-500 text-white shadow-md active:scale-95"
                    : "bg-white/10 text-zinc-500 cursor-not-allowed"
                }`}
              >
                <ArrowUp size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
