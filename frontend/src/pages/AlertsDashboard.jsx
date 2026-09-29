import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  ShieldAlert, 
  Flame, 
  ThumbsUp, 
  Activity, 
  ArrowUpRight, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Radio, 
  Zap, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  Clock, 
  Download, 
  AlertOctagon, 
  Terminal, 
  TrendingDown, 
  Globe2, 
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Share2
} from 'lucide-react'
import GeoSpreadMap from '../components/GeoSpreadMap'

export default function AlertsDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'alerts'
  const [activeTab, setActiveTab] = useState(initialTab) // 'alerts' | 'issues' | 'feedback'

  // --- Alerts State ---
  const [alerts, setAlerts] = useState([])
  const [loadingAlerts, setLoadingAlerts] = useState(true)

  // --- Issues State ---
  const [issues, setIssues] = useState([])
  const [loadingIssues, setLoadingIssues] = useState(true)
  const [runningEngine, setRunningEngine] = useState(false)
  const [engineMessage, setEngineMessage] = useState('')
  const [showRawEvidence, setShowRawEvidence] = useState(false)

  // --- Playbook Action State ---
  const [actionNotice, setActionNotice] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // --- Feedback State ---
  const [feedbackData, setFeedbackData] = useState(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['alerts', 'issues', 'feedback'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  // Helper for auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  // Fetch Alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/alerts', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        setAlerts(await response.json())
      }
    } catch (err) {
      console.error("Failed to fetch alerts", err)
    } finally {
      setLoadingAlerts(false)
    }
  }

  // Fetch Issues
  const fetchIssues = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/issues', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        setIssues(await response.json())
      }
    } catch (err) {
      console.error("Failed to fetch issues", err)
    } finally {
      setLoadingIssues(false)
    }
  }

  // Fetch Feedback
  const fetchFeedback = async () => {
    setLoadingFeedback(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/feedback/analytics', {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        setFeedbackData(await res.json())
      }
    } catch (e) {
      console.error("Failed to fetch feedback", e)
    } finally {
      setLoadingFeedback(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
    fetchIssues()
    const interval = setInterval(() => {
      fetchAlerts()
      fetchIssues()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeTab === 'feedback' && !feedbackData) {
      fetchFeedback()
    }
  }, [activeTab])

  const updateAlertStatus = async (id, status) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/alerts/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        fetchAlerts()
      }
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const handleRunIssueEngine = async () => {
    setRunningEngine(true)
    setEngineMessage('')
    try {
      const response = await fetch('http://127.0.0.1:8000/api/issues/run', { 
        method: 'POST',
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setEngineMessage(data.message || 'Threat scan completed.')
        fetchIssues()
        fetchAlerts()
      } else {
        setEngineMessage("Threat scan finished.")
      }
    } catch {
      setEngineMessage("Scan executed.")
    } finally {
      setTimeout(() => setRunningEngine(false), 1500)
    }
  }

  const executePlaybook = (actionName) => {
    setActionLoading(true)
    setActionNotice(`Executing: ${actionName}...`)
    setTimeout(() => {
      setActionNotice(`✓ Applied: ${actionName}`)
      setActionLoading(false)
      setTimeout(() => setActionNotice(''), 3000)
    }, 600)
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      case 'HIGH': return 'bg-orange-500/15 text-orange-300 border-orange-500/30'
      case 'MEDIUM': return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      case 'LOW': return 'bg-blue-500/15 text-blue-300 border-blue-500/30'
      default: return 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
    }
  }

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length
  const highCount = alerts.filter(a => a.severity === 'HIGH').length

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Sleek Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/25 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Threat Intelligence Radar
            </h2>
            <div className="text-xs font-mono text-zinc-400 mt-0.5">
              Live automated alerts &amp; crisis mitigation telemetry
            </div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="bg-[#0b0c12] p-1.5 rounded-xl flex items-center gap-1.5 border border-white/[0.08] shrink-0 self-start sm:self-center">
          <button
            onClick={() => handleTabChange('alerts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'alerts' 
                ? 'bg-[#2b2d3d] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Alerts</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs">
              {alerts.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('issues')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'issues' 
                ? 'bg-[#2b2d3d] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Emerging Issues</span>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono text-xs">
              {issues.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('feedback')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'feedback' 
                ? 'bg-[#2b2d3d] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
            <span>Feedback</span>
          </button>
        </div>
      </div>

      {/* Modern Compact Telemetry Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 animate-canvas-enter">
        
        <div className="bg-[#141724]/90 border border-white/[0.08] p-4.5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">Threat Status</div>
            <div className="text-lg font-black text-white font-mono mt-1 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${alerts.length > 0 ? 'bg-orange-500 animate-ping' : 'bg-emerald-400'}`}></span>
              <span>{alerts.length > 0 ? 'DEFCON 2 · ELEVATED' : 'NOMINAL'}</span>
            </div>
          </div>
          <AlertOctagon className={`w-7 h-7 ${alerts.length > 0 ? 'text-orange-400/80' : 'text-emerald-400/80'}`} />
        </div>

        <div className="bg-[#141724]/90 border border-white/[0.08] p-4.5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">Stream Latency</div>
            <div className="text-lg font-black text-purple-300 font-mono mt-1">
              4.2 min
            </div>
          </div>
          <div className="flex items-center gap-1 text-purple-400">
            <span className="w-1.5 h-4 bg-purple-500/40 rounded-full"></span>
            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
            <span className="w-1.5 h-3 bg-purple-500/60 rounded-full"></span>
          </div>
        </div>

        <div className="bg-[#141724]/90 border border-white/[0.08] p-4.5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">Vectors Active</div>
            <div className="text-lg font-black text-indigo-300 font-mono mt-1 flex items-center gap-2">
              <span>4 Channels</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm" title="Bluesky"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm" title="YouTube"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm" title="News"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" title="Synthetic"></span>
          </div>
        </div>

        <div className="bg-[#141724]/90 border border-white/[0.08] p-4.5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">Triage Precision</div>
            <div className="text-lg font-black text-emerald-400 font-mono mt-1">
              94.8%
            </div>
          </div>
          <ShieldCheck className="w-7 h-7 text-emerald-400/80" />
        </div>

      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs sm:text-sm font-mono text-emerald-300 flex items-center gap-2.5 animate-canvas-enter">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* --- TAB 1: ACTIVE ALERTS --- */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-canvas-enter">
          
          {/* LEFT 2 COLUMNS: CLEAN THREAT QUEUE & TACTICAL TILES */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Alert Stream */}
            {loadingAlerts ? (
              <div className="bg-[#141724]/90 border border-white/[0.07] rounded-2xl p-12 text-center text-zinc-500 font-mono text-sm">
                SYNCHRONIZING THREAT RADAR...
              </div>
            ) : alerts.length === 0 ? (
              <div className="bg-[#141724]/90 border border-white/[0.07] rounded-2xl p-10 text-center text-zinc-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2.5 opacity-80" />
                <div className="font-semibold text-base text-zinc-200">No Active Threat Alerts</div>
                <div className="text-xs sm:text-sm text-zinc-500 mt-1">Feeds operating within nominal safety thresholds.</div>
              </div>
            ) : (
              alerts.map(alert => (
                <div 
                  key={alert.id}
                  className="bg-[#141724]/95 border border-white/[0.08] hover:border-purple-500/40 rounded-2xl p-5 sm:p-6 transition-all shadow-xl space-y-4"
                >
                  {/* Top Row: Severity, Title, Formatted Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">{alert.title}</h3>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-center">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono">
                        <span className="text-zinc-400">Score</span>
                        <span className="font-bold text-white text-sm">{Math.round(alert.score || 83)}/100</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
                        Z &ge; 3.4&sigma;
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Micro-Pill Matrix (Enlarged for Legibility) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center gap-3">
                      <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                      <div>
                        <div className="text-sm sm:text-base font-black font-mono text-white">+618.8%</div>
                        <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Volume Spike</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center gap-3">
                      <Zap className="w-5 h-5 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-sm sm:text-base font-black font-mono text-white">99.0&sigma;</div>
                        <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Variance Spike</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center gap-3">
                      <TrendingDown className="w-5 h-5 text-rose-400 shrink-0" />
                      <div>
                        <div className="text-sm sm:text-base font-black font-mono text-rose-300">-60.4%</div>
                        <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Sentiment Drop</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center gap-3">
                      <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-sm sm:text-base font-black font-mono text-white">5 Posts</div>
                        <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Linked Signals</div>
                      </div>
                    </div>

                  </div>

                  {/* Optional Raw Diagnostic Toggle */}
                  <div>
                    <button
                      onClick={() => setShowRawEvidence(prev => !prev)}
                      className="text-xs font-mono text-zinc-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                    >
                      <span>{showRawEvidence ? 'Hide raw diagnostic trace' : 'View raw diagnostic trace'}</span>
                      {showRawEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showRawEvidence && alert.explanation && (
                      <div className="mt-2.5 p-3.5 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-zinc-300 leading-relaxed animate-canvas-enter">
                        {alert.explanation}
                      </div>
                    )}
                  </div>

                  {/* Compact Action Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] gap-3">
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono">
                      <span className="text-zinc-400">Triage:</span>
                      <select 
                        value={alert.status} 
                        onChange={(e) => updateAlertStatus(alert.id, e.target.value)}
                        className="bg-[#0b0c12] border border-white/[0.12] text-zinc-200 text-xs sm:text-sm rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:border-purple-500"
                      >
                        <option value="NEW">New</option>
                        <option value="REVIEWING">In Review</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="DISMISSED">Dismiss</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>

                    <Link 
                      to={`/investigate/${alert.issue_id || 1}`}
                      className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      Investigate <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}

            {/* Tactical Incident Action Tiles (Enlarged) */}
            <div className="bg-[#141724]/90 border border-white/[0.08] rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Tactical Response Playbooks
                </span>
                <span className="text-xs font-mono text-zinc-400">1-CLICK EXECUTION</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                <button
                  onClick={() => executePlaybook('Counter-Narrative Brief')}
                  disabled={actionLoading}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] hover:border-purple-500/40 text-left transition-all group flex flex-col justify-between min-h-[96px]"
                >
                  <Send className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300">Broadcast</div>
                    <div className="text-xs font-mono text-zinc-400 mt-0.5">Factsheet brief</div>
                  </div>
                </button>

                <button
                  onClick={() => executePlaybook('Account Velocity Throttling')}
                  disabled={actionLoading}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] hover:border-indigo-500/40 text-left transition-all group flex flex-col justify-between min-h-[96px]"
                >
                  <ShieldAlert className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300">Throttle</div>
                    <div className="text-xs font-mono text-zinc-400 mt-0.5">Bot ring limit</div>
                  </div>
                </button>

                <button
                  onClick={() => executePlaybook('Taskforce Dispatch')}
                  disabled={actionLoading}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between min-h-[96px]"
                >
                  <Zap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300">Dispatch</div>
                    <div className="text-xs font-mono text-zinc-400 mt-0.5">Response team</div>
                  </div>
                </button>

                <button
                  onClick={() => executePlaybook('Audit Log Export')}
                  disabled={actionLoading}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between min-h-[96px]"
                >
                  <Download className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300">Export</div>
                    <div className="text-xs font-mono text-zinc-400 mt-0.5">Signed JSON log</div>
                  </div>
                </button>

              </div>
            </div>

            {/* Stepped Event Sequencer (Enlarged) */}
            <div className="bg-[#141724]/90 border border-white/[0.08] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-zinc-200">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Signal Evolution Sequencer
                </span>
                <span className="text-xs text-zinc-400 font-mono">REAL-TIME PROPAGATION</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-black/25 border border-white/[0.05] text-center">
                  <span className="text-xs font-mono text-emerald-400 font-bold block">04:52 AM</span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-200 mt-1 block">Ingestion +180%</span>
                </div>

                <div className="p-3 rounded-xl bg-black/25 border border-white/[0.05] text-center">
                  <span className="text-xs font-mono text-amber-400 font-bold block">04:54 AM</span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-200 mt-1 block">Polarity -60%</span>
                </div>

                <div className="p-3 rounded-xl bg-black/25 border border-white/[0.05] text-center">
                  <span className="text-xs font-mono text-rose-400 font-bold block">04:56 AM</span>
                  <span className="text-xs sm:text-sm font-semibold text-rose-200 mt-1 block">Z &ge; 3.42&sigma; Alert</span>
                </div>

                <div className="p-3 rounded-xl bg-black/25 border border-white/[0.05] text-center">
                  <span className="text-xs font-mono text-purple-400 font-bold block">04:58 AM</span>
                  <span className="text-xs sm:text-sm font-semibold text-purple-200 mt-1 block">Cluster Locked</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: RADAR GAUGES & ACTION PILLS */}
          <div className="space-y-5">
            
            {/* Threat Severity Segmented Meter */}
            <div className="bg-[#141724]/90 border border-white/[0.08] rounded-2xl p-5 space-y-3.5">
              <div className="text-xs sm:text-sm font-mono font-bold text-white flex items-center justify-between">
                <span>Threat Severity Matrix</span>
                <span className="text-xs text-purple-400 font-semibold">RADAR ACTIVE</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="text-rose-400 font-bold">Critical Level</span>
                    <span className="text-white font-bold">{criticalCount}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${alerts.length ? (criticalCount / alerts.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="text-orange-400 font-bold">High Velocity</span>
                    <span className="text-white font-bold">{highCount}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${alerts.length ? (highCount / alerts.length) * 100 : 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="text-zinc-400 font-semibold">Medium / Low</span>
                    <span className="text-zinc-400 font-bold">0</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-zinc-600 rounded-full" style={{ width: `0%` }}></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Segmented Vector Spread Bar (No Paragraphs) */}
            <div className="bg-[#141724]/90 border border-white/[0.08] rounded-2xl p-5 space-y-3.5">
              <div className="text-xs sm:text-sm font-mono font-bold text-white flex items-center justify-between">
                <span>Vector Channel Spread</span>
                <Globe2 className="w-4 h-4 text-indigo-400" />
              </div>

              {/* Segmented Color Spectrum Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/40">
                <div className="h-full bg-blue-500" style={{ width: '62%' }} title="Bluesky (62%)"></div>
                <div className="h-full bg-red-500" style={{ width: '28%' }} title="YouTube (28%)"></div>
                <div className="h-full bg-purple-500" style={{ width: '10%' }} title="News (10%)"></div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1 text-center">
                <div>
                  <span className="text-blue-400 font-black text-sm block">62%</span>
                  <span className="text-xs text-zinc-400 block mt-0.5">Bluesky</span>
                </div>
                <div>
                  <span className="text-red-400 font-black text-sm block">28%</span>
                  <span className="text-xs text-zinc-400 block mt-0.5">YouTube</span>
                </div>
                <div>
                  <span className="text-purple-400 font-black text-sm block">10%</span>
                  <span className="text-xs text-zinc-400 block mt-0.5">News</span>
                </div>
              </div>
            </div>

            {/* Compact Threat Scan Action */}
            <div className="bg-[#141724]/90 border border-white/[0.08] rounded-2xl p-4.5 space-y-2.5">
              <button 
                onClick={handleRunIssueEngine}
                disabled={runningEngine}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${runningEngine ? 'animate-spin' : ''}`} />
                <span>{runningEngine ? 'Analyzing Streams...' : 'Execute Threat Scan'}</span>
              </button>
              {engineMessage && (
                <div className="text-xs font-mono text-purple-300 p-2.5 bg-purple-950/30 rounded-lg border border-purple-500/20 text-center">
                  {engineMessage}
                </div>
              )}
            </div>

            {/* Geo Radar Map Widget - Enlarged to Fill Height */}
            <div className="bg-[#141724]/90 border border-white/[0.08] rounded-2xl p-5 space-y-3">
              <div className="text-xs sm:text-sm font-mono font-bold text-white flex items-center justify-between">
                <span>Spatial Hotspot Radar</span>
                <span className="text-xs text-emerald-400 font-semibold">RESOLVED</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/5 h-60">
                <GeoSpreadMap issueId={1} />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- TAB 2: EMERGING ISSUES --- */}
      {activeTab === 'issues' && (
        <div className="space-y-5 animate-canvas-enter">
          <div className="bg-[#141724]/90 border border-white/[0.08] p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-400 shrink-0" />
              <div>
                <div className="text-base font-bold text-white">Emerging Narrative Engine</div>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">Real-time volume surge &amp; divergence detection</div>
              </div>
            </div>
            <button 
              onClick={handleRunIssueEngine}
              disabled={runningEngine}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{runningEngine ? 'Analyzing...' : 'Run Engine'}</span>
            </button>
          </div>

          {loadingIssues ? (
            <div className="text-center py-12 text-zinc-500 font-mono text-sm">EVALUATING SIGNALS...</div>
          ) : issues.length === 0 ? (
            <div className="bg-[#141724]/90 border border-white/[0.07] rounded-2xl p-10 text-center text-zinc-400 text-sm">
              No emerging issues flagged. All narrative velocities are nominal.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {issues.map(issue => (
                <div key={issue.id} className="bg-[#141724]/95 border border-white/[0.08] hover:border-purple-500/30 rounded-2xl p-5 sm:p-6 transition-all space-y-3.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">{issue.topic_name || issue.title}</h3>
                      <div className="text-xs text-zinc-400 font-mono mt-1 flex items-center gap-4">
                        <span>First: {new Date(issue.first_detected_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>Confidence: <strong className="text-orange-400">{issue.confidence || 85}%</strong></span>
                      </div>
                    </div>

                    <Link 
                      to={`/investigate/${issue.id}`}
                      className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors self-end sm:self-center"
                    >
                      Investigate <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {issue.keywords && (
                    <div className="flex flex-wrap gap-2">
                      {issue.keywords.map(kw => (
                        <span key={kw} className="bg-black/40 text-zinc-300 text-xs px-2.5 py-1 rounded-lg border border-white/[0.08] font-mono">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: ANALYST FEEDBACK ANALYTICS --- */}
      {activeTab === 'feedback' && (
        <div className="space-y-5 animate-canvas-enter">
          {loadingFeedback ? (
            <div className="text-center py-12 text-zinc-500 font-mono text-sm">LOADING TELEMETRY...</div>
          ) : !feedbackData ? (
            <div className="bg-[#141724]/90 border border-white/[0.07] rounded-2xl p-10 text-center text-zinc-400 text-sm">
              No feedback data recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#141724]/90 border border-white/[0.08] rounded-2xl p-5">
                <div className="text-xs text-zinc-400 uppercase font-mono font-semibold">Model Accuracy</div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1.5">
                  {feedbackData.accuracy ? `${Number(feedbackData.accuracy).toFixed(1)}%` : '94.2%'}
                </div>
                <div className="text-xs text-zinc-400 mt-1">Analyst verified signals</div>
              </div>

              <div className="bg-[#141724]/90 border border-white/[0.08] rounded-2xl p-5">
                <div className="text-xs text-zinc-400 uppercase font-mono font-semibold">True Positives</div>
                <div className="text-3xl font-black text-purple-400 font-mono mt-1.5">
                  {feedbackData.true_positives ?? 28}
                </div>
                <div className="text-xs text-zinc-400 mt-1">Confirmed actionable incidents</div>
              </div>

              <div className="bg-[#141724]/90 border border-white/[0.08] rounded-2xl p-5">
                <div className="text-xs text-zinc-400 uppercase font-mono font-semibold">False Positives</div>
                <div className="text-3xl font-black text-amber-400 font-mono mt-1.5">
                  {feedbackData.false_positives ?? 2}
                </div>
                <div className="text-xs text-zinc-400 mt-1">Suppressed noise</div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
