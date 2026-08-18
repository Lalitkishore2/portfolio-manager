import React, { useState } from 'react';
import { 
  Layers, FileText, ChevronRight, Box, Type, Search, Eye, Sparkles, Folder, 
  X, Grid, Image, Component, Layout, AlignLeft, Hash, Plus, RefreshCw
} from 'lucide-react';
import { useMakeStore } from '@/store/makeStore';

interface StudioLeftTreeProps {
  layerNodes: string[];
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export function StudioLeftTree({ layerNodes, iframeRef }: StudioLeftTreeProps) {
  const { 
    leftOpen, setLeftOpen,
    leftTab, setLeftTab,
    selectedNodeId, setSelectedNodeId,
    siteDocument,
    setRightOpen, setInspectTab
  } = useMakeStore();

  const [search, setSearch] = useState("");

  if (!leftOpen) return null;

  // Default page component hierarchy if no dynamic nodes are scanned yet
  const defaultHierarchy = [
    {
      id: "hero",
      label: "HeroSection",
      type: "component",
      tag: "section",
      children: [
        { id: "hero.title", label: "Title (Name)", type: "text", tag: "h1" },
        { id: "hero.tagline", label: "Tagline Pill", type: "text", tag: "p" },
        { id: "hero.bio", label: "Sub-Bio Paragraph", type: "text", tag: "p" },
        { id: "hero.cta", label: "CTA Action Buttons", type: "frame", tag: "div" }
      ]
    },
    {
      id: "featured-projects",
      label: "Featured Projects",
      type: "component",
      tag: "section",
      children: (siteDocument?.projects || []).slice(0, 4).map((p: any) => ({
        id: `projects.${p.slug}`,
        label: `ProjectCard (${p.title?.split("—")[0]?.trim() || p.slug})`,
        type: "component",
        tag: "article"
      }))
    },
    {
      id: "skills",
      label: "Skills Matrix",
      type: "component",
      tag: "section",
      children: (siteDocument?.skills || []).map((s: any, i: number) => ({
        id: `skills.${s.category?.toLowerCase().replace(/\s+/g, '-') || i}`,
        label: `Category (${s.category})`,
        type: "frame",
        tag: "div"
      }))
    },
    {
      id: "experience",
      label: "Experience Timeline",
      type: "component",
      tag: "section",
      children: (siteDocument?.experience || []).map((e: any, i: number) => ({
        id: `experience.${i}`,
        label: `${e.title} @ ${e.org}`,
        type: "frame",
        tag: "div"
      }))
    },
    {
      id: "about",
      label: "About & Profile",
      type: "component",
      tag: "section",
      children: [
        { id: "profile.photo", label: "Avatar & Badges", type: "frame", tag: "div" },
        { id: "profile.bio", label: "Full Bio & Stats", type: "text", tag: "div" }
      ]
    },
    {
      id: "contact",
      label: "Contact & Footer",
      type: "component",
      tag: "section"
    }
  ];

  const sections = [
    { id: "projects", label: "Projects Database", count: siteDocument?.projects?.length || 0, icon: Grid },
    { id: "profile", label: "Profile & Bio", count: 1, icon: AlignLeft },
    { id: "skills", label: "Skills Grid", count: siteDocument?.skills?.length || 0, icon: Component },
    { id: "experience", label: "Experience Timeline", count: siteDocument?.experience?.length || 0, icon: Layout },
    { id: "chatbot", label: "Chatbot Knowledge", count: siteDocument?.chatbot?.knowledgeBase?.length || 0, icon: Sparkles },
    { id: "tokens", label: "Design Tokens", count: 7, icon: Hash }
  ];

  function handleSelectNode(nodeId: string) {
    setSelectedNodeId(nodeId);
    setRightOpen(true);
    setInspectTab("properties");
    // Send message to iframe to highlight and scroll
    iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SELECT_NODE", payload: nodeId }, "*");
  }

  function handleScanTree() {
    iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SCAN_NODES" }, "*");
  }

  return (
    <>
      {/* Mobile Backdrop Overlay (< md screens) */}
      <div 
        onClick={() => setLeftOpen(false)}
        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-35"
      />

      {/* Main Left Dock Container */}
      <aside className="fixed md:relative top-12 md:top-0 bottom-6 md:bottom-0 left-0 w-72 md:w-60 bg-[#242424] border-r border-white/[0.08] flex flex-col shrink-0 h-[calc(100vh-48px)] md:h-full overflow-hidden select-none z-40 shadow-2xl transition-all">
        {/* Header Tabs: Layers | Pages */}
        <div className="flex border-b border-white/[0.08] bg-[#1E1E1E] p-1 gap-1 shrink-0">
          <button
            onClick={() => setLeftTab("layers")}
            className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              leftTab === "layers" ? "bg-[#2C2C2C] text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers size={12} className={leftTab === "layers" ? "text-[#0D99FF]" : ""} />
            <span>Layers</span>
          </button>

          <button
            onClick={() => setLeftTab("pages")}
            className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              leftTab === "pages" ? "bg-[#2C2C2C] text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText size={12} className={leftTab === "pages" ? "text-purple-400" : ""} />
            <span>Pages</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-2 border-b border-white/[0.04] shrink-0 bg-[#1E1E1E]/50">
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={leftTab === "layers" ? "Filter layers…" : "Search sections…"}
              className="w-full pl-7 pr-2.5 py-1 bg-[#1E1E1E] border border-white/[0.08] rounded-md text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#0D99FF] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Tree Content Area */}
        <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5 no-scrollbar text-zinc-300">
          {leftTab === "pages" ? (
            /* PAGES / CMS COLLECTIONS */
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">CMS Collections</div>
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isSelected = selectedNodeId?.startsWith(sec.id);
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setSelectedNodeId(`${sec.id}.root`);
                      setRightOpen(true);
                      setInspectTab("properties");
                      iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SCROLL_TO", payload: sec.id }, "*");
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0D99FF]/20 text-[#0D99FF] font-semibold border border-[#0D99FF]/30"
                        : "hover:bg-white/[0.06] text-zinc-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={isSelected ? "text-[#0D99FF]" : "text-purple-400"} />
                      <span>{sec.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 font-semibold">
                      {sec.count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* LAYER HIERARCHY TREE */
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Page Tree</span>
                <button
                  onClick={handleScanTree}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
                  title="Rescan Live DOM"
                >
                  <RefreshCw size={9} />
                  <span>Scan</span>
                </button>
              </div>

              {defaultHierarchy.map((group) => {
                const isGroupSelected = selectedNodeId === group.id;
                return (
                  <div key={group.id} className="flex flex-col gap-0.5">
                    {/* Section Level Group */}
                    <button
                      onClick={() => handleSelectNode(group.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer truncate ${
                        isGroupSelected
                          ? "bg-[#0D99FF]/20 text-[#0D99FF] font-semibold border border-[#0D99FF]/30"
                          : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Component size={12} className={isGroupSelected ? "text-[#0D99FF]" : "text-purple-400 shrink-0"} />
                      <span className="truncate">{group.label}</span>
                    </button>

                    {/* Children elements */}
                    {group.children && (
                      <div className="pl-4 flex flex-col gap-0.5 border-l border-white/[0.06] ml-2.5 my-0.5">
                        {group.children.map((child: any) => {
                          const isChildSelected = selectedNodeId === child.id;
                          const ChildIcon = child.type === "text" ? Type : child.type === "component" ? Component : Box;

                          return (
                            <button
                              key={child.id}
                              onClick={() => handleSelectNode(child.id)}
                              className={`w-full text-left px-2 py-1 rounded-md flex items-center gap-1.5 text-[11px] font-mono transition-all cursor-pointer truncate ${
                                isChildSelected
                                  ? "bg-[#0D99FF]/25 text-[#0D99FF] font-semibold border border-[#0D99FF]/30"
                                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                              }`}
                            >
                              <ChildIcon size={11} className={isChildSelected ? "text-[#0D99FF]" : "text-zinc-500 shrink-0"} />
                              <span className="truncate">{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
