import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';
import { tokens } from './design-tokens';

export function StatusBar() {
  const { currentVersionId, zoom, previewMode } = useMakeStore();

  const canvasWidth = previewMode === "desktop" ? "1440px" : previewMode === "tablet" ? "768px" : "375px";

  return (
    <div className={`px-3 flex items-center justify-between border-t border-white/5 shrink-0 z-50`} style={{ height: tokens.layout.statusBarHeight, backgroundColor: tokens.color.bg.statusBar }}>
      <div className="flex items-center gap-3 text-[11px] text-white/40 font-medium">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
          <span>Live on GitHub Pages</span>
        </div>
        <span className="text-white/20">·</span>
        <button className="hover:text-white transition-colors cursor-pointer">v{currentVersionId}</button>
        <span className="text-white/20">·</span>
        <span>Last saved just now</span>
        <span className="text-white/20">·</span>
        <button className="hover:text-white transition-colors cursor-pointer text-[#3B82F6]">0 files changed</button>
      </div>
      
      <div className="flex items-center gap-3 text-[11px] text-white/40 font-mono">
        <span>Canvas: {canvasWidth}</span>
        <span className="text-white/20">·</span>
        <span>Zoom: {zoom}%</span>
        <button className="ml-1 text-white/40 hover:text-white transition-colors cursor-pointer" title="Keyboard Shortcuts">
          <HelpCircle size={12} />
        </button>
      </div>
    </div>
  );
}
