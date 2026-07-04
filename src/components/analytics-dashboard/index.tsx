export default function AnalyticsDashboard() {
  return (
    <div className="flex flex-col h-full w-full bg-[#09090b] p-8 overflow-y-auto">
      <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Dashboard</h1>
      <p className="text-sm text-zinc-400 mb-8">Portfolio health, GitHub status, and quick actions.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#18181b] border border-white/5 rounded-xl p-6 shadow-lg shadow-black/20">
          <div className="text-xs font-medium text-zinc-500 tracking-wider mb-4">PORTFOLIO VIEWS</div>
          <div className="text-3xl font-bold text-zinc-100">12.4k</div>
          <div className="text-xs text-zinc-500 mt-1">Last 30 days</div>
        </div>
        <div className="bg-[#18181b] border border-white/5 rounded-xl p-6 shadow-lg shadow-black/20">
          <div className="text-xs font-medium text-zinc-500 tracking-wider mb-4">ACTIVE PROJECTS</div>
          <div className="text-3xl font-bold text-zinc-100">8</div>
          <div className="text-xs text-zinc-500 mt-1">Projects in projects.json</div>
        </div>
        <div className="bg-[#18181b] border border-white/5 rounded-xl p-6 shadow-lg shadow-black/20">
          <div className="text-xs font-medium text-zinc-500 tracking-wider mb-4">GITHUB STATUS</div>
          <div className="text-3xl font-bold text-emerald-400">Active</div>
          <div className="text-xs text-zinc-500 mt-1">Latency: 120ms</div>
        </div>
      </div>
    </div>
  )
}
