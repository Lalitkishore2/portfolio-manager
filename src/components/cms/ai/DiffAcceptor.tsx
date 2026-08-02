import React from "react";
import { Check, X } from "lucide-react";

interface DiffAcceptorProps {
  originalText: string;
  proposedText: string;
  onAccept: () => void;
  onReject: () => void;
}

export function DiffAcceptor({ originalText, proposedText, onAccept, onReject }: DiffAcceptorProps) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5 my-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-blue-400">AI Suggested Changes</h4>
        <div className="flex gap-2">
          <button 
            onClick={onReject}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={12} /> Reject
          </button>
          <button 
            onClick={onAccept}
            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <Check size={12} /> Accept
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Original</span>
          <div className="p-3 rounded bg-red-950/20 border border-red-900/30 text-zinc-300 line-through opacity-70">
            {originalText || "Empty"}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Proposed</span>
          <div className="p-3 rounded bg-green-950/20 border border-green-900/30 text-green-100">
            {proposedText || "Empty"}
          </div>
        </div>
      </div>
    </div>
  );
}
