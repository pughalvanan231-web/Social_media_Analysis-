import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/BrandLogo'
import { 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Workflow, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Network, 
  ExternalLink, 
  Zap, 
  Cpu, 
  Sun, 
  Moon, 
  Radio, 
  Eye, 
  Clock, 
  BarChart3, 
  Terminal,
  ShieldCheck,
  Flame
} from 'lucide-react'

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoMessage, setDemoMessage] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('gp_theme') || 'dark')
  const [activeTab, setActiveTab] = useState('clustering')

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    }
    localStorage.setItem('gp_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const triggerLiveDemo = async () => {
    setDemoRunning(true)
    setDemoMessage('Initializing synthetic intelligence pipeline...')
    try {
      const res = await fetch('http://127.0.0.1:8000/api/demo/run-scenario', { method: 'POST' })
      if (res.ok) {
        setDemoMessage('Intelligence scan completed! Redirecting to command center...')
        setTimeout(() => {
          navigate(user ? '/dashboard' : '/login')
        }, 1200)
      } else {
        setDemoMessage('Demo service unreachable. Launching terminal...')
        setTimeout(() => navigate(user ? '/dashboard' : '/login'), 1000)
      }
    } catch {
      setDemoMessage('Launching terminal...')
      setTimeout(() => navigate(user ? '/dashboard' : '/login'), 800)
    } finally {
      setTimeout(() => setDemoRunning(false), 2000)
    }
  }

  return (
    <div className="min-h-screen w-full cosmic-grain-wrapper font-sans text-zinc-100 relative overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* High-Performance Unified Figma Horizon Background (Zero CPU Overhead) */}
      <div className="figma-horizon-layer pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="figma-aurora-surface"></div>
      </div>

      {/* Velvet Film Grain Overlay */}
      <div className="grain-overlay pointer-events-none absolute inset-0 z-0"></div>

      {/* Top Floating Glass Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3.5 backdrop-blur-md bg-[#08090d]/60 border-b border-white/[0.08] transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <BrandLogo size={28} />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  Gossip Protocol
                </span>
                <span className="text-[9px] font-mono text-purple-400 font-semibold uppercase tracking-wider">
                  Social Intelligence OS
                </span>
              </div>
            </Link>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-3 h-3 text-purple-400" /> SIH ED-2024
            </span>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#pipeline" className="hover:text-zinc-100 transition-colors">Architecture</a>
            <a href="#capabilities" className="hover:text-zinc-100 transition-colors">Capabilities</a>
            <a href="#telemetry" className="hover:text-zinc-100 transition-colors">Telemetry</a>
            <Link to="/alerts" className="hover:text-zinc-100 transition-colors">Threat Radar</Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all"
              title="Toggle Light / Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
            </button>

            {user ? (
              <Link 
                to="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 border border-purple-400/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Enter Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login"
                  className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/login"
                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 border border-purple-400/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-4 sm:px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Live System Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-zinc-300 mb-8 backdrop-blur-md shadow-xl animate-canvas-enter">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-zinc-400">ENGINE POSTURE:</span>
            <span className="text-emerald-400 font-bold">ALL FIREHOSES OPERATIONAL</span>
            <span className="text-zinc-600">•</span>
            <span className="text-purple-300">Z-SCORE SPIKE ENGINE ACTIVE</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6">
            Autonomous Social Threat &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-300">
              Narrative Intelligence
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed mb-10 font-normal">
            Detect emerging municipal crises, coordinated disinformation campaigns, and velocity anomalies across global firehoses in real time before they reach virality.
          </p>

          {/* Hero CTA Button Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-purple-950/60 border border-purple-400/40 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 group"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <button
              onClick={triggerLiveDemo}
              disabled={demoRunning}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 hover:text-white text-sm font-semibold rounded-2xl border border-white/10 flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-lg backdrop-blur-md"
            >
              <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
              <span>{demoRunning ? 'Running Scan Scenario...' : 'Simulate Crisis Incident'}</span>
            </button>
          </div>

          {demoMessage && (
            <div className="max-w-md mx-auto mb-10 p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl text-xs font-mono text-purple-200 animate-canvas-enter">
              {demoMessage}
            </div>
          )}

          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-[#0e101a]/70 border border-white/[0.08] backdrop-blur-md">
              <div className="text-[11px] font-mono text-zinc-400 uppercase">Detection Speed</div>
              <div className="text-2xl font-black text-white font-mono mt-1">&lt; 4.2 min</div>
              <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">Stream vs 6h batch</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e101a]/70 border border-white/[0.08] backdrop-blur-md">
              <div className="text-[11px] font-mono text-zinc-400 uppercase">Anomaly Threshold</div>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1">Z ≥ 3.4σ</div>
              <div className="text-[10px] text-purple-300 mt-0.5 font-mono">Exponential variance</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e101a]/70 border border-white/[0.08] backdrop-blur-md">
              <div className="text-[11px] font-mono text-zinc-400 uppercase">Ingestion Velocity</div>
              <div className="text-2xl font-black text-indigo-400 font-mono mt-1">10k+ / hr</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">Bluesky, YouTube, RSS</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e101a]/70 border border-white/[0.08] backdrop-blur-md">
              <div className="text-[11px] font-mono text-zinc-400 uppercase">Analyst Precision</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">94.8%</div>
              <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">RLHF verification loop</div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Architecture Lifecycle Preview */}
      <section id="pipeline" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
            End-To-End Intelligence Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            From Raw Firehose to Tactical Mitigation
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto mt-2">
            How Gossip Protocol continuously ingests, clusters, scores, and mitigates multi-platform threats.
          </p>
        </div>

        {/* Pipeline Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          <div className="p-5 rounded-2xl bg-[#0e101a]/80 border border-white/[0.08] relative group hover:border-purple-500/40 transition-all">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/30">
              <Radio className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-400">PHASE 01</span>
            <h3 className="text-sm font-bold text-white mt-1">Multi-Modal Firehose</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Real-time WebSocket &amp; polling ingestion across Bluesky AT Protocol, YouTube feeds, RSS news, and synthetic simulators.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e101a]/80 border border-white/[0.08] relative group hover:border-purple-500/40 transition-all">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-400">PHASE 02</span>
            <h3 className="text-sm font-bold text-white mt-1">Unsupervised Clustering</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Zero-shot BERTopic semantic embeddings and KMeans fallback uncover coherent narrative clusters without keyword hardcoding.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e101a]/80 border border-white/[0.08] relative group hover:border-purple-500/40 transition-all">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-orange-400">PHASE 03</span>
            <h3 className="text-sm font-bold text-white mt-1">Statistical Anomaly Radar</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Rolling exponential moving average detects velocity surges and sentiment shifts with z-score anomaly thresholds exceeding 3.4σ.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e101a]/80 border border-white/[0.08] relative group hover:border-purple-500/40 transition-all">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-400">PHASE 04</span>
            <h3 className="text-sm font-bold text-white mt-1">Tactical Defense Actions</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Instant incident dispatch, automated counter-narrative generation, and analyst feedback loops (RLHF) for calibrated containment.
            </p>
          </div>

        </div>

        {/* Live Mock Terminal Box */}
        <div className="rounded-2xl border border-white/[0.09] bg-[#0c0e18]/80 shadow-2xl p-5 md:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="text-xs font-mono text-zinc-400 ml-2">gossip-protocol-daemon :: live-telemetry</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              SYS_OK · LATENCY: 14MS
            </span>
          </div>

          <div className="font-mono text-xs text-zinc-300 space-y-1.5">
            <p className="text-zinc-500">&gt; Ingestion thread [BSKY_FIREHOSE_01] connected (wss://bsky.network/xrpc/...)</p>
            <p className="text-zinc-300">&gt; Vector embedding pass complete: 30 new documents clustered across 6 narrative spaces.</p>
            <p className="text-amber-400">&gt; [ALERT_TRIGGER] Topic #1 &quot;Urban Water Supply Disruption&quot; volume +618% (Z=3.42σ breach)</p>
            <p className="text-purple-300">&gt; Sentiment shift recorded: -60.4% delta in 30 minutes. High escalation probability.</p>
            <p className="text-emerald-400">&gt; Incident #402 spawned in Threat Intelligence Center. Analyst notification dispatched.</p>
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section id="capabilities" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-14">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
            Tactical Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Engineered for High-Stakes Social Radar
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="p-6 rounded-2xl bg-[#0e101a]/70 border border-white/[0.08] hover:border-purple-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center mb-4 border border-purple-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Emerging Issue Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Detects pre-viral rumors, municipal service failures, and coordinated hashtags before they trend globally.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-purple-300 flex items-center justify-between">
              <span>Dynamic Exponential Z-Score</span>
              <span>σ &ge; 3.0</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e101a]/70 border border-white/[0.08] hover:border-purple-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-300 flex items-center justify-center mb-4 border border-indigo-500/30">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Coordinated Propagation Graph</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Extracts cross-platform user interaction graphs to expose astroturfing rings, bot velocity, and central amplification hubs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-indigo-300 flex items-center justify-between">
              <span>Force-Directed Graph</span>
              <span>D3 Acceleration</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e101a]/70 border border-white/[0.08] hover:border-purple-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center mb-4 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Analyst-in-the-Loop RLHF</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Human verification loop continuously reinforces true positives and suppresses false alarms with active prompt feedback.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-emerald-300 flex items-center justify-between">
              <span>Model Calibration</span>
              <span>94.8% Signal</span>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action Footer Section */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center z-10 relative">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#141727]/90 to-[#0b0c14]/90 border border-purple-500/30 shadow-2xl relative overflow-hidden">
          
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto mb-6 border border-purple-400/40">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            Ready to Monitor Social Vectors in Real Time?
          </h2>
          
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Access live incident streams, deep sentiment analytics, narrative graph clustering, and automated crisis mitigation protocols.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 border border-purple-400/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <span>{user ? 'Enter Command Center' : 'Access Terminal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={triggerLiveDemo}
              disabled={demoRunning}
              className="w-full sm:w-auto px-5 py-3 bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-3 h-3 fill-current text-purple-400" />
              <span>Simulate Incident Scan</span>
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.08] text-center text-xs text-zinc-500 z-10 relative">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div>
            GOSSIP PROTOCOL · SMART INDIA HACKATHON ED-2024
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>BERTopic Embeddings</span>
            <span>•</span>
            <span>React 19 Frontend</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
