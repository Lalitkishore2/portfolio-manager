import React from "react";
import { Sparkles, Wand2, CheckCheck, BarChart2, Palette, X } from "lucide-react";
import { useMakeStore } from "@/store/makeStore";

interface QuickActionsTooltipProps {
  selectedNodeId: string | null;
  onClearSelection: () => void;
  onRunQuickAction: (actionPrompt: string) => void;
}

export function QuickActionsTooltip({
  selectedNodeId,
  onClearSelection,
  onRunQuickAction,
}: QuickActionsTooltipProps) {
  if (!selectedNodeId) return null;

  const [section, idOrIndex] = selectedNodeId.split(".");
  const label = idOrIndex ? `${section}: ${idOrIndex}` : section;

  const actions = [
    { label: "Rewrite", icon: <Wand2 size={12} />, prompt: "Rewrite this content to sound crisp, modern, and high-impact." },
    { label: "Fix Grammar", icon: <CheckCheck size={12} />, prompt: "Fix any grammar, spelling, or phrasing issues in this section." },
    { label: "Add Metric", icon: <BarChart2 size={12} />, prompt: "Add concrete performance metrics or quantified results to this content." },
    { label: "Enhance Style", icon: <Palette size={12} />, prompt: "Improve formatting, tag selection, and visual presentation accents." },
  ];

  return (
    <div className="absolute top-11 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="flex items-center gap-1.5 pl-1 pr-2 border-r border-white/10 text-[11px] text-fuchsia-400 font-medium">
        <Sparkles size={13} />
        <span className="text-zinc-200 capitalize font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
          {label}
        </span>
        <button
          onClick={onClearSelection}
          className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded-full hover:bg-white/10 transition-colors ml-0.5"
          title="Deselect"
        >
          <X size={12} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {actions.map((act) => (
          <button
            key={act.label}
            onClick={() => onRunQuickAction(act.prompt)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-full transition-all active:scale-95 cursor-pointer"
          >
            {act.icon}
            <span>{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
