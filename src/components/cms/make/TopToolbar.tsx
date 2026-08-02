import React from 'react';
import { ArrowLeft, Menu, Monitor, Tablet, Smartphone, Undo2, Eye, Settings, Shield, PanelRight } from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';
import { tokens } from './design-tokens';

interface TopToolbarProps {
  onBack: () => void;
  onUndo: () => void;
  breadcrumb: string[];
}

export function TopToolbar({ onBack, onUndo, breadcrumb }: TopToolbarProps) {
  const { 
    leftOpen, setLeftOpen,
    rightOpen, setRightOpen,
    previewMode, setPreviewMode,
    isInspectEnabled, setIsInspectEnabled,
    activeSlideOver, setActiveSlideOver,
    currentVersionId
  } = useMakeStore();

  return (
    <div className="flex items-center justify-between px-4 h-12 shrink-0 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md z-40">
      {/* Left: Navigation & Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          title="Back to CMS Dashboard"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
          <span className="text-[13px] font-bold text-white tracking-tight">Make Studio</span>
          <span className="text-[10px] bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-mono px-1.5 py-0.5 rounded-full font-semibold">
            AI v3
          </span>
        </div>

        {/* Breakpoints */}
        <div className="flex items-center gap-0.5 bg-zinc-900/80 p-0.5 rounded-lg border border-white/5 ml-2">
          {(["desktop", "tablet", "mobile"] as const).map((m) => {
            const Icon = m === "desktop" ? Monitor : m === "tablet" ? Tablet : Smartphone;
            const isActive = previewMode === m;
            return (
              <button
                key={m}
                onClick={() => setPreviewMode(m)}
                title={`Preview ${m}`}
                className={`p-1.5 rounded-md transition-colors ${
                  isActive ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Center: Breadcrumb Path */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono bg-zinc-900/60 border border-white/5 px-3 py-1 rounded-full min-w-0 max-w-[280px] truncate">
        <span className="text-zinc-500">Studio</span>
        <span className="text-zinc-600">/</span>
        {breadcrumb.length > 0 ? (
          breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              <span className={i === breadcrumb.length - 1 ? "text-zinc-200 font-semibold" : "text-zinc-400"}>
                {b}
              </span>
              {i < breadcrumb.length - 1 && <span className="text-zinc-600">/</span>}
            </React.Fragment>
          ))
        ) : (
          <span className="text-zinc-300">Canvas</span>
        )}
      </div>

      {/* Right: Actions & SlideOvers */}
      <div className="flex items-center gap-2">
        {/* Version Badge & Undo */}
        <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
          <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            v{currentVersionId}
          </span>
          <button
            onClick={onUndo}
            title="Undo"
            disabled={currentVersionId === 0}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 size={14} />
          </button>
        </div>

        {/* Inspect Toggle */}
        <button
          onClick={() => setIsInspectEnabled(!isInspectEnabled)}
          title="Inspect Element"
          className={`p-1.5 rounded-lg transition-colors ${
            isInspectEnabled ? "bg-violet-500/20 text-violet-300 border border-violet-500/40" : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Eye size={15} />
        </button>

        {/* Audit Scanner */}
        <button
          onClick={() => setActiveSlideOver(activeSlideOver === "audit" ? null : "audit")}
          title="Audit Scanner"
          className={`p-1.5 rounded-lg transition-colors ${
            activeSlideOver === "audit" ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40" : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Shield size={15} />
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveSlideOver(activeSlideOver === "settings" ? null : "settings")}
          title="Settings"
          className={`p-1.5 rounded-lg transition-colors ${
            activeSlideOver === "settings" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Settings size={15} />
        </button>

        {/* Dock Toggle */}
        <button
          onClick={() => setRightOpen(!rightOpen)}
          title="Toggle Right Panel"
          className={`p-1.5 rounded-lg transition-colors ${
            rightOpen ? "text-violet-400 bg-violet-500/10" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <PanelRight size={16} />
        </button>
      </div>
    </div>
  );
}
