"use client"

import { useState } from "react"
import { Settings2, X } from "lucide-react"

export default function CanvasEditor() {
  const [selectedElement, setSelectedElement] = useState<string | null>("projects.aquadot")

  return (
    <div className="flex h-full w-full bg-[#09090b] overflow-hidden">
      {/* Left Pane: AI Assistant (25%) */}
      <div className="w-1/4 min-w-[300px] border-r border-white/10 flex flex-col">
        <div className="h-12 min-h-[48px] border-b border-white/10 flex items-center px-4">
          <span className="text-xs font-semibold text-zinc-400">ASSISTANT</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Chat feed goes here */}
          <div className="text-xs text-zinc-500 italic">No active session.</div>
        </div>
        <div className="p-4 border-t border-white/10">
          <div className="bg-[#18181b] border border-white/10 rounded-xl p-2 relative group focus-within:border-blue-500/50 transition-colors">
            <textarea 
              placeholder="Ask for changes..."
              className="w-full bg-transparent text-sm text-zinc-200 resize-none outline-none min-h-[60px]"
            />
            <div className="flex items-center justify-between mt-2">
              <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 transition-colors">
                <span className="text-lg">+</span>
              </button>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-medium transition-colors">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center Pane: Live Canvas */}
      <div className="flex-1 bg-[#0c0c0e] relative flex flex-col">
        <div className="h-12 min-h-[48px] border-b border-white/10 flex items-center justify-between px-4 bg-[#09090b]/80 backdrop-blur-sm z-10">
           <div className="flex bg-zinc-900 border border-white/5 rounded-md p-0.5">
             <button className="px-3 py-1 text-xs rounded shadow-sm bg-zinc-800 text-zinc-200">Preview</button>
             <button className="px-3 py-1 text-xs rounded text-zinc-500 hover:text-zinc-300">Code</button>
           </div>
           <button className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-500 shadow-lg shadow-blue-900/20">
             Publish to GitHub
           </button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center relative overflow-hidden">
           {/* Replace with iframe */}
           <div className="w-full max-w-[1200px] h-full bg-black border border-white/10 rounded-lg overflow-hidden shadow-2xl relative">
             <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
                Astro Dev Server Iframe (localhost:4321)
             </div>
           </div>
        </div>
      </div>

      {/* Right Pane: Properties Inspector (25%) */}
      {selectedElement && (
        <div className="w-1/4 min-w-[300px] border-l border-white/10 flex flex-col bg-[#09090b] animate-in slide-in-from-right-8 duration-200">
           <div className="h-12 min-h-[48px] border-b border-white/10 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
               <Settings2 className="w-4 h-4 text-zinc-400" />
               <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Properties</span>
            </div>
            <button onClick={() => setSelectedElement(null)} className="text-zinc-500 hover:text-zinc-300">
               <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-6">
             <div>
                <div className="text-[10px] font-mono text-zinc-500 mb-4 bg-zinc-900 py-1 px-2 rounded w-fit border border-white/5">
                   {selectedElement}
                </div>
                
                <div className="space-y-4">
                   <div>
                      <label className="text-xs font-medium text-zinc-400">Title</label>
                      <input 
                         type="text" 
                         defaultValue="AquaDot" 
                         className="w-full mt-1 bg-[#18181b] border border-white/10 rounded-md p-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-medium text-zinc-400">Overview</label>
                      <textarea 
                         defaultValue="Real-time IoT water quality monitoring leveraging ESP32 edge ML inference..." 
                         className="w-full mt-1 bg-[#18181b] border border-white/10 rounded-md p-2 text-sm text-zinc-200 outline-none focus:border-blue-500 min-h-[100px]"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-medium text-zinc-400">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                         <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">ESP32</span>
                         <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">TensorFlow Lite</span>
                         <button className="text-xs px-2 py-1 border border-dashed border-zinc-600 text-zinc-500 rounded hover:text-zinc-300 hover:border-zinc-400">
                            + Add Tag
                         </button>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="pt-4 border-t border-white/10">
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors">
                   Save Changes
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
