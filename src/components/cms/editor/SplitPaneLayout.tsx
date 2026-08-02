import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface SplitPaneLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultLayout?: [number, number];
}

export function SplitPaneLayout({ leftPanel, rightPanel, defaultLayout = [50, 50] }: SplitPaneLayoutProps) {
  return (
    <div style={{ height: "100%", width: "100%", display: "flex", overflow: "hidden" }}>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={defaultLayout[0]} minSize={30}>
          <div style={{ height: "100%", overflowY: "auto", position: "relative" }}>
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
  );
}
