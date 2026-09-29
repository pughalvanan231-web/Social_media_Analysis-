import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import GeometricAvatar from '../components/GeometricAvatar'
import { Sparkles, ArrowRight, ShieldCheck, KeyRound, User } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Authorization failed')
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (u, p) => {
    setUsername(u)
    setPassword(p)
  }

  return (
    <div className="flex min-h-screen h-screen w-screen bg-[#08090d] text-zinc-100 items-center justify-center font-sans p-4 relative overflow-hidden select-none">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/10 via-purple-600/10 to-pink-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Central Login Card */}
      <div className="w-full max-w-md framed-card rounded-3xl p-8 shadow-2xl relative z-10 animate-canvas-enter border border-white/[0.09] bg-[#0e1017]">
        
        {/* Header with Geometric Avatar & Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <GeometricAvatar size={64} className="mb-4 shadow-xl ring-4 ring-purple-500/20" />
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-300 tracking-tight">
            GOSSIP PROTOCOL
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1 tracking-widest uppercase">
            Social Media Intelligence Terminal
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-5 text-center font-medium animate-canvas-enter">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Operator Username
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#141724] border border-white/[0.08] rounded-xl px-3.5 py-2.5 pl-10 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                required
              />
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Security Credential
            </label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#141724] border border-white/[0.08] rounded-xl px-3.5 py-2.5 pl-10 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                required
              />
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Quick preset credentials buttons */}
          <div className="pt-1 flex items-center justify-between text-xs text-zinc-500">
            <span>Quick Login:</span>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => fillCredentials('admin', 'admin123')}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-indigo-400 hover:text-indigo-300 font-mono text-[11px] border border-white/[0.06] transition-colors"
              >
                admin
              </button>
              <button 
                type="button" 
                onClick={() => fillCredentials('analyst', 'analyst123')}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-purple-400 hover:text-purple-300 font-mono text-[11px] border border-white/[0.06] transition-colors"
              >
                analyst
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/60 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Access Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            JWT SECURE
          </span>
          <span>BUILD v2.4.1</span>
        </div>

      </div>
    </div>
  )
}
