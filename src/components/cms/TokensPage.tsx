import React, { useState } from "react";
import { FigmaCard, FigmaCardHeader, FigmaCardTitle, FigmaCardContent } from "./figma/FigmaCard";
import { FigmaInput } from "./figma/FigmaInput";
import { Save } from "lucide-react";
import { toast } from "sonner";

export function TokensPage() {
  const [tokens, setTokens] = useState({
    primary: "#2D5BFF",
    background: "#0A0A0A",
    surface: "#111111",
    textMain: "#FAFAFA",
    textMuted: "#A1A1AA",
    fontPrimary: "Inter",
    fontMono: "JetBrains Mono",
  });

  const handleSave = () => {
    // In a real app, this would save to a JSON file or API and trigger a CSS rebuild
    toast.success("Design tokens saved successfully!");
  };

  return (
    <div style={{ flex: 1, padding: "40px 60px", overflowY: "auto", background: "#09090b" }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Design Tokens</h1>
          <p className="text-zinc-400 text-sm">Manage global variables and theme settings synced directly to the portfolio.</p>
        </div>

        <FigmaCard>
          <FigmaCardHeader>
            <FigmaCardTitle>Color Palette</FigmaCardTitle>
          </FigmaCardHeader>
          <FigmaCardContent className="grid grid-cols-2 gap-6">
            <FigmaInput 
              label="Primary Accent" 
              value={tokens.primary}
              onChange={(e) => setTokens({ ...tokens, primary: e.target.value })}
              icon={<div style={{width: 12, height: 12, borderRadius: "50%", background: tokens.primary}} />}
            />
            <FigmaInput 
              label="Background Base" 
              value={tokens.background}
              onChange={(e) => setTokens({ ...tokens, background: e.target.value })}
              icon={<div style={{width: 12, height: 12, borderRadius: "50%", background: tokens.background}} />}
            />
            <FigmaInput 
              label="Surface (Cards/Sidebars)" 
              value={tokens.surface}
              onChange={(e) => setTokens({ ...tokens, surface: e.target.value })}
              icon={<div style={{width: 12, height: 12, borderRadius: "50%", background: tokens.surface}} />}
            />
          </FigmaCardContent>
        </FigmaCard>

        <FigmaCard>
          <FigmaCardHeader>
            <FigmaCardTitle>Typography</FigmaCardTitle>
          </FigmaCardHeader>
          <FigmaCardContent className="grid grid-cols-2 gap-6">
            <FigmaInput 
              label="Primary Font" 
              value={tokens.fontPrimary}
              onChange={(e) => setTokens({ ...tokens, fontPrimary: e.target.value })}
            />
            <FigmaInput 
              label="Monospace Font" 
              value={tokens.fontMono}
              onChange={(e) => setTokens({ ...tokens, fontMono: e.target.value })}
            />
          </FigmaCardContent>
        </FigmaCard>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Save size={16} />
            Save Tokens
          </button>
        </div>
      </div>
    </div>
  );
}
