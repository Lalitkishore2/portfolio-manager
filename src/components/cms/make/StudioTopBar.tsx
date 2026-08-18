import React, { useState } from 'react';
import { 
  ArrowLeft, Monitor, Tablet, Smartphone, Maximize2, Undo2, Redo2, 
  Sparkles, Layers, Sliders, Save, Check, ChevronDown, ZoomIn, ZoomOut,
  FolderGit2, Code2, Play, Layout, Palette
} from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';

interface StudioTopBarProps {
  onBack: () => void;
  targetSection: string;
  onSelectTargetSection: (section: string) => void;
  handleSaveCode: () => void;
}

export function StudioTopBar({
  onBack,
  targetSection,
  onSelectTargetSection,
  handleSaveCode
}: StudioTopBarProps) {
  const {
    previewMode, setPreviewMode,
    zoom, setZoom,
    autoFitZoom, setAutoFitZoom,
    provider, setProvider,
    versions, currentVersionId, revertToVersion,
    leftOpen, setLeftOpen,
    rightOpen, setRightOpen,
    inspectTab, setInspectTab
  } = useMakeStore();

  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  function handleUndo() {
    const idx = versions.findIndex((v) => v.id === currentVersionId);
    if (idx > 0) revertToVersion(versions[idx - 1].id);
  }

  function handleRedo() {
    const idx = versions.findIndex((v) => v.id === currentVersionId);
    if (idx !== -1 && idx < versions.length - 1) revertToVersion(versions[idx + 1].id);
  }

  const triggerSave = () => {
    handleSaveCode();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const sections = [
    { id: "projects", label: "Projects Database" },
    { id: "profile", label: "Profile & Bio" },
    { id: "skills", label: "Skills Grid" },
    { id: "experience", label: "Experience Timeline" },
    { id: "chatbot", label: "Chatbot Knowledge" },
    { id: "tokens", label: "Design Tokens" }
  ];

  return (
    <header className="h-12 bg-[#1E1E1E] border-b border-white/[0.08] px-3 flex items-center justify-between shrink-0 select-none z-30 gap-3 no-scrollbar overflow-x-auto text-zinc-200">
      {/* Left: Branding, Document Breadcrumb & Section Quick Jump */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Back to CMS Dashboard (Esc)"
        >
          <ArrowLeft size={14} />
        </button>

        <div className="flex items-center gap-2 pl-1">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-sm">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="text-xs font-semibold tracking-tight text-white">Make Studio</span>
          </div>

          <span className="text-zinc-600 text-xs">/</span>

          {/* Section Jump Dropdown */}
          <div className="relative group">
            <select
              value={targetSection}
              onChange={(e) => onSelectTargetSection(e.target.value)}
              className="bg-transparent text-xs font-medium text-blue-400 hover:text-blue-300 outline-none cursor-pointer pr-4 appearance-none transition-colors"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id} className="bg-[#2C2C2C] text-zinc-200">
                  {sec.label}
                </option>
              ))}
            </select>
            <ChevronDown size={11} className="text-zinc-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-zinc-300 transition-colors" />
          </div>
        </div>
      </div>

      {/* Center: Figma-Style Segmented Viewport Switcher & Zoom Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Device Mode Switcher */}
        <div className="flex items-center gap-0.5 bg-[#2C2C2C] border border-white/[0.06] rounded-lg p-0.5 shadow-inner">
          {[
            { mode: "desktop" as const, label: "1440", icon: Monitor, tooltip: "Desktop (1440 × 900)" },
            { mode: "tablet" as const, label: "768", icon: Tablet, tooltip: "Tablet (768 × 1024)" },
            { mode: "mobile" as const, label: "390", icon: Smartphone, tooltip: "Mobile (390 × 844)" },
            { mode: "fluid" as const, label: "Fit", icon: Maximize2, tooltip: "Fluid Canvas Fit" }
          ].map(({ mode, label, icon: Icon, tooltip }) => (
            <button
              key={mode}
              onClick={() => {
                setPreviewMode(mode);
                if (mode === "fluid") setAutoFitZoom(true);
              }}
              title={tooltip}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                previewMode === mode
                  ? "bg-[#0D99FF] text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
              }`}
            >
              <Icon size={12} />
              <span className="hidden sm:inline font-mono">{label}</span>
            </button>
          ))}
        </div>

        {/* Zoom Selector Dropdown */}
        <div className="relative hidden md:flex items-center">
          <button
            onClick={() => setZoomDropdownOpen(!zoomDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#2C2C2C] hover:bg-[#363636] border border-white/[0.06] rounded-lg text-[11px] font-mono text-zinc-300 transition-colors cursor-pointer"
            title="Canvas Zoom Level"
          >
            <span>{autoFitZoom ? "Auto Fit" : `${zoom}%`}</span>
            <ChevronDown size={10} className="text-zinc-500" />
          </button>

          {zoomDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 w-32 bg-[#2C2C2C] border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-xs">
              <button
                onClick={() => { setAutoFitZoom(true); setZoomDropdownOpen(false); }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer flex justify-between"
              >
                <span>Zoom to fit</span>
                <span className="text-[10px] text-zinc-500 font-mono">Z</span>
              </button>
              <div className="h-px bg-white/5 my-0.5" />
              {[50, 75, 100, 125, 150].map((z) => (
                <button
                  key={z}
                  onClick={() => { setZoom(z); setAutoFitZoom(false); setZoomDropdownOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex justify-between ${
                    !autoFitZoom && zoom === z ? "bg-[#0D99FF]/20 text-[#0D99FF] font-semibold" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{z}%</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: History, Model Selector, Inspector Toggles & Save */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-[#2C2C2C] border border-white/[0.06] rounded-lg p-0.5">
          <button
            onClick={handleUndo}
            disabled={versions.findIndex((v) => v.id === currentVersionId) <= 0}
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={12} />
          </button>
          <button
            onClick={handleRedo}
            disabled={versions.findIndex((v) => v.id === currentVersionId) >= versions.length - 1}
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={12} />
          </button>
        </div>

        {/* AI Provider Switcher */}
        <div className="hidden lg:flex items-center">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-[#2C2C2C] border border-white/[0.06] rounded-lg px-2 py-1 text-[11px] text-zinc-300 font-medium outline-none focus:border-purple-500 transition-colors cursor-pointer"
            title="Selected AI Inference Model"
          >
            <option value="gemini">Gemini 2.5 Flash</option>
            <option value="groq">Groq Llama 3.3</option>
            <option value="nvidia">NVIDIA Nemotron</option>
            <option value="openrouter">OpenRouter DeepSeek</option>
            <option value="ollama">Ollama Cloud</option>
          </select>
        </div>

        {/* Layer Tree Toggle */}
        <button
          onClick={() => setLeftOpen(!leftOpen)}
          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            leftOpen ? "bg-[#0D99FF]/20 border-[#0D99FF]/40 text-[#0D99FF]" : "bg-[#2C2C2C] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
          }`}
          title="Toggle Layers Tree (Alt+1)"
        >
          <Layers size={13} />
        </button>

        {/* Right Inspector Toggle */}
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            rightOpen ? "bg-purple-600/20 border-purple-500/40 text-purple-300" : "bg-[#2C2C2C] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
          }`}
          title="Toggle Inspector Dock (Alt+2)"
        >
          <Sliders size={13} />
        </button>

        {/* Primary Save Action */}
        <button
          onClick={triggerSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md ${
            isSaved
              ? "bg-emerald-600 text-white shadow-emerald-600/30"
              : "bg-[#0D99FF] hover:bg-[#0080FF] text-white shadow-[#0D99FF]/25 active:scale-95"
          }`}
        >
          {isSaved ? <Check size={12} /> : <Save size={12} />}
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </header>
  );
}
