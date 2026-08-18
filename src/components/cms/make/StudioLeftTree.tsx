import React, { useState } from 'react';
import { 
  Layers, FileText, ChevronRight, ChevronDown, Box, Type, Search, Eye, EyeOff, Lock,
  Sparkles, Folder, X, Grid, Image, Component, Layout, AlignLeft, Hash, Plus, RefreshCw
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

  const [activeTab, setActiveTab] = useState<"layers" | "pages" | "components">("layers");
  const [search, setSearch] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [hiddenNodes, setHiddenNodes] = useState<Record<string, boolean>>({});

  if (!leftOpen) return null;

  const toggleSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenNodes(prev => ({ ...prev, [id]: !prev[id] }));
    iframeRef.current?.contentWindow?.postMessage({
      type: "FIGMA_TOGGLE_VISIBILITY",
      payload: { nodeId: id, hidden: !hiddenNodes[id] }
    }, "*");
  };

  // Structured layer tree for the Deconstructivist Portfolio
  const layerHierarchy = [
    {
      id: "hero",
      label: "HeroSection",
      type: "component",
      tag: "section",
      children: [
        { id: "hero.title", label: "Heading (Title)", type: "text", tag: "h1" },
        { id: "hero.tagline", label: "Tagline Pill", type: "text", tag: "p" },
        { id: "hero.bio", label: "Bio Paragraph", type: "text", tag: "p" },
        { id: "hero.cta", label: "CTA Action Buttons", type: "frame", tag: "div" }
      ]
    },
    {
      id: "featured-projects",
      label: "Featured Projects Grid",
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

  const pages = [
    { id: "index", label: "Home", path: "/", icon: FileText, count: "6 frames" },
    { id: "projects", label: "Projects", path: "/projects", icon: Grid, count: `${siteDocument?.projects?.length || 0} items` },
    { id: "case/aquadot", label: "AquaDot Case Study", path: "/case/aquadot", icon: FileText, count: "Deep Dive" },
    { id: "case/smartflow", label: "SmartFlow IV Study", path: "/case/smartflow-div", icon: FileText, count: "Deep Dive" }
  ];

  const designSystemComponents = [
    { name: "HeroSection", desc: "Deconstructivist bold hero with animated avatar", tag: "hero" },
    { name: "ProjectCard", desc: "Interactive project showcase card with live tag pill", tag: "featured-projects" },
    { name: "SkillChip", desc: "Edge AI & Web technologies chip matrix", tag: "skills" },
    { name: "TimelineItem", desc: "Experience & education milestones list", tag: "experience" },
    { name: "ContactSection", desc: "Interactive query form & social connects", tag: "contact" },
    { name: "DesignTokens", desc: "Primary, background, surface & typography tokens", tag: "tokens" }
  ];

  function handleSelectNode(nodeId: string) {
    setSelectedNodeId(nodeId);
    setRightOpen(true);
    setInspectTab("properties");
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
      <aside className="fixed md:relative top-12 md:top-0 bottom-6 md:bottom-0 left-0 w-72 md:w-64 bg-[#242424] border-r border-white/[0.08] flex flex-col shrink-0 h-[calc(100vh-48px)] md:h-full overflow-hidden select-none z-40 shadow-2xl transition-all">
        {/* Header 3-Tab Strip: Layers | Pages | Components */}
        <div className="flex border-b border-white/[0.08] bg-[#1E1E1E] p-1 gap-0.5 shrink-0">
          <button
            onClick={() => setActiveTab("layers")}
            className={`flex-1 py-1 px-1 flex items-center justify-center gap-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "layers" ? "bg-[#2C2C2C] text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers size={11} className={activeTab === "layers" ? "text-[#0D99FF]" : ""} />
            <span>Layers</span>
          </button>

          <button
            onClick={() => setActiveTab("pages")}
            className={`flex-1 py-1 px-1 flex items-center justify-center gap-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "pages" ? "bg-[#2C2C2C] text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText size={11} className={activeTab === "pages" ? "text-purple-400" : ""} />
            <span>Pages</span>
          </button>

          <button
            onClick={() => setActiveTab("components")}
            className={`flex-1 py-1 px-1 flex items-center justify-center gap-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "components" ? "bg-[#2C2C2C] text-white shadow-sm border border-white/10" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Component size={11} className={activeTab === "components" ? "text-emerald-400" : ""} />
            <span>Assets</span>
          </button>
        </div>

        {/* Search Filter Bar */}
        <div className="p-2 border-b border-white/[0.04] shrink-0 bg-[#1E1E1E]/50">
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "layers" ? "Filter layers…" : activeTab === "pages" ? "Search pages…" : "Search design assets…"}
              className="w-full pl-7 pr-2.5 py-1 bg-[#1E1E1E] border border-white/[0.08] rounded-md text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#0D99FF] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Tree & List Content Area */}
        <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5 no-scrollbar text-zinc-300">
          {/* TAB 1: LAYERS TREE (True Figma Style with Collapse Arrows & Eyeballs) */}
          {activeTab === "layers" && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Page Layers</span>
                <button
                  onClick={handleScanTree}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
                  title="Rescan Live DOM"
                >
                  <RefreshCw size={9} />
                  <span>Scan</span>
                </button>
              </div>

              {layerHierarchy.map((group) => {
                const isGroupSelected = selectedNodeId === group.id;
                const isCollapsed = !!collapsedSections[group.id];
                const isHidden = !!hiddenNodes[group.id];

                return (
                  <div key={group.id} className="flex flex-col gap-0.5">
                    {/* Section Level Node */}
                    <div
                      onClick={() => handleSelectNode(group.id)}
                      className={`w-full px-1.5 py-1 rounded-md flex items-center justify-between text-xs font-medium transition-all cursor-pointer group ${
                        isGroupSelected
                          ? "bg-[#0D99FF]/20 text-[#0D99FF] font-semibold border-l-2 border-[#0D99FF]"
                          : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        {group.children ? (
                          <button
                            onClick={(e) => toggleSection(group.id, e)}
                            className="p-0.5 text-zinc-500 hover:text-zinc-200"
                          >
                            {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                          </button>
                        ) : (
                          <div className="w-3" />
                        )}
                        <Component size={12} className={isGroupSelected ? "text-[#0D99FF]" : "text-purple-400 shrink-0"} />
                        <span className="truncate">{group.label}</span>
                      </div>

                      {/* Visibility Eyeball */}
                      <button
                        onClick={(e) => toggleVisibility(group.id, e)}
                        className={`p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-200 transition-opacity ${
                          isHidden ? "opacity-100 text-zinc-600" : ""
                        }`}
                        title={isHidden ? "Show layer" : "Hide layer"}
                      >
                        {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                    </div>

                    {/* Nested Children elements */}
                    {!isCollapsed && group.children && (
                      <div className="pl-4 flex flex-col gap-0.5 border-l border-white/[0.06] ml-3 my-0.5">
                        {group.children.map((child: any) => {
                          const isChildSelected = selectedNodeId === child.id;
                          const isChildHidden = !!hiddenNodes[child.id];
                          const ChildIcon = child.type === "text" ? Type : child.type === "component" ? Component : Box;

                          return (
                            <div
                              key={child.id}
                              onClick={() => handleSelectNode(child.id)}
                              className={`w-full px-1.5 py-1 rounded-md flex items-center justify-between text-[11px] font-mono transition-all cursor-pointer group ${
                                isChildSelected
                                  ? "bg-[#0D99FF]/25 text-[#0D99FF] font-semibold border-l-2 border-[#0D99FF]"
                                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 truncate">
                                <ChildIcon size={11} className={isChildSelected ? "text-[#0D99FF]" : "text-zinc-500 shrink-0"} />
                                <span className="truncate">{child.label}</span>
                              </div>

                              <button
                                onClick={(e) => toggleVisibility(child.id, e)}
                                className={`p-0.5 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-200 transition-opacity ${
                                  isChildHidden ? "opacity-100 text-zinc-600" : ""
                                }`}
                              >
                                {isChildHidden ? <EyeOff size={10} /> : <Eye size={10} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: PAGES & SITES NAVIGATOR */}
          {activeTab === "pages" && (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pages &amp; Views</div>
              {pages.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (iframeRef.current) {
                        iframeRef.current.src = `http://localhost:4321${p.path === "/" ? "" : p.path}`;
                      }
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs font-medium hover:bg-white/[0.06] text-zinc-300 hover:text-white transition-all cursor-pointer group border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={13} className="text-purple-400" />
                      <span>{p.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 font-semibold">
                      {p.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: DESIGN SYSTEM ASSETS & COMPONENTS */}
          {activeTab === "components" && (
            <div className="flex flex-col gap-1.5">
              <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Master Components</div>
              {designSystemComponents.map((asset) => (
                <div
                  key={asset.name}
                  onClick={() => {
                    setSelectedNodeId(asset.tag);
                    setRightOpen(true);
                    setInspectTab("properties");
                    iframeRef.current?.contentWindow?.postMessage({ type: "FIGMA_SCROLL_TO", payload: asset.tag }, "*");
                  }}
                  className="p-2 rounded-lg bg-[#1E1E1E] hover:bg-[#2C2C2C] border border-white/[0.06] flex flex-col gap-0.5 cursor-pointer transition-all hover:border-[#0D99FF]/40 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-[#0D99FF] flex items-center gap-1.5">
                      <Component size={12} className="text-emerald-400" />
                      <span>{asset.name}</span>
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">❖ Master</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">{asset.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
