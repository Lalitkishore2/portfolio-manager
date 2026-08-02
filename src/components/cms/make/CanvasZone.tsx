import React from 'react';
import { ChevronRight, ZoomOut, ZoomIn, Grid, Magnet } from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';
import { tokens } from './design-tokens';

interface CanvasZoneProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  breadcrumb: string[];
}

export function CanvasZone({ iframeRef, breadcrumb }: CanvasZoneProps) {
  const { 
    zoom, setZoom, 
    previewMode, 
    gridEnabled, setGridEnabled,
    snapEnabled, setSnapEnabled,
    selectedNodeId, setPromptText, setChatOpen
  } = useMakeStore();

  const handleQuickAction = (actionPrompt: string) => {
    setPromptText(actionPrompt);
    setChatOpen(true);
  };

  const iframeStyle: React.CSSProperties = {
    width: previewMode === "tablet" ? "768px" : previewMode === "mobile" ? "375px" : "100%",
    height: "100%",
    flexShrink: 0,
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top center",
    margin: previewMode !== "desktop" ? "0 auto" : "0",
    borderRadius: previewMode !== "desktop" ? "12px" : "0",
    boxShadow: previewMode !== "desktop" ? "0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)" : "none",
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-[#09090b]">

      {/* Sub-toolbar / Viewport Header */}
      <div className="flex items-center justify-between h-8 px-4 bg-zinc-950/80 border-b border-white/5 shrink-0 z-20">
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
          <span className="text-zinc-600">PREVIEW</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300 font-semibold uppercase">{previewMode}</span>
        </div>
        
        {/* Right side zoom & grid controls */}
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="flex items-center gap-1 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-white/5">
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-0.5 hover:text-white transition-colors cursor-pointer"><ZoomOut size={12} /></button>
            <span className="text-[11px] w-9 text-center font-mono font-semibold text-zinc-200">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-0.5 hover:text-white transition-colors cursor-pointer"><ZoomIn size={12} /></button>
            <button onClick={() => setZoom(100)} className="text-[10px] text-zinc-500 hover:text-zinc-300 ml-1 cursor-pointer font-mono">100%</button>
          </div>

          <div className="w-px h-3.5 bg-white/10" />

          {/* Grid & Snap Toggles */}
          <button 
            onClick={() => setGridEnabled(!gridEnabled)} 
            title="Toggle Canvas Grid"
            className={`p-1 rounded-md transition-colors cursor-pointer ${gridEnabled ? "text-violet-400 bg-violet-500/10" : "hover:text-zinc-200"}`}
          >
            <Grid size={13} />
          </button>
          <button 
            onClick={() => setSnapEnabled(!snapEnabled)} 
            title="Toggle Grid Snap"
            className={`p-1 rounded-md transition-colors cursor-pointer ${snapEnabled ? "text-violet-400 bg-violet-500/10" : "hover:text-zinc-200"}`}
          >
            <Magnet size={13} />
          </button>
        </div>
      </div>

      {/* Iframe container */}
      <div className={`flex-1 relative overflow-hidden flex ${previewMode === "desktop" ? "justify-center" : "justify-center pt-8"}`}>
        
        {/* Grid Background Overlay */}
        {gridEnabled && (
          <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-20" 
            style={{ 
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }} 
          />
        )}

        {/* The actual iframe */}
        <div style={iframeStyle} className="bg-black relative z-10 transition-all duration-300 ease-out overflow-hidden">
          <iframe 
            ref={iframeRef as any} 
            src="http://localhost:4321/"
            className="w-full h-full border-none" 
            title="Portfolio Preview" 
          />
        </div>
        
        {/* Quick Actions (Floating) */}
        {selectedNodeId && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1a1a1e]/90 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-2xl">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mr-2">Quick Actions:</span>
            <button onClick={() => handleQuickAction("Rewrite this text to be more professional")} className="text-[11px] text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full transition-colors">Rewrite</button>
            <button onClick={() => handleQuickAction("Make this look more modern and vibrant")} className="text-[11px] text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full transition-colors">Make it pop</button>
            <button onClick={() => handleQuickAction("Fix grammar and spelling")} className="text-[11px] text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full transition-colors">Fix Grammar</button>
          </div>
        )}
      </div>
    </div>
  );
}
