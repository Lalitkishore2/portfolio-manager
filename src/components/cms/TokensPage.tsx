import React, { useState, useEffect } from "react";
import { FigmaCard, FigmaCardHeader, FigmaCardTitle, FigmaCardContent } from "./figma/FigmaCard";
import { FigmaInput } from "./figma/FigmaInput";
import { Save, Loader2, Check } from "lucide-react";
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
  const [sha, setSha] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadTokens() {
      try {
        const res = await fetch("/api/tokens");
        if (res.ok) {
          const { data, sha: tokenSha } = await res.json();
          if (data && typeof data === "object") {
            setTokens((prev) => ({ ...prev, ...data }));
            setSha(tokenSha || "");
          }
        }
      } catch (e) {
        console.error("Failed to load tokens", e);
      }
    }
    loadTokens();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: tokens, sha }),
      });
      if (!res.ok) throw new Error("Failed to save tokens");
      const { sha: newSha } = await res.json();
      setSha(newSha);
      setSaved(true);
      toast.success("Design tokens saved successfully!");
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      toast.error("Failed to save design tokens");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: "40px 60px", overflowY: "auto", background: "#09090b" }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Design Tokens</h1>
          <p className="text-zinc-400 text-sm">Manage global variables and theme settings synced directly to tokens.json.</p>
        </div>

        <FigmaCard>
          <FigmaCardHeader>
            <div className="flex items-center justify-between">
              <FigmaCardTitle>Color Palette &amp; Presets</FigmaCardTitle>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTokens({
                      ...tokens,
                      primary: "#FF84BA",
                      background: "#FFEFE3",
                      surface: "#FFFFFF",
                      textMain: "#111111",
                      textMuted: "#6b7280",
                    })
                  }
                  className="px-2.5 py-1 text-xs bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded hover:bg-pink-500/30 transition-colors"
                >
                  Pastel Sweet
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTokens({
                      ...tokens,
                      primary: "#2D5BFF",
                      background: "#0A0A0A",
                      surface: "#111111",
                      textMain: "#FAFAFA",
                      textMuted: "#A1A1AA",
                    })
                  }
                  className="px-2.5 py-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded hover:bg-blue-500/30 transition-colors"
                >
                  Obsidian Dark
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTokens({
                      ...tokens,
                      primary: "#10B981",
                      background: "#064E3B",
                      surface: "#047857",
                      textMain: "#ECFDF5",
                      textMuted: "#A7F3D0",
                    })
                  }
                  className="px-2.5 py-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded hover:bg-emerald-500/30 transition-colors"
                >
                  Emerald Cyber
                </button>
              </div>
            </div>
          </FigmaCardHeader>
          <FigmaCardContent className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.primary || "#2D5BFF"}
                onChange={(e) => setTokens({ ...tokens, primary: e.target.value })}
                className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <div className="flex-1">
                <FigmaInput
                  label="Primary Accent"
                  value={tokens.primary}
                  onChange={(e) => setTokens({ ...tokens, primary: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.background || "#0A0A0A"}
                onChange={(e) => setTokens({ ...tokens, background: e.target.value })}
                className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <div className="flex-1">
                <FigmaInput
                  label="Background Base"
                  value={tokens.background}
                  onChange={(e) => setTokens({ ...tokens, background: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.surface || "#111111"}
                onChange={(e) => setTokens({ ...tokens, surface: e.target.value })}
                className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <div className="flex-1">
                <FigmaInput
                  label="Surface (Cards/Sidebars)"
                  value={tokens.surface}
                  onChange={(e) => setTokens({ ...tokens, surface: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.textMain || "#FAFAFA"}
                onChange={(e) => setTokens({ ...tokens, textMain: e.target.value })}
                className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <div className="flex-1">
                <FigmaInput
                  label="Main Text Color"
                  value={tokens.textMain || "#FAFAFA"}
                  onChange={(e) => setTokens({ ...tokens, textMain: e.target.value })}
                />
              </div>
            </div>
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
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : saved ? "Saved Tokens" : "Save Tokens"}
          </button>
        </div>
      </div>
    </div>
  );
}
