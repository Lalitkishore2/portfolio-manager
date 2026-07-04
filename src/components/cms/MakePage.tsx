import { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  FileText,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  RefreshCcw,
  PlusCircle,
  Paperclip,
  Sparkles,
  MoreHorizontal,
  Image,
  LayoutGrid as ComponentIcon,
  Folder,
  File,
} from "lucide-react";
import { MetalButton } from "../ui/liquid-glass-button";

/* --- Types ------------------------------------------------ */

type GenerationState = "idle" | "generating" | "complete" | "error";

interface MakeMessage {
  id: number;
  type: "user" | "bot" | "reasoning" | "stream" | "attachment" | "files-worked";
  content?: string;
  label?: string;
  expanded?: boolean;
  steps?: string[];
  versionName?: string;
  versionNumber?: number;
  filename?: string;
  filesWorked?: string[];
}

interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  open?: boolean;
  active?: boolean;
  children?: FileTreeNode[];
}

/* --- Main Component --------------------------------------- */

interface MakePageProps {
  onBack: () => void;
}

export function MakePage({ onBack }: MakePageProps) {
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [messages, setMessages] = useState<MakeMessage[]>([]);
  const [currentVersion, setCurrentVersion] = useState(11);
  const [promptText, setPromptText] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [targetSection, setTargetSection] = useState("projects");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [promptText]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target as Node)) {
        setShowAttachmentMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function startGeneration() {
    if (!promptText.trim() || generationState === "generating") return;

    const userPrompt = promptText.trim();
    setPromptText("");
    setGenerationState("generating");

    // 1. User bubble
    const userMsg: MakeMessage = {
      id: Date.now(),
      type: "user",
      content: userPrompt,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Stream some fake logs so the user knows something is happening
      const reasoningMsg: MakeMessage = {
        id: Date.now() + 1,
        type: "reasoning",
        label: `AI Processing (${provider})`,
        expanded: true,
        steps: ["Analyzing prompt...", "Modifying JSON structure..."],
      };
      setMessages((prev) => [...prev, reasoningMsg]);

      // Call the real API
      const res = await fetch("/api/make", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, provider, targetSection }),
      });

      if (!res.ok) throw new Error("API Failed");

      // Complete generation
      const newVersion = currentVersion + 1;
      const botMsg: MakeMessage = {
        id: Date.now() + 200,
        type: "bot",
        content: `Applied changes for: "${userPrompt}"`,
        versionName: "Live Update",
        versionNumber: newVersion,
      };

      setMessages((prev) => [...prev, botMsg]);
      setCurrentVersion(newVersion);
      setGenerationState("complete");
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

      // The iframe will automatically reload because Astro detects file system changes!
    } catch (error) {
      console.error(error);
      setGenerationState("error");
    }
  }

  function handleSaveEdits() {
    // Already saved to disk via API
    setGenerationState("idle");
  }

  function handleDiscardEdits() {
    // In a real system, you'd reset from a git stash or previous JSON. For now, just clear state.
    setGenerationState("idle");
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#09090b]">
      {/* --- Top Bar --------------------------------------- */}
      <div className="flex items-center justify-between h-[44px] px-3 gap-2 bg-[#111] border-b border-[#2a2a2a] relative">
        <div className="flex items-center gap-2">
          <LayoutGrid
            size={16}
            className="text-[#888] cursor-pointer hover:text-[#aaa] transition-colors"
            onClick={onBack}
          />
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-[#e0e0e0] truncate max-w-[140px]">
              Visual Canvas Editor
            </span>
          </div>
          <div className="bg-[#3b3bf7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">AI</div>
          <div className="text-sm text-[#ccc] bg-[#1a1a1a] border border-[#333] rounded px-2 py-0.5 ml-2">
            Version {currentVersion}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={targetSection}
            onChange={(e) => setTargetSection(e.target.value)}
            className="bg-[#1a1a1a] text-[#ccc] border border-[#333] rounded px-2 py-1 text-xs outline-none cursor-pointer hover:border-[#555] transition-colors"
          >
            <option value="projects">Target: Projects</option>
            <option value="experience">Target: Experience</option>
            <option value="profile">Target: Profile</option>
            <option value="skills">Target: Skills</option>
          </select>
          <select 
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-[#1a1a1a] text-[#ccc] border border-[#333] rounded px-2 py-1 text-xs outline-none cursor-pointer hover:border-[#555] transition-colors"
          >
            <option value="groq-qwen3">Groq (qwen-qwen3-32b)</option>
            <option value="groq-llama3">Groq (llama-3.3-70b-versatile)</option>
            <option value="gemini">Gemini (gemini-2.5-pro)</option>
            <option value="openrouter-qwen">OpenRouter (qwen3-coder:free)</option>
            <option value="openrouter-deepseek">OpenRouter (deepseek-v3:free)</option>
            <option value="nvidia">NVIDIA NIM (deepseek-r1)</option>
            <option value="ollama">Ollama Local (qwen2.5-coder)</option>
            <option value="ollama-cloud">Ollama Cloud (Hosted)</option>
          </select>
        </div>
      </div>

      {/* --- Main Content ---------------------------------- */}
      <div className="flex-1 relative flex">
        {/* Visual Preview */}
        <div className="flex-1 relative bg-[#09090b] flex flex-col">
          <iframe
            src="http://localhost:4321/"
            className="w-full h-full border-none"
            title="Make Preview"
          />

          {generationState === "generating" && (
            <div className="absolute inset-0 bg-[#0d0d0d]/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#2a2a2a] border-t-[#3b3bf7] animate-spin" />
              <div className="text-[#e0e0e0] font-medium text-sm drop-shadow-md">Building your idea...</div>
            </div>
          )}
        </div>

        {/* Floating Chat & Prompt Panel (Figma Make Style) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 w-full max-w-[640px]">
          
          {/* Collapsible Chat History */}
          {messages.length > 0 && (
            <div className="w-full bg-[rgba(24,24,27,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl mb-4 overflow-hidden shadow-2xl flex flex-col max-h-[400px]">
              <div className="flex-1 overflow-y-auto px-4 py-5 make-chat-scroll flex flex-col gap-1">
                {messages.map((msg) => (
                  <MessageItem key={msg.id} message={msg} />
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Feedback Row */}
              {generationState === "complete" && (
                <div className="flex items-center gap-4 px-4 py-3 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
                  <ThumbsUp size={16} className="text-[#888] hover:text-white cursor-pointer transition-colors" />
                  <ThumbsDown size={16} className="text-[#888] hover:text-white cursor-pointer transition-colors" />
                  <RefreshCcw size={16} className="text-[#888] hover:text-white cursor-pointer transition-colors" />
                  
                  <div className="ml-auto flex items-center gap-2">
                    <MetalButton variant="primary" onClick={handleSaveEdits} className="h-8 px-4 text-xs">
                      Accept
                    </MetalButton>
                    <MetalButton variant="default" onClick={handleDiscardEdits} className="h-8 px-4 text-xs">
                      Discard
                    </MetalButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Command Bar */}
          <div className="w-full bg-[rgba(24,24,27,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-3xl p-2 shadow-2xl relative">
            <div className="flex items-center gap-3 px-3">
              <Sparkles size={20} className="text-[#3b3bf7] flex-shrink-0" />
              
              <textarea
                ref={textareaRef}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    startGeneration();
                  }
                }}
                placeholder="Ask Figma Make to update the UI..."
                className="flex-1 min-h-[24px] max-h-[120px] py-2 bg-transparent border-none outline-none resize-none text-[#e0e0e0] text-[15px] placeholder:text-[#666]"
                rows={1}
              />
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Paperclip size={18} className="text-[#888] hover:text-white cursor-pointer transition-colors" onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} />
                <button
                  onClick={startGeneration}
                  disabled={!promptText.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    promptText.trim() ? "bg-[#e0e0e0] text-black hover:bg-white" : "bg-[#2a2a2a] text-[#555]"
                  }`}
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Hidden Attachment Menu */}
            {showAttachmentMenu && (
              <div ref={attachmentMenuRef} className="absolute bottom-[60px] right-[40px] z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl w-[200px] p-2">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#222] cursor-pointer">
                  <LayoutGrid size={16} className="text-[#888]" />
                  <span className="text-[#e0e0e0] text-sm">Select Component</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#222] cursor-pointer">
                  <Image size={16} className="text-[#888]" />
                  <span className="text-[#e0e0e0] text-sm">Upload Image</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .make-chat-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .make-chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .make-chat-scroll::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 3px;
        }
        .make-chat-scroll::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>
    </div>
  );
}

/* --- Message Item Component ------------------------------- */

function MessageItem({ message }: { message: MakeMessage }) {
  const [expanded, setExpanded] = useState(message.expanded ?? false);

  if (message.type === "attachment") {
    return (
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-3 flex items-center gap-3 max-w-[220px] mb-3">
        <FileText size={20} className="text-[#888]" />
        <div className="flex-1 min-w-0">
          <div className="text-[#e0e0e0] text-sm font-medium truncate">{message.filename}</div>
          <div className="text-[#666] text-xs">File</div>
        </div>
      </div>
    );
  }

  if (message.type === "user") {
    return (
      <div className="flex justify-end items-start gap-2 mb-3">
        <div className="bg-[#1e1e24] border border-[#2a2a3a] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-[#e0e0e0] text-sm leading-relaxed">
          {message.content}
        </div>
        <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
          T
        </div>
      </div>
    );
  }

  if (message.type === "reasoning") {
    return (
      <div className="mb-1">
        <div
          className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-[#1a1a1a] rounded px-1 -mx-1"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronRight
            size={14}
            className={`text-[#666] transition-transform ${expanded ? "rotate-90" : ""}`}
          />
          <span className="text-[#888] text-xs">{message.label}</span>
        </div>
        {expanded && message.steps && (
          <div className="pl-5">
            {message.steps.map((step, idx) => (
              <div key={idx} className="text-[#aaa] text-xs leading-relaxed py-0.5">
                {step}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (message.type === "files-worked") {
    return (
      <div className="mb-1">
        <div
          className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-[#1a1a1a] rounded px-1 -mx-1"
          onClick={() => setExpanded(!expanded)}
        >
          <FileText size={14} className="text-[#666]" />
          <ChevronRight
            size={10}
            className={`text-[#666] transition-transform ${expanded ? "rotate-90" : ""}`}
          />
          <span className="text-[#888] text-xs">Worked with {message.filesWorked?.length || 0} files</span>
        </div>
        {expanded && message.filesWorked && (
          <div className="pl-5">
            {message.filesWorked.map((file, idx) => (
              <div key={idx} className="text-[#777] text-xs py-0.5">
                {file}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (message.type === "stream") {
    return <div className="text-[#ccc] text-sm leading-relaxed py-1 mb-1">{message.content}</div>;
  }

  if (message.type === "bot") {
    return (
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 mb-3 w-full">
        <div className="text-[#ccc] text-sm leading-relaxed">{message.content}</div>
        <div className="flex justify-between items-end mt-4 pt-3 border-t border-[#222]">
          <div>
            <div className="text-[#4ade80] text-sm font-medium cursor-pointer hover:underline">
              {message.versionName}
            </div>
            <div className="text-[#4ade80] text-sm">Version {message.versionNumber}</div>
          </div>
          <MoreHorizontal size={16} className="text-[#666] cursor-pointer hover:text-white" />
        </div>
      </div>
    );
  }

  return null;
}

/* --- File Tree Item Component ----------------------------- */

function FileTreeItem({ node, depth }: { node: FileTreeNode; depth: number }) {
  const [isOpen, setIsOpen] = useState(node.open ?? false);

  if (node.type === "folder") {
    return (
      <div>
        <div
          className="flex items-center gap-1.5 py-0.5 px-2 cursor-pointer hover:bg-[#1a1a1a] rounded text-xs text-[#aaa]"
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronRight size={10} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
          <Folder size={12} className="text-[#888]" />
          <span>{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div>
            {node.children.map((child, idx) => (
              <FileTreeItem key={idx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 py-0.5 px-2 cursor-pointer hover:bg-[#1a1a1a] rounded text-xs ${
        node.active ? "bg-[#1e1e3a] text-[#a8a8f8] font-medium" : "text-[#888]"
      }`}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <File size={12} />
      <span>{node.name}</span>
    </div>
  );
}
