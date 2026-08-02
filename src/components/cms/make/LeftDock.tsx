import React from 'react';
import { FileText, Layers, Box, Palette, Clock, Type } from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';
import { tokens } from './design-tokens';

interface LeftDockProps {
  layerNodes: string[];
  onRefreshLayers: () => void;
  onSelectNode: (nid: string) => void;
  onScrollTo: (section: string) => void;
}

export function nodeLabelFromId(nid: string, doc: any) {
  const [section, idOrIndex] = nid.split(".");
  if (!doc || !doc[section]) return nid;
  const data = doc[section];

  if (Array.isArray(data)) {
    const item = data.find((x: any, i: number) => x.slug === idOrIndex || i.toString() === idOrIndex);
    if (item) return item.title || item.name || item.company || item.description || nid;
  }
  return nid;
}

export function LeftDock({ layerNodes, onRefreshLayers, onSelectNode, onScrollTo }: LeftDockProps) {
  const { leftOpen, leftTab, setLeftTab, siteDocument, selectedNodeId } = useMakeStore();

  if (!leftOpen) return null;

  return (
    <div className={`flex flex-col shrink-0 overflow-hidden transition-all duration-250 border-r`} style={{ borderColor: tokens.color.border.default, backgroundColor: tokens.color.bg.dock, width: tokens.layout.leftDockWidth }}>
      
      {/* Dock tabs */}
      <div className={`flex border-b shrink-0`} style={{ borderColor: tokens.color.border.dark }}>
        {[
          { id: "pages" as const, Icon: FileText, label: "Pages" },
          { id: "layers" as const, Icon: Layers, label: "Layers" },
        ].map(({ id, Icon, label }) => (
          <button key={id} onClick={() => setLeftTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium border-b-2 transition-all cursor-pointer ${leftTab === id ? `text-[#e0e0e0] border-[#3B82F6]` : "text-[#555] border-transparent hover:text-[#999]"}`}>
            <Icon size={11} />{label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2e transparent" }}>
        
        {/* PAGES TAB */}
        {leftTab === "pages" && (
          <div className="p-3">
            <div className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-3 pl-1">Site Structure</div>
            {["Home", "Projects", "Experience", "Skills", "Profile", "Contact"].map((page) => {
              const key = page.toLowerCase();
              const isData = Object.keys(siteDocument).includes(key);
              return (
                <button key={page} onClick={() => onScrollTo(key)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all border border-transparent mb-0.5 text-[#888] hover:bg-[#161618] hover:text-[#bbb]">
                  <FileText size={11} className="text-[#555]" />
                  <span>{page}</span>
                  {isData && <span className="ml-auto text-[9px] text-[#444] bg-[#1a1a1a] px-1 rounded">data</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* LAYERS TAB */}
        {leftTab === "layers" && (
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Canvas Layers</span>
              <button 
                className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                onClick={onRefreshLayers}
              >
                Scan Canvas
              </button>
            </div>
            {layerNodes.length === 0 ? (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] text-zinc-500 font-mono">SECTIONS (DEFAULT)</div>
                {[
                  { id: "profile", label: "Hero Section", Icon: Type },
                  { id: "projects", label: "Featured Projects", Icon: Box },
                  { id: "skills", label: "Skills Grid", Icon: Palette },
                  { id: "experience", label: "Experience Timeline", Icon: Clock },
                ].map(({ id, label, Icon }) => {
                  const isActive = selectedNodeId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onSelectNode(id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all ${
                        isActive 
                          ? "bg-violet-600/20 text-violet-200 border border-violet-500/40" 
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <Icon size={12} className={isActive ? "text-violet-400" : "text-zinc-500"} />
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              layerNodes.map((nid) => {
                const sec = nid.split(".")[0];
                const Icon = sec === "projects" ? Box : sec === "skills" ? Palette : sec === "experience" ? Clock : Type;
                const isActive = selectedNodeId === nid;
                return (
                  <button key={nid}
                    onClick={() => onSelectNode(nid)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all mb-0.5 ${isActive ? "bg-violet-600/20 text-violet-200 border border-violet-500/40" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"}`}>
                    <Icon size={11} className={isActive ? "text-violet-400 shrink-0" : "text-zinc-500 shrink-0"} />
                    <span className="font-mono truncate">{nodeLabelFromId(nid, siteDocument)}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
