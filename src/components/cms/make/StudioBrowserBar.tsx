import React, { useState, useEffect } from 'react';
import { 
  Eye, Code2, ChevronLeft, ChevronRight, RotateCw, Monitor, Tablet, Smartphone,
  Sliders, Settings, Play, Share2, Check, ExternalLink, ChevronDown, Lock, Sparkles
} from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';

interface StudioBrowserBarProps {
  currentPath: string;
  onNavigatePath: (path: string) => void;
  onReload: () => void;
  isCodeView: boolean;
  setIsCodeView: (codeView: boolean) => void;
  handleSaveCode: () => void;
}

export function StudioBrowserBar({
  currentPath,
  onNavigatePath,
  onReload,
  isCodeView,
  setIsCodeView,
  handleSaveCode
}: StudioBrowserBarProps) {
  const {
    previewMode, setPreviewMode,
    zoom, setZoom,
    autoFitZoom, setAutoFitZoom,
    rightOpen, setRightOpen,
    setInspectTab
  } = useMakeStore();

  const [inputUrl, setInputUrl] = useState(currentPath);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    setInputUrl(currentPath);
  }, [currentPath]);

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    let p = inputUrl.trim();
    if (!p.startsWith("/")) p = `/${p}`;
    onNavigatePath(p);
  }

  function handleCopyShare() {
    navigator.clipboard.writeText("http://localhost:4321");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handlePublish() {
    handleSaveCode();
    setPublished(true);
    setTimeout(() => setPublished(false), 2500);
  }

  return (
    <header className="h-12 bg-[#1E1E1E] border-b border-white/[0.08] px-3 flex items-center justify-between shrink-0 select-none z-20 gap-3 text-zinc-200">
      {/* 1. Left View Switcher [ 👁 | ⟨/⟩ ] */}
      <div className="flex items-center gap-1 bg-[#2C2C2C] border border-white/[0.06] rounded-lg p-0.5 shrink-0">
        <button
          onClick={() => setIsCodeView(false)}
          className={`px-2 py-1 rounded-md text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            !isCodeView ? "bg-[#1E1E1E] text-white shadow-sm font-semibold" : "text-zinc-400 hover:text-white"
          }`}
          title="Preview"
        >
          <Eye size={13} />
          <span className="text-[11px] hidden sm:inline">Preview</span>
        </button>
        <button
          onClick={() => setIsCodeView(true)}
          className={`px-2 py-1 rounded-md text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            isCodeView ? "bg-[#1E1E1E] text-[#0D99FF] shadow-sm font-semibold" : "text-zinc-400 hover:text-white"
          }`}
          title="Code"
        >
          <Code2 size={13} />
          <span className="text-[11px] hidden sm:inline">Code</span>
        </button>
      </div>

      {/* 2. Center: Browser URL Address Bar with < > ↻ and / */}
      <div className="flex-1 max-w-md flex items-center gap-1.5 min-w-0">
        <button
          onClick={() => window.history.back()}
          className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
          title="Back"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => window.history.forward()}
          className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
          title="Forward"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={onReload}
          className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Reload"
        >
          <RotateCw size={12} />
        </button>

        {/* Real URL address pill */}
        <form onSubmit={handleUrlSubmit} className="flex-1 min-w-0">
          <div className="w-full h-7 bg-[#141414] hover:bg-[#181818] focus-within:bg-[#181818] border border-white/[0.08] focus-within:border-[#0D99FF]/50 rounded-lg px-2.5 flex items-center gap-1.5 text-xs text-zinc-300 transition-colors">
            <Lock size={10} className="text-zinc-500 shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="/"
              className="w-full bg-transparent border-none outline-none font-mono text-[11px] text-zinc-200 placeholder-zinc-500"
            />
          </div>
        </form>
      </div>

      {/* 3. Right: Viewport frames, Zoom, Avatar, Settings, Play, Publish, Share */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Device Frame Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDeviceMenuOpen(!deviceMenuOpen)}
            className="flex items-center gap-1 px-2 py-1 bg-[#2C2C2C] hover:bg-[#363636] border border-white/[0.06] rounded-lg text-[11px] font-mono text-zinc-300 transition-colors cursor-pointer"
            title="Device Viewport Preset"
          >
            {previewMode === "desktop" ? <Monitor size={12} /> : previewMode === "tablet" ? <Tablet size={12} /> : <Smartphone size={12} />}
            <span className="capitalize hidden md:inline">{previewMode}</span>
            <ChevronDown size={10} className="text-zinc-500" />
          </button>

          {deviceMenuOpen && (
            <div className="absolute top-full mt-1 right-0 w-36 bg-[#2C2C2C] border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-xs">
              {[
                { mode: "desktop" as const, label: "Desktop (1440)", icon: Monitor },
                { mode: "tablet" as const, label: "Tablet (768)", icon: Tablet },
                { mode: "mobile" as const, label: "Mobile (390)", icon: Smartphone }
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => {
                    setPreviewMode(mode);
                    setDeviceMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                    previewMode === mode ? "bg-[#0D99FF]/20 text-[#0D99FF] font-semibold" : "text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
            className="flex items-center gap-1 px-2 py-1 bg-[#2C2C2C] hover:bg-[#363636] border border-white/[0.06] rounded-lg text-[11px] font-mono text-zinc-300 transition-colors cursor-pointer"
          >
            <span>{autoFitZoom ? "Fit" : `${zoom}%`}</span>
            <ChevronDown size={10} className="text-zinc-500" />
          </button>

          {zoomMenuOpen && (
            <div className="absolute top-full mt-1 right-0 w-28 bg-[#2C2C2C] border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-xs">
              <button
                onClick={() => { setAutoFitZoom(true); setZoomMenuOpen(false); }}
                className="w-full text-left px-2 py-1 rounded text-zinc-300 hover:bg-white/10"
              >
                Fit
              </button>
              {[50, 75, 100, 125, 150].map((z) => (
                <button
                  key={z}
                  onClick={() => { setZoom(z); setAutoFitZoom(false); setZoomMenuOpen(false); }}
                  className={`w-full text-left px-2 py-1 rounded ${
                    !autoFitZoom && zoom === z ? "bg-[#0D99FF]/20 text-[#0D99FF] font-semibold" : "text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {z}%
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Inspector Toggle Button (To open extra tools when needed) */}
        <button
          onClick={() => {
            setRightOpen(!rightOpen);
            setInspectTab("properties");
          }}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            rightOpen
              ? "bg-[#0D99FF]/20 border-[#0D99FF]/40 text-[#0D99FF]"
              : "bg-[#2C2C2C] border-white/[0.06] text-zinc-400 hover:text-white"
          }`}
          title="Toggle Inspector Dock"
        >
          <Sliders size={13} />
        </button>

        {/* Avatar Circle */}
        <div className="w-6 h-6 rounded-full bg-emerald-600 border border-emerald-400 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
          S
        </div>

        {/* Settings */}
        <button className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden xl:block">
          <Settings size={13} />
        </button>

        {/* Play Prototype Button */}
        <button 
          onClick={() => window.open("http://localhost:4321", "_blank")}
          className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
          title="Open in new window"
        >
          <Play size={13} />
        </button>

        {/* Publish Button (Dark Outline Pill) */}
        <button
          onClick={handlePublish}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            published
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20"
              : "bg-[#2C2C2C] hover:bg-[#363636] border-white/15 text-zinc-200 hover:text-white shadow-sm"
          }`}
        >
          {published ? "Published!" : "Publish"}
        </button>

        {/* Share Button (Signature Blue Pill) */}
        <button
          onClick={handleCopyShare}
          className="px-3.5 py-1 bg-[#0D99FF] hover:bg-[#0080FF] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#0D99FF]/20 cursor-pointer active:scale-95"
        >
          {copiedLink ? <Check size={12} /> : null}
          <span>{copiedLink ? "Copied" : "Share"}</span>
        </button>
      </div>
    </header>
  );
}
