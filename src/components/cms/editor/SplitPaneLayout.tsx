import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { FileEdit, Eye } from "lucide-react";

interface SplitPaneLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultLayout?: [number, number];
}

export function SplitPaneLayout({ leftPanel, rightPanel, defaultLayout = [50, 50] }: SplitPaneLayoutProps) {
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Mobile view toggle header (Visible on screens < 768px) */}
      <div className="md:hidden flex items-center justify-between p-2 border-b border-white/10 bg-zinc-950 shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 12px",
            background: mobileTab === "editor" ? "#2563eb" : "transparent",
            border: mobileTab === "editor" ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: mobileTab === "editor" ? "#ffffff" : "#a1a1aa",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <FileEdit size={14} />
          <span>Project Editor</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 12px",
            background: mobileTab === "preview" ? "#2563eb" : "transparent",
            border: mobileTab === "preview" ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: mobileTab === "preview" ? "#ffffff" : "#a1a1aa",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Eye size={14} />
          <span>Live Case Preview</span>
        </button>
      </div>

      {/* Mobile view content container */}
      <div className="md:hidden flex-1 relative overflow-hidden">
        {mobileTab === "editor" ? (
          <div style={{ height: "100%", width: "100%", overflowY: "auto", overflowX: "hidden" }}>
            {leftPanel}
          </div>
        ) : (
          <div style={{ height: "100%", width: "100%", background: "#050505", display: "flex", flexDirection: "column" }}>
            <div style={{
              height: "36px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#888",
              backgroundColor: "#111"
            }}>
              Live Case Preview
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              {rightPanel}
            </div>
          </div>
        )}
      </div>

      {/* Desktop dual-pane split view (Visible on screens >= 768px) */}
      <div className="hidden md:flex flex-1 relative overflow-hidden w-full h-full">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={defaultLayout[0]} minSize={30}>
            <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", position: "relative", minWidth: 0 }}>
              {leftPanel}
            </div>
          </Panel>
          
          <PanelResizeHandle style={{
            width: "4px",
            background: "rgba(255,255,255,0.05)",
            cursor: "col-resize",
            transition: "background 0.2s"
          }} onMouseEnter={(e) => {
            (e.currentTarget as unknown as HTMLElement).style.background = "#2D5BFF";
          }} onMouseLeave={(e) => {
            (e.currentTarget as unknown as HTMLElement).style.background = "rgba(255,255,255,0.05)";
          }} />

          <Panel defaultSize={defaultLayout[1]} minSize={30}>
            <div style={{ height: "100%", background: "#050505", display: "flex", flexDirection: "column" }}>
              <div style={{ 
                height: "40px", 
                borderBottom: "1px solid rgba(255,255,255,0.1)", 
                display: "flex", 
                alignItems: "center", 
                padding: "0 16px",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#888",
                backgroundColor: "#111"
              }}>
                Live Preview
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                {rightPanel}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
