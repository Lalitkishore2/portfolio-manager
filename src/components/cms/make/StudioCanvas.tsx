import React, { useRef, useState, useEffect } from 'react';
import { useMakeStore } from '@/store/makeStore';
import { StudioFloatingPromptBar } from './StudioFloatingPromptBar';
import { FigmaElement } from './types';
import { Sparkles, Edit3, X, Eye, Sliders, ExternalLink, Move } from 'lucide-react';

interface StudioCanvasProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  selectedFigmaElement: FigmaElement | null;
  startGeneration: () => Promise<void>;
  targetSection: string;
}

export function StudioCanvas({
  iframeRef,
  selectedFigmaElement,
  startGeneration,
  targetSection
}: StudioCanvasProps) {
  const {
    previewMode,
    zoom,
    autoFitZoom,
    setSelectedNodeId,
    setRightOpen,
    setInspectTab,
    setPromptText
  } = useMakeStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScaleFactor, setAutoScaleFactor] = useState<number>(1);

  // Target frame dimensions
  const isFluid = previewMode === "fluid";
  const frameWidth = previewMode === "desktop" ? 1440 : previewMode === "tablet" ? 768 : previewMode === "mobile" ? 390 : 1280;
  const frameHeight = previewMode === "mobile" ? 844 : previewMode === "tablet" ? 1024 : 900;
  const frameLabel = previewMode === "desktop" ? "Desktop (1440 × 900)" : previewMode === "tablet" ? "iPad Pro (768 × 1024)" : previewMode === "mobile" ? "iPhone 15 (390 × 844)" : "Responsive Canvas";

  /* ─── Dynamic Responsive Auto-Fit Engine ──────────────────────── */

  useEffect(() => {
    if (!containerRef.current || isFluid) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: containerW, height: containerH } = entry.contentRect;
        if (containerW > 0 && containerH > 0) {
          const availableW = containerW - 48; // padding
          const availableH = containerH - 84; // top chip + bottom prompt bar
          const scaleX = availableW / frameWidth;
          const scaleY = availableH / frameHeight;
          const computedScale = Math.min(scaleX, scaleY, 1.0);
          setAutoScaleFactor(Math.max(computedScale, 0.25));
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [frameWidth, frameHeight, isFluid]);

  const effectiveZoomScale = isFluid ? 1 : autoFitZoom ? autoScaleFactor : zoom / 100;

  const handleQuickAiPrompt = () => {
    if (selectedFigmaElement?.nodeId) {
      setPromptText(`Update ${selectedFigmaElement.nodeId}: `);
    }
  };

  return (
    <main className="flex-1 bg-[#141414] relative overflow-hidden flex flex-col items-center justify-center select-none w-full h-full">
      {/* Background Dot Grid for Figma Canvas Feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      />

      {/* Scalable Viewport Container */}
      <div
        ref={containerRef}
        className="w-full h-full p-4 flex flex-col items-center justify-center overflow-hidden relative"
      >
        {/* Top Floating Device Label Tag */}
        {!isFluid && (
          <div className="mb-2 px-3 py-0.5 bg-[#2C2C2C] border border-white/[0.08] rounded-full text-[11px] font-mono font-medium text-zinc-300 flex items-center gap-1.5 shadow-md shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{frameLabel}</span>
            <span className="text-zinc-600">·</span>
            <span>{Math.round(effectiveZoomScale * 100)}%</span>
          </div>
        )}

        {/* The Frame Box */}
        <div
          style={{
            width: isFluid ? "100%" : `${frameWidth}px`,
            height: isFluid ? "100%" : `${frameHeight}px`,
            maxWidth: "100%",
            transform: isFluid ? "none" : `scale(${effectiveZoomScale})`,
            transformOrigin: "center center",
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s ease, height 0.3s ease"
          }}
          className={`bg-black ${isFluid ? "rounded-none border-none" : "rounded-2xl border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"} overflow-hidden relative flex flex-col shrink-0`}
        >
          {/* Portfolio Live Pre-render iframe */}
          <iframe
            ref={iframeRef}
            src="http://localhost:4321"
            title="Portfolio Live Canvas Preview"
            className="w-full h-full border-none bg-black"
          />

          {/* Active Element Selection Box Overlay with Figma Corner Handles */}
          {selectedFigmaElement && !isFluid && (
            <div
              style={{
                position: "absolute",
                top: selectedFigmaElement.rect.top,
                left: selectedFigmaElement.rect.left,
                width: selectedFigmaElement.rect.width,
                height: selectedFigmaElement.rect.height,
                border: "2px solid #0D99FF",
                borderRadius: "3px",
                pointerEvents: "none",
                boxShadow: "0 0 0 1px rgba(13, 153, 255, 0.4), 0 0 20px rgba(13, 153, 255, 0.25)",
                zIndex: 20
              }}
            >
              {/* 4 Corner Anchor Handles */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#0D99FF] rounded-xs shadow-xs" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#0D99FF] rounded-xs shadow-xs" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#0D99FF] rounded-xs shadow-xs" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#0D99FF] rounded-xs shadow-xs" />

              {/* Node Tag Badge */}
              <div className="absolute -top-6.5 left-0 bg-[#0D99FF] text-white font-mono text-[10px] px-2 py-0.5 rounded font-semibold whitespace-nowrap flex items-center gap-1 shadow-sm">
                <span>❖ {selectedFigmaElement.tagName}</span>
                {selectedFigmaElement.nodeId && (
                  <span className="opacity-75">#{selectedFigmaElement.nodeId}</span>
                )}
              </div>

              {/* Quick Action Floating Mini-Toolbar */}
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-[#1E1E1E] border border-white/20 rounded-lg shadow-2xl px-2 py-1 flex items-center gap-1.5 pointer-events-auto text-[11px] whitespace-nowrap z-30">
                <button
                  onClick={handleQuickAiPrompt}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 text-purple-300 font-semibold cursor-pointer"
                  title="Prompt AI to edit this item"
                >
                  <Sparkles size={11} className="text-purple-400" />
                  <span>Ask AI</span>
                </button>
                <div className="w-px h-3 bg-white/15" />
                <button
                  onClick={() => {
                    setRightOpen(true);
                    setInspectTab("properties");
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 text-zinc-300 cursor-pointer"
                  title="Inspect styles & CMS values"
                >
                  <Sliders size={11} className="text-[#0D99FF]" />
                  <span>Inspect</span>
                </button>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 rounded hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 cursor-pointer"
                  title="Deselect"
                >
                  <X size={11} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Signature Figma Make Command Bar */}
      <StudioFloatingPromptBar
        startGeneration={startGeneration}
        targetSection={targetSection}
      />
    </main>
  );
}
