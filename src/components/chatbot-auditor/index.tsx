export default function ChatbotAuditor() {
  return (
    <div className="flex h-full w-full bg-[#09090b] overflow-hidden">
      <div className="w-1/3 border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
           <h2 className="text-lg font-semibold text-zinc-100">Unresolved Queries</h2>
           <p className="text-xs text-zinc-500 mt-1">Questions the bot couldn't answer.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           {/* Mock log */}
           <div className="bg-[#18181b] border border-white/10 rounded-lg p-4 cursor-pointer hover:border-blue-500/50 transition-colors">
             <div className="text-sm text-zinc-200 font-medium mb-2">"What microcontroller did you use in Burfi?"</div>
             <div className="flex justify-between items-center text-xs text-zinc-500">
                <span>12 hours ago</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
             </div>
           </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col bg-[#0c0c0e]">
        <div className="p-8 max-w-3xl mx-auto w-full">
           <div className="text-xs font-medium text-blue-500 tracking-wider mb-2">KNOWLEDGE TRAINER</div>
           <h1 className="text-2xl font-semibold text-zinc-100 mb-8">Train Chatbot</h1>
           
           <div className="bg-[#18181b] border border-white/5 rounded-xl p-6 shadow-lg shadow-black/20 space-y-6">
             <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Query to Address</label>
                <div className="mt-2 text-sm text-zinc-200 p-3 bg-white/5 rounded-md border border-white/5">
                   "What microcontroller did you use in Burfi?"
                </div>
             </div>
             
             <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Your Answer</label>
                <textarea 
                  className="mt-2 w-full h-32 bg-black border border-white/10 rounded-md p-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                  placeholder="Type the answer to add to the knowledge base..."
                />
             </div>
             
             <div className="flex justify-end gap-3">
                <button className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200">Dismiss</button>
                <button className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-500">Commit to GitHub</button>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
