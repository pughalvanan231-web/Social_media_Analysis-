import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GeometricAvatar from './GeometricAvatar'
import BrandLogo from './BrandLogo'
import { 
  Home, 
  Flame, 
  ShieldAlert, 
  TrendingUp, 
  Smile, 
  Layers, 
  Network, 
  Workflow, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search, 
  Plus, 
  SquarePen, 
  History, 
  Bot, 
  Scan, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  LogOut,
  ChevronRight,
  Sparkles,
  Copy,
  GitPullRequest,
  CheckSquare,
  X
} from 'lucide-react'

export default function SidebarLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [quickNote, setQuickNote] = useState(localStorage.getItem('gp_quick_note') || '')
  const [liveAutoRefresh, setLiveAutoRefresh] = useState(true)

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Alerts & Threats', path: '/alerts', icon: ShieldAlert },
    { name: 'Trends & Anomalies', path: '/trends', icon: TrendingUp },
    { name: 'Sentiment & Emotion', path: '/sentiment', icon: Smile },
    { name: 'Topics & Narratives', path: '/intelligence', icon: Layers },
    { name: 'Network Graph', path: '/network', icon: Network },
    { name: 'Data Pipeline & Sources', path: '/pipeline', icon: Workflow },
  ]

  // Keyboard shortcut for command palette (⌘K or /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setProfileOpen(false)
        setQuickActionOpen(false)
        setHistoryOpen(false)
        setNotesOpen(false)
        setChatOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
        setIsFullscreen(false)
      }
    }
  }

  const saveNote = (text) => {
    setQuickNote(text)
    localStorage.setItem('gp_quick_note', text)
  }

  const currentNav = navItems.find(item => 
    item.path === location.pathname || (item.path !== '/' && location.pathname.startsWith(item.path))
  )

  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

  return (
    <div className="h-screen w-screen flex flex-col cosmic-grain-wrapper relative overflow-hidden select-none font-sans">
      
      {/* 1. Subtle Authentic Grain Overlay (covers the window) */}
      <div className="grain-overlay pointer-events-none absolute inset-0 z-0"></div>

      {/* Top Banner if demo mode */}
      {isDemo && (
        <div className="w-full bg-gradient-to-r from-red-900 via-red-600 to-red-900 text-red-100 text-[10px] font-black tracking-widest text-center py-0.5 uppercase z-30 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          SIH DEMONSTRATION MODE ACTIVE — SYNTHETIC INTELLIGENCE
        </div>
      )}

      {/* 2. Top Bar (with subtle gradient glow & grain showing through, no horizontal line) */}
      <header className="h-11 bg-transparent flex items-center justify-between px-3 shrink-0 relative z-20">
        
        {/* Left: Brand Icon & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center group pl-0.5" title="Home">
            <BrandLogo size={24} />
          </Link>

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400 hover:text-zinc-200 transition-colors">Gossip Protocol</span>
            <span className="text-zinc-600">/</span>
            <span className="font-semibold text-zinc-200">
              {currentNav?.name || 'Home'}
            </span>
          </div>
        </div>

        {/* Center: Search Bar Pill */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <button 
            onClick={() => setSearchOpen(true)}
            className="w-full h-7 px-2.5 rounded-lg bg-black/30 hover:bg-black/50 border border-white/[0.08] hover:border-purple-500/40 text-zinc-400 text-xs flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
              <span className="text-zinc-500 group-hover:text-zinc-400 text-[11px]">Search intelligence or jump to...</span>
            </div>
            <kbd className="px-1.5 py-0.2 text-[10px] font-mono text-zinc-400 bg-white/[0.05] border border-white/10 rounded">
              /
            </kbd>
          </button>
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-2.5 relative">
          
          {/* Quick Action (+) Button */}
          <div className="relative">
            <button 
              onClick={() => setQuickActionOpen(prev => !prev)}
              className="w-6 h-6 rounded-md bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              title="Quick Actions"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {quickActionOpen && (
              <div className="absolute right-0 top-8 w-52 bg-[#141724] border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-canvas-enter">
                <button 
                  onClick={() => { setQuickActionOpen(false); navigate('/pipeline'); }}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-purple-600/20 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <Workflow className="w-3.5 h-3.5 text-purple-400" />
                  Run Pipeline Ingestion
                </button>
                <button 
                  onClick={() => { setQuickActionOpen(false); navigate('/alerts?tab=issues'); }}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-purple-600/20 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  Scan Emerging Threats
                </button>
              </div>
            )}
          </div>

          {/* Alerts Shortcut */}
          <Link 
            to="/alerts" 
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-colors"
            title="Active Alerts"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Alerts</span>
          </Link>

          {/* Live Telemetry Beacon */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </div>

          {/* Dynamic User Profile Avatar */}
          <div className="relative ml-0.5">
            <button 
              onClick={() => setProfileOpen(prev => !prev)}
              className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-purple-400/50 transition-all"
              title={user ? `Signed in as ${user.username}` : "Profile"}
            >
              <GeometricAvatar size={26} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-9 w-60 bg-[#141724] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-canvas-enter">
                <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                  <GeometricAvatar size={36} />
                  <div>
                    <div className="font-bold text-sm text-zinc-100 capitalize">{user?.username || 'Operator'}</div>
                    <div className="text-[10px] font-mono text-purple-400 uppercase">{user?.role || 'ANALYST'}</div>
                  </div>
                </div>

                <div className="py-2.5 space-y-1 text-xs text-zinc-400">
                  <div className="flex justify-between py-0.5">
                    <span>Account</span>
                    <span className="font-mono text-zinc-300">{user?.email || 'Active'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Role</span>
                    <span className="font-mono text-emerald-400 font-semibold uppercase">{user?.role || 'ANALYST'}</span>
                  </div>
                </div>

                <button 
                  onClick={logout}
                  className="w-full mt-2 py-1.5 px-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>

      </header>

      {/* 3. Main Body Structure: Left Rail + SEAMLESS CANVAS + Right Rail */}
      <div className="flex flex-1 overflow-hidden relative z-10 pb-2.5">
        
        {/* Left Primary Icon Rail (direct dock against canvas) */}
        <aside 
          className={`h-full flex flex-col justify-between py-2 transition-all duration-200 shrink-0 ${
            isExpanded ? 'w-52 px-2 bg-[#090a0f]/90 border-r border-white/[0.06]' : 'w-11 items-center px-1 bg-transparent'
          }`}
        >
          {/* Nav Icons */}
          <div className="w-full flex-1 overflow-y-auto space-y-1 pr-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path))
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.name}
                  className={`flex items-center gap-3 px-2 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                    isActive 
                      ? 'glass-nav-active text-white' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]'
                  } ${!isExpanded ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-purple-200 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`} />
                  
                  {isExpanded && (
                    <span className="truncate flex-1 tracking-tight font-medium text-white">{item.name}</span>
                  )}

                  {isActive && (
                    <span className="absolute left-0.5 w-1 h-3.5 rounded-full glass-pill-indicator"></span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Bottom collapse button */}
          <div className="w-full pt-2 flex flex-col gap-1">
            <button 
              onClick={() => setIsExpanded(prev => !prev)}
              className={`flex items-center gap-3 px-2 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors ${
                !isExpanded ? 'justify-center' : ''
              }`}
              title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isExpanded ? (
                <>
                  <PanelLeftClose className="w-4 h-4 shrink-0" />
                  <span className="truncate">Collapse</span>
                </>
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
          </div>
        </aside>

        {/* 4. THE SEAMLESS MAIN CANVAS (With seamless rounded corners directly bordering the rails) */}
        <main className="flex-1 h-full overflow-hidden rounded-2xl border border-white/[0.09] bg-[#101116] shadow-2xl relative flex flex-col z-10">
          {/* Scrollable Canvas Surface: Content sits directly inside without duplicate nested boxes */}
          <div className="flex-1 overflow-y-auto p-5 md:p-7 animate-canvas-enter">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>

        {/* 5. Right Utility Tool Dock Rail (Exact match from screenshot media_1790572781945.png) */}
        <aside className="w-12 h-full flex flex-col items-center py-3 bg-transparent shrink-0 z-20">
          
          {/* Top Tools: Edit Button + Divider Line + Chat + History + Fullscreen */}
          <div className="flex flex-col items-center gap-1.5">
            
            {/* [Edit Icon inside rounded square] */}
            <button 
              onClick={() => setNotesOpen(prev => !prev)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                notesOpen 
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' 
                  : 'bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-zinc-300 hover:text-white'
              }`}
              title="Edit / Quick Notes"
            >
              <SquarePen className="w-3.5 h-3.5" />
            </button>

            {/* Subtle Divider Line (from screenshot) */}
            <div className="w-4 h-[1px] bg-white/15 my-1.5"></div>

            {/* [Chat Speech Bubble with Sparkle Icon] */}
            <button 
              onClick={() => setChatOpen(prev => !prev)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                chatOpen 
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]'
              }`}
              title="AI Assistant / Copilot"
            >
              <Bot className="w-4 h-4" />
            </button>

            {/* [Clock / History Icon] */}
            <button 
              onClick={() => setHistoryOpen(prev => !prev)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                historyOpen 
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]'
              }`}
              title="History / Audit Logs"
            >
              <History className="w-4 h-4" />
            </button>

            {/* [Four Corners Fullscreen / Scan Icon] */}
            <button 
              onClick={toggleFullscreen}
              className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] flex items-center justify-center transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Canvas"}
            >
              <Scan className="w-4 h-4" />
            </button>

          </div>

          {/* Bottom Tool: Refresh beacon */}
          <div className="mt-auto flex flex-col items-center gap-2">
            <button 
              onClick={() => setLiveAutoRefresh(prev => !prev)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                liveAutoRefresh ? 'text-emerald-400 hover:bg-emerald-950/30' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={liveAutoRefresh ? "Live Feed: Active" : "Live Feed: Paused"}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </aside>

      </div>

      {/* Analyst Notes Scratchpad Drawer */}
      {notesOpen && (
        <div className="fixed right-14 top-14 w-80 bg-[#141724] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-canvas-enter">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <SquarePen className="w-3.5 h-3.5 text-purple-400" />
              Analyst Scratchpad
            </span>
            <button onClick={() => setNotesOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="pt-3">
            <textarea 
              value={quickNote}
              onChange={(e) => saveNote(e.target.value)}
              placeholder="Record findings, suspect handles, coordinates or case hypotheses..."
              rows={8}
              className="w-full bg-[#0c0e15] border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors resize-none font-mono"
            />
            <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 font-mono">
              <span>Auto-saved locally</span>
              <span>{quickNote.length} chars</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Chat Drawer */}
      {chatOpen && (
        <div className="fixed right-14 top-14 w-88 bg-[#141724] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-canvas-enter">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              Gossip Copilot
            </span>
            <button onClick={() => setChatOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="py-3 text-xs text-zinc-300 space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-200">
              ⚡ <strong>Copilot ready:</strong> Ask to summarize the latest spike in Urban Water Supply Disruption or explain an anomaly.
            </div>
            <div className="p-2 rounded-lg bg-black/30 border border-white/5 font-mono text-[11px] text-zinc-400">
              Prompt: "Compare sentiment delta between Bluesky and YouTube"
            </div>
          </div>
        </div>
      )}

      {/* Audit History Drawer */}
      {historyOpen && (
        <div className="fixed right-14 top-14 w-96 bg-[#141724] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-canvas-enter">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-purple-400" />
              Live Audit Log
            </span>
            <button onClick={() => setHistoryOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="pt-3 space-y-2 max-h-80 overflow-y-auto font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <div className="text-emerald-400 text-[11px] font-bold">PIPELINE_CYCLE_COMPLETED</div>
              <div className="text-zinc-400 text-[10px]">Ingested 50 posts across Bluesky & YouTube</div>
              <div className="text-zinc-600 text-[9px] mt-1">2 mins ago • Worker #04</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <div className="text-orange-400 text-[11px] font-bold">ANOMALY_TRIGGERED</div>
              <div className="text-zinc-400 text-[10px]">Z-Score 3.8σ on Urban Water Supply Disruption</div>
              <div className="text-zinc-600 text-[9px] mt-1">8 mins ago • Stats Engine</div>
            </div>
          </div>
        </div>
      )}

      {/* Omnisearch Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 z-50 animate-canvas-enter">
          <div className="w-full max-w-lg bg-[#141724] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-white/[0.08] flex items-center gap-3">
              <Search className="w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search or jump to module..." 
                autoFocus
                className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false)
                }}
              />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/[0.05] rounded border border-white/10">
                ESC
              </kbd>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button 
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setSearchOpen(false)
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-purple-600/20 text-zinc-300 hover:text-white flex items-center justify-between text-xs font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-purple-400" />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{item.path}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
