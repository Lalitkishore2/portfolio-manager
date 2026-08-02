import React, { useRef, useEffect } from 'react';
import { Sparkles, Send, X, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';

interface AiMakeBarProps {
  startGeneration: () => Promise<void>;
}

export function AiMakeBar({ startGeneration }: AiMakeBarProps) {
  const { 
    chatOpen, setChatOpen,
    generationState,
    promptText, setPromptText,
    selectedNodeId, setSelectedNodeId,
    pendingImage, setPendingImage
  } = useMakeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1000;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            setPendingImage(dataUrl);
          }
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const showProcessing = generationState === "generating";

  const suggestionChips = selectedNodeId 
    ? ["Rewrite section", "Add metrics", "Update tech stack", "Style tweak"]
    : ["Add new project", "Update bio tagline", "Add skill category", "Add experience"];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] w-[640px] max-w-[92vw] gap-2">
      
      {/* Quick Suggestion Chips */}
      {!showProcessing && (
        <div className="flex items-center gap-1.5 pointer-events-auto overflow-x-auto max-w-full px-2 py-0.5 no-scrollbar">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setPromptText(chip.replace(/^[^\s]+\s/, ""));
              }}
              className="text-[11px] bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 rounded-full border border-white/10 shadow-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer backdrop-blur-md"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* The Floating Prompter (Pill) */}
      <div className={`w-full bg-[#18181b]/95 backdrop-blur-2xl border ${showProcessing ? 'border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.25)]' : 'border-white/10 shadow-2xl'} rounded-full px-3 py-2 flex items-center gap-2.5 relative pointer-events-auto transition-all duration-300`}>
        
        {/* Shimmer Effect */}
        {showProcessing && (
           <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent w-[200%] animate-[shimmer_2s_infinite] -skew-x-12" />
           </div>
        )}

        <div className="pl-1 z-10 flex items-center gap-2">
           <Sparkles size={16} className={showProcessing ? "text-fuchsia-400 animate-pulse" : "text-violet-400"} />
        </div>

        <div className="flex-1 flex items-center gap-2 z-10 min-w-0">
          {selectedNodeId && (
            <div className="flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/40 rounded-full px-3 py-1 shadow-sm shrink-0">
              <span className="text-[11px] text-zinc-200 font-medium capitalize">Editing {selectedNodeId.split('.')[0]}</span>
              <button onClick={() => setSelectedNodeId(null)} className="ml-1 text-zinc-400 hover:text-white"><X size={12} /></button>
            </div>
          )}
          
          {pendingImage && (
            <div className="relative group shrink-0 ml-1">
              <img src={pendingImage} alt="Attachment" className="h-6 w-6 object-cover rounded-full border border-white/20" />
              <button onClick={() => setPendingImage(null)} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={10}/></button>
            </div>
          )}

          <input 
            type="text" 
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && promptText.trim()) startGeneration(); }}
            placeholder={selectedNodeId ? "What should Make change in this section?" : "What do you want to make or update?"}
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-zinc-100 placeholder:text-zinc-500 min-w-0 font-medium"
            disabled={showProcessing}
          />

          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors rounded-full hover:bg-white/5" 
              disabled={showProcessing}
              title="Attach image context"
            >
              <ImageIcon size={15} />
            </button>

            {!chatOpen && (
              <button 
                onClick={() => setChatOpen(true)} 
                className="p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors rounded-full hover:bg-white/5"
                title="Open Make Chat panel"
              >
                <MessageSquare size={15} />
              </button>
            )}

            <button 
              onClick={startGeneration} 
              disabled={!promptText.trim() || showProcessing} 
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ml-1 active:scale-95 ${
                promptText.trim() && !showProcessing 
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:brightness-110 shadow-violet-500/25" 
                  : "bg-white/10 text-zinc-600"
              }`}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
