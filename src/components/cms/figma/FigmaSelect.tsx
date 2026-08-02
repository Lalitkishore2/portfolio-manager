import React, { SelectHTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronDown } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FigmaSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
}

export const FigmaSelect = React.forwardRef<HTMLSelectElement, FigmaSelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "flex h-9 w-full appearance-none rounded-md border border-white/10 bg-black/40 px-3 py-1 pr-8 text-sm text-zinc-100 shadow-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    );
  }
);
FigmaSelect.displayName = "FigmaSelect";
