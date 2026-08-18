import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Paperclip, Image as ImageIcon, X, 
  ChevronUp, ChevronDown, Wand2, Palette, Edit3, ArrowUp
} from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';

interface StudioFloatingPromptBarProps {
  startGeneration: () => Promise<void>;
  targetSection: string;
}

export function StudioFloatingPromptBar({
  startGeneration,
  targetSection
}: StudioFloatingPromptBarProps) {
  const {
    promptText, setPromptText,
    generationState,
    pendingImage, setPendingImage,
    selectedNodeId, setSelectedNodeId
  } = useMakeStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [promptMode, setPromptMode] = useState<"generate" | "rewrite" | "style">("generate");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Global Ctrl+K / Cmd+K listener to focus prompt bar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isGenerating = generationState === "generating";

  // Dynamic context-aware prompt suggestions
  const dynamicChips = selectedNodeId
    ? [
        `Rewrite ${selectedNodeId} tagline to be punchier`,
        `Change accent color to electric cyan`,
        `Add modern hover interaction to this card`,
        `Highlight key achievement metrics`
      ]
    : [
        `Add new IoT aquaculture project card`,
        `Update bio to emphasize Edge AI & DSP`,
        `Add Docker and FreeRTOS to skills grid`,
        `Refresh color palette with high contrast theme`
      ];

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

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-xl z-30 flex flex-col items-center gap-2 select-none">
      {/* Floating Prompt Suggestion Pills */}
      {(!isExpanded || !promptText) && !isGenerating && (
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full px-2 py-0.5 no-scrollbar">
          {dynamicChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPromptText(chip);
                setIsExpanded(true);
                setTimeout(() => textareaRef.current?.focus(), 50);
              }}
              className="text-[11px] bg-[#1E1E1E]/90 hover:bg-[#2C2C2C] text-zinc-300 hover:text-white px-2.5 py-1 rounded-full border border-white/[0.08] shadow-md backdrop-blur-md transition-all whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Sparkles size={10} className="text-purple-400 opacity-75" />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Glassmorphic Pill Container */}
      <div 
        className={`w-full bg-[#1E1E1E]/90 backdrop-blur-2xl border transition-all duration-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ${
          isGenerating 
            ? "border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.25)]" 
            : "border-white/15 focus-within:border-[#0D99FF]/60 focus-within:shadow-[0_0_25px_rgba(13,153,255,0.2)]"
        }`}
      >
        {/* Shimmer bar on generating */}
        {isGenerating && (
          <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 animate-pulse" />
        )}

        {/* Selected Context / Mode Badge Header */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px]">
          <div className="flex items-center gap-2">
            {/* Selected Node Context Tag */}
            {selectedNodeId ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0D99FF]/15 border border-[#0D99FF]/30 text-[#0D99FF] font-mono text-[10px] font-semibold">
                <span>📍 {selectedNodeId}</span>
                <button 
                  onClick={() => setSelectedNodeId(null)}
                  className="hover:text-white transition-colors cursor-pointer ml-0.5"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-purple-400 font-semibold text-[11px]">
                <Sparkles size={12} className={isGenerating ? "animate-spin" : ""} />
                <span>Make AI ({targetSection})</span>
              </div>
            )}

            {/* Prompt Mode Switcher */}
            <div className="hidden sm:flex items-center gap-0.5 bg-black/40 p-0.5 rounded-md border border-white/5 text-[10px]">
              {(["generate", "rewrite", "style"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPromptMode(m)}
                  className={`px-1.5 py-0.5 rounded transition-all capitalize ${
                    promptMode === m ? "bg-white/10 text-white font-semibold" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">⌘K</span>
        </div>

        {/* Pending Image Attachment Thumbnail */}
        {pendingImage && (
          <div className="mx-3 mt-1 flex items-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-xl w-fit">
            <img src={pendingImage} alt="Reference" className="w-8 h-8 rounded-lg object-cover border border-white/10" />
            <div className="flex flex-col text-[10px]">
              <span className="text-zinc-300 font-medium">Image attached</span>
              <span className="text-zinc-500 font-mono">Vision context active</span>
            </div>
            <button
              onClick={() => setPendingImage(null)}
              className="p-1 text-zinc-500 hover:text-white transition-colors ml-1"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Input & Action Row */}
        <div className="flex items-end gap-2 p-3 pt-1">
          <textarea
            ref={textareaRef}
            rows={isExpanded || promptText.length > 50 ? 2 : 1}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedNodeId 
                ? `What should Make AI update in ${selectedNodeId}?` 
                : `What do you want to make or update in ${targetSection}?`
            }
            className="flex-1 bg-transparent border-none text-xs text-zinc-100 placeholder-zinc-500 outline-none resize-none max-h-28 font-sans leading-relaxed py-1"
            disabled={isGenerating}
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Attach UI Mockup or Screenshot"
              disabled={isGenerating}
            >
              <Paperclip size={14} />
            </button>

            {/* Generate Action Button */}
            <button
              onClick={() => {
                if (promptText.trim() && !isGenerating) {
                  startGeneration();
                }
              }}
              disabled={!promptText.trim() || isGenerating}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                promptText.trim() && !isGenerating
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 text-white shadow-purple-500/25 active:scale-95"
                  : "bg-white/10 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <span>{isGenerating ? "Synthesizing…" : "Make"}</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
