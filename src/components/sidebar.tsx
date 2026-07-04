"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FolderGit2, User, Briefcase, Code2, BarChart3, MessageSquare, Settings, UploadCloud } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { section: "CONTENT", items: [
      { name: "Projects", icon: FolderGit2, href: "/" },
      { name: "Profile & Bio", icon: User, href: "/profile" },
      { name: "Experience", icon: Briefcase, href: "/experience" },
      { name: "Skills", icon: Code2, href: "/skills" },
    ]},
    { section: "AI & ANALYTICS", items: [
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Chatbot Auditor", icon: MessageSquare, href: "/chatbot" },
    ]},
    { section: "SYSTEM", items: [
      { name: "Settings", icon: Settings, href: "/settings" },
    ]}
  ]

  return (
    <div className="w-[250px] h-screen bg-[#09090b] border-r border-white/5 flex flex-col font-sans shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-sm tracking-tight text-zinc-100">
            LK PORTFOLIO CMS
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-2">
              {group.section}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive 
                        ? "bg-white/10 text-white font-medium shadow-sm" 
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-blue-400" : ""}`} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-blue-900/20">
          <UploadCloud className="w-4 h-4" />
          Publish to GitHub
        </button>
      </div>
    </div>
  )
}
