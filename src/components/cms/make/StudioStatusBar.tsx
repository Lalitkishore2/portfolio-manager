import React from 'react';
import { useMakeStore } from '@/store/makeStore';
import { GitBranch, Activity, Command, Zap } from 'lucide-react';

export function StudioStatusBar() {
  const { selectedNodeId, provider, previewMode, zoom, autoFitZoom } = useMakeStore();

  return (
    <footer className="h-6 bg-[#181818] border-t border-white/[0.06] px-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none shrink-0 z-20">
      {/* Left: Port connection status & Git branch */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PORTFOLIO:4321 (Live)</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-zinc-500">
          <GitBranch size={10} />
          <span>main (synced)</span>
        </div>
      </div>

      {/* Center: Selected Element info */}
      <div className="hidden md:flex items-center gap-1 text-zinc-400 truncate max-w-xs">
        {selectedNodeId ? (
          <span className="text-purple-400 truncate font-semibold">❖ {selectedNodeId}</span>
        ) : (
          <span>Canvas Ready</span>
        )}
      </div>

      {/* Right: Keybinding hints & AI Model badge */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-zinc-500">
          <span>⌘K Make</span>
          <span>·</span>
          <span>⌘Z Undo</span>
          <span>·</span>
          <span>Esc Deselect</span>
        </div>
        <span className="text-purple-400 font-semibold uppercase">{provider}</span>
      </div>
    </footer>
  );
}
