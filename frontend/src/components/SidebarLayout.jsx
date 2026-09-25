import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SidebarLayout({ children }) {
  const location = useLocation()
  const { logout, user } = useAuth()
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Emerging Issues', path: '/issues' },
    { name: 'Alerts', path: '/alerts' },
    { name: 'Feedback Analytics', path: '/feedback' },
    { name: 'Trends', path: '/trends' },
    { name: 'Sentiment', path: '/sentiment' },
    { name: 'Topics', path: '/intelligence' },
    { name: 'Narratives', path: '/narratives' }, // Reuse intelligence component in App.jsx
    { name: 'Network', path: '/network' },
    { name: 'Data Pipeline', path: '/pipeline' },
    { name: 'Sources: Bluesky', path: '/sources/bluesky' },
    { name: 'Sources: YouTube', path: '/sources/youtube' },
  ]

  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans flex-col">
      {isDemo && (
        <div className="w-full bg-red-600 text-red-50 text-xs font-black text-center py-1.5 uppercase tracking-widest z-50 shadow-md">
          SIH DEMO DATA - NOT REAL INTELLIGENCE
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tighter">
            GOSSIP PROTOCOL
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1 tracking-widest">INTELLIGENCE TERMINAL</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path))
                
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-900/40 text-blue-400 border border-blue-800/50' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-800 text-xs text-gray-600 font-mono text-center flex flex-col items-center gap-2">
          {user && (
            <div className="text-gray-400">
              Logged in as <span className="text-blue-400 font-bold">{user.username}</span>
            </div>
          )}
          <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider">
            Logout
          </button>
          <div className="mt-2">v2.0.1 SYSTEM SECURE</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar for mobile and global actions */}
        <header className="h-16 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="md:hidden">
            <span className="text-lg font-black text-blue-400 tracking-tighter">GOSSIP PROTOCOL</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <button 
              onClick={() => {
                document.documentElement.classList.toggle('light-theme')
                // Basic implementation for the button. The actual CSS variables would need to be defined in index.css
              }}
              className="px-3 py-1.5 rounded bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              Toggle Theme
            </button>
            <span className="flex items-center text-xs font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-800/50">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              LIVE
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-400">
              A
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      
      </div>
    </div>
  )
}
