import React, { InputHTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FigmaInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FigmaInput = React.forwardRef<HTMLInputElement, FigmaInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-zinc-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-9 w-full rounded-md border border-white/10 bg-black/40 px-3 py-1 text-sm text-zinc-100 shadow-sm transition-colors",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-zinc-600",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-9",
              error && "border-red-500/50 focus-visible:ring-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-[11px] text-red-500">{error}</span>}
      </div>
    );
  }
);
FigmaInput.displayName = "FigmaInput";
