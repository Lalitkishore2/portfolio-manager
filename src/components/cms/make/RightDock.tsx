import React, { useState } from 'react';
import { MousePointer2, Box, Move, Palette, Type, ChevronRight, Save, Sparkles } from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';
import { tokens } from './design-tokens';
import Editor from '@monaco-editor/react';

// Shared interfaces
export interface FigmaElement {
  id: string;
  tagName: string;
  className: string;
  path: string;
  rect: { top: number; left: number; width: number; height: number };
  styles: Record<string, string>;
  text: string;
  nodeId?: string;
}

interface RightDockProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  selectedFigmaElement: FigmaElement | null;
  setSelectedFigmaElement: React.Dispatch<React.SetStateAction<FigmaElement | null>>;
  saveContentEdits: (patch: any, fieldName?: string) => Promise<void>;
  rawCode: string;
  setRawCode: (code: string) => void;
  handleSaveCode: () => void;
  handleRevert: (version: any) => void;
  setPromptText: (text: string) => void;
}

function parseColorToHex(val: string): string {
  if (!val) return "#000000";
  if (val.startsWith("#")) return val.slice(0, 7);
  const match = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  if (val === "transparent") return "#ffffff";
  return "#000000";
}

function PropSection({ title, Icon, children }: { title: string; Icon: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-0.5">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 px-1 rounded-md hover:bg-[#141416] transition-colors cursor-pointer">
        <ChevronRight size={10} className={`text-[#333] transition-transform ${open ? "rotate-90" : ""}`} />
        <Icon size={10} className="text-[#555]" />
        <span className="text-[10px] font-bold text-[#666] uppercase tracking-wider">{title}</span>
        <div className="flex-1 h-px bg-[#1a1a1e] ml-1" />
      </button>
      {open && <div className="pl-4 pr-1 pb-2 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

function PropField({ label, value, onChange, onBlur, multiline = false, isColor = false }: {
  label: string; value: string; onChange: (val: string) => void; onBlur?: () => void; multiline?: boolean; isColor?: boolean;
}) {
  const displayLabel = label.replace(/([A-Z])/g, " $1").replace(/-/g, " ").toLowerCase();
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] text-[#3a3a3e] uppercase tracking-wide truncate" title={label}>{displayLabel}</label>
      {isColor ? (
        <div className="flex items-center gap-1.5">
          <input type="color" value={parseColorToHex(value)} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
            className="w-6 h-6 rounded cursor-pointer border border-[#222]" />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
            className="flex-1 bg-[#161618] border border-[#1e1e22] rounded-md px-2 py-1 text-[11px] text-[#ccc] outline-none focus:border-[#3B82F6] transition-colors font-mono" />
        </div>
      ) : multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          className="bg-[#161618] border border-[#1e1e22] rounded-md px-2 py-1 text-[11px] text-[#ccc] outline-none focus:border-[#3B82F6] transition-colors resize-none min-h-[48px] w-full" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          className="bg-[#161618] border border-[#1e1e22] rounded-md px-2 py-1 text-[11px] text-[#ccc] w-full outline-none focus:border-[#3B82F6] transition-colors" />
      )}
    </div>
  );
}

export function RightDock({ 
  iframeRef, 
  selectedFigmaElement, setSelectedFigmaElement, 
  saveContentEdits,
  rawCode, setRawCode, handleSaveCode,
  handleRevert, setPromptText
}: RightDockProps) {
  const { 
    rightOpen, 
    inspectTab, setInspectTab,
    selectedNodeId,
    siteDocument,
    updateSelectedNodeData,
    versions, currentVersionId,
    setLeftTab, setLeftOpen
  } = useMakeStore();

  if (!rightOpen) return null;

  function getNodeData() {
    if (!selectedNodeId || !siteDocument) return null;
    const [section, idOrIndex] = selectedNodeId.split(".");
    const data = siteDocument[section];
    if (!data) return null;
    if (Array.isArray(data)) return data.find((item: any, i: number) => item.slug === idOrIndex || i.toString() === idOrIndex) ?? null;
    return idOrIndex ? data[idOrIndex] : data;
  }

  const nodeData = getNodeData();

  return (
    <div className={`flex flex-col shrink-0 overflow-hidden transition-all duration-250 border-l`} style={{ borderColor: tokens.color.border.default, backgroundColor: tokens.color.bg.dock, width: tokens.layout.rightDockWidth }}>
      
      {/* Sub-tabs */}
      <div className={`flex border-b px-2 gap-1 pt-1 shrink-0`} style={{ borderColor: tokens.color.border.dark }}>
        {[
          { id: "properties" as const, label: "Properties" },
          { id: "code" as const, label: "JSON" },
          { id: "versions" as const, label: "Versions" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setInspectTab(id)}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-t-md border-b-2 transition-all cursor-pointer ${inspectTab === id ? "text-[#e0e0e0] bg-[#1a1a1e]" : "text-[#555] border-transparent hover:text-[#888]"}`}
            style={inspectTab === id ? { borderColor: tokens.color.border.active } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Properties Tab */}
      {inspectTab === "properties" && (
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2e transparent" }}>
          {!selectedFigmaElement ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#161618] border border-[#1e1e22] flex items-center justify-center">
                <MousePointer2 size={22} className="text-[#2a2a2e]" />
              </div>
              <div>
                <p className="text-[13px] text-[#555] font-medium mb-1">Nothing selected</p>
                <p className="text-[11px] text-[#333] leading-relaxed">Click any element in the canvas to inspect and edit its properties.</p>
              </div>
              <button onClick={() => { setLeftTab("layers"); setLeftOpen(true); iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SCAN_NODES" }, "*"); }}
                className="text-[11px] text-[#3B82F6] hover:underline cursor-pointer">
                Scan layers →
              </button>
            </div>
          ) : (
            <div className="p-3">
              {/* Header */}
              <div className="mb-3 pb-3 border-b border-[#1a1a1e] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/25 flex items-center justify-center shrink-0">
                  <Box size={13} className="text-[#3B82F6]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#ddd] truncate">{selectedFigmaElement.tagName}</p>
                  {selectedNodeId && <p className="text-[9px] font-mono text-[#444] truncate">{selectedNodeId}</p>}
                </div>
              </div>

              {/* Content section */}
              {nodeData && typeof nodeData === "object" && (
                <PropSection title="Content" Icon={Type}>
                  {Object.entries(nodeData)
                    .filter(([, v]) => typeof v === "string" || typeof v === "number" || Array.isArray(v))
                    .map(([key, value]) => (
                      <PropField key={key} label={key}
                        value={Array.isArray(value) ? (value as any[]).join(", ") : String(value)}
                        multiline={key === "description" || key === "overview"}
                        onChange={(val) => {
                          const final = key === "tags" ? val.split(",").map((s) => s.trim()) : val;
                          const oldVal = nodeData[key];
                          updateSelectedNodeData({ [key]: final });
                          iframeRef.current?.contentWindow?.postMessage({
                            type: "FIGMA_UPDATE_CONTENT",
                            payload: { field: key, oldValue: String(oldVal), newValue: String(final), nodeId: selectedNodeId }
                          }, "*");
                        }}
                        onBlur={() => {
                          const rawVal = nodeData[key];
                          saveContentEdits({ [key]: rawVal }, key);
                        }}
                      />
                    ))}
                </PropSection>
              )}

              {/* Layout CSS */}
              {(() => {
                const keys = ["padding", "margin", "display", "gap", "width", "height", "align", "justify", "flex", "position"];
                const fields = Object.entries(selectedFigmaElement.styles).filter(([k]) => keys.some((p) => k.toLowerCase().includes(p)));
                return fields.length > 0 ? (
                  <PropSection title="Layout" Icon={Move}>
                    {fields.map(([k, v]) => (
                      <PropField key={k} label={k} value={v} onChange={(val) => {
                        setSelectedFigmaElement((prev) => prev ? { ...prev, styles: { ...prev.styles, [k]: val } } : prev);
                        iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_UPDATE_STYLE", payload: { property: k, value: val } }, "*");
                      }} />
                    ))}
                  </PropSection>
                ) : null;
              })()}

              {/* Style CSS */}
              {(() => {
                const keys = ["background", "color", "border", "shadow", "opacity", "radius"];
                const fields = Object.entries(selectedFigmaElement.styles).filter(([k]) => keys.some((p) => k.toLowerCase().includes(p)));
                return fields.length > 0 ? (
                  <PropSection title="Style" Icon={Palette}>
                    {fields.map(([k, v]) => (
                      <PropField key={k} label={k} value={v}
                        isColor={k.toLowerCase().includes("color") || k.toLowerCase().includes("background")}
                        onChange={(val) => {
                          setSelectedFigmaElement((prev) => prev ? { ...prev, styles: { ...prev.styles, [k]: val } } : prev);
                          iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_UPDATE_STYLE", payload: { property: k, value: val } }, "*");
                        }} />
                    ))}
                  </PropSection>
                ) : null;
              })()}

              {/* Typography CSS */}
              {(() => {
                const keys = ["font", "line-height", "text-align", "letter-spacing", "text-transform"];
                const fields = Object.entries(selectedFigmaElement.styles).filter(([k]) => keys.some((p) => k.toLowerCase().includes(p)));
                return fields.length > 0 ? (
                  <PropSection title="Typography" Icon={Type}>
                    {fields.map(([k, v]) => (
                      <PropField key={k} label={k} value={v} onChange={(val) => {
                        setSelectedFigmaElement((prev) => prev ? { ...prev, styles: { ...prev.styles, [k]: val } } : prev);
                        iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_UPDATE_STYLE", payload: { property: k, value: val } }, "*");
                      }} />
                    ))}
                  </PropSection>
                ) : null;
              })()}

              {/* Commit via AI action */}
              <div className="pt-3 mt-1">
                <button onClick={() => {
                  setPromptText(`Update the ${selectedFigmaElement.tagName} element`);
                  // AI Make Bar takes focus
                }}
                  className="w-full py-2 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#3B82F6] text-[11px] font-medium hover:bg-[#3B82F6]/20 transition-colors cursor-pointer">
                  <Sparkles size={11} className="inline mr-1.5" />Improve with AI
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* JSON Tab */}
      {inspectTab === "code" && (
        <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
          <div className="flex-1 border border-[#1e1e22] rounded-lg overflow-hidden">
            <Editor height="100%" defaultLanguage="json" theme="vs-dark" value={rawCode}
              onChange={(val) => setRawCode(val || "")}
              options={{ minimap: { enabled: false }, fontSize: 11, wordWrap: "on", scrollBeyondLastLine: false, lineNumbers: "off", folding: true }} />
          </div>
          <button onClick={handleSaveCode}
            className="shrink-0 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#3B82F6] text-white text-[11px] font-medium hover:bg-[#2563EB] transition-colors cursor-pointer">
            <Save size={12} /> Save & Reload
          </button>
        </div>
      )}

      {/* Versions Tab */}
      {inspectTab === "versions" && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2e transparent" }}>
          {[...versions].reverse().map((v) => {
            const isCurrent = v.id === currentVersionId;
            return (
              <div key={v.id} onClick={() => handleRevert(v)}
                className={`rounded-xl border p-3 cursor-pointer transition-all ${isCurrent ? "bg-[#1a1a2e] border-[#3a3a6e]" : "bg-[#111113] border-[#1e1e22] hover:border-[#2a2a2e]"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[12px] font-bold ${isCurrent ? "text-white" : "text-[#aaa]"}`}>v{v.id}</span>
                  <span className="text-[10px] text-[#444]">{new Date(v.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] text-[#555] truncate">{v.label}</p>
                {!isCurrent && <span className="text-[10px] text-[#3B82F6] font-medium mt-1 block">↺ Revert to this</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
