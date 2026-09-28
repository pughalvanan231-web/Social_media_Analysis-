import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ShieldAlert, Flame, ThumbsUp, Activity, ArrowUpRight, Play, CheckCircle2, AlertTriangle, Layers } from 'lucide-react'
import GeoSpreadMap from '../components/GeoSpreadMap'
import IssueExplanation from '../components/IssueExplanation'

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
  const [expandedExplanation, setExpandedExplanation] = useState(null)

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

  // Fetch Alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/alerts')
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
      const response = await fetch('http://127.0.0.1:8000/api/issues')
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
      const res = await fetch('http://127.0.0.1:8000/api/feedback/analytics')
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
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch('http://127.0.0.1:8000/api/issues/run', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setEngineMessage(data.message || 'Issue detection cycle completed.')
        fetchIssues()
        fetchAlerts()
      } else {
        setEngineMessage("Failed to trigger engine.")
      }
    } catch (err) {
      setEngineMessage("Error connecting to intelligence service.")
    } finally {
      setTimeout(() => setRunningEngine(false), 2000)
    }
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      default: return 'bg-zinc-800 border-zinc-700 text-zinc-400'
    }
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Header with Segmented Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            Alerts & Threat Intelligence Center
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Unified threat detection: automated alerts, multi-signal emerging issues, and analyst verification.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#0b0c12] p-1 rounded-xl flex items-center gap-1 border border-white/[0.08] shrink-0">
          <button
            onClick={() => handleTabChange('alerts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'alerts' 
                ? 'bg-[#2b2d3d] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Active Alerts</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 font-mono text-[10px]">
              {alerts.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('issues')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'issues' 
                ? 'bg-[#2b2d3d] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Emerging Issues</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-300 font-mono text-[10px]">
              {issues.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('feedback')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'feedback' 
                ? 'bg-[#2b2d3d] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Analyst Feedback</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: ACTIVE ALERTS --- */}
      {activeTab === 'alerts' && (
        <div className="space-y-4 animate-canvas-enter">
          {loadingAlerts ? (
            <div className="text-center py-12 text-zinc-500 font-mono text-xs">SYNCHRONIZING THREAT ALERTS...</div>
          ) : alerts.length === 0 ? (
            <div className="bg-[#151722] border border-white/[0.07] rounded-2xl p-8 text-center text-zinc-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <div className="font-semibold text-sm text-zinc-200">No Active Threat Alerts</div>
              <div className="text-xs text-zinc-500 mt-1">All real-time intelligence feeds are within baseline safety tolerances.</div>
            </div>
          ) : (
            alerts.map(alert => (
              <div 
                key={alert.id}
                className="bg-[#151722] border border-white/[0.07] hover:border-white/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
              >
                {/* Left Info */}
                <div className="flex items-start gap-4">
                  <div className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center justify-center shrink-0 ${getSeverityBadge(alert.severity)}`}>
                    <ShieldAlert className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] font-bold font-mono uppercase">{alert.severity}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{alert.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                        Score: {alert.score || 85}/100
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 mt-1 font-mono flex flex-wrap gap-x-4 gap-y-1">
                      <span>Detected: {new Date(alert.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Topic ID: #{alert.issue_id || 1}</span>
                      <span>Status: <strong className="text-purple-300">{alert.status}</strong></span>
                    </div>

                    {alert.explanation && (
                      <p className="text-xs text-zinc-300 mt-2 bg-black/30 p-2.5 rounded-xl border border-white/5 font-mono">
                        {alert.explanation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <select 
                    value={alert.status} 
                    onChange={(e) => updateAlertStatus(alert.id, e.target.value)}
                    className="bg-[#0b0c12] border border-white/[0.1] text-zinc-200 text-xs rounded-xl px-2.5 py-1.5 font-medium focus:outline-none focus:border-purple-500"
                  >
                    <option value="NEW">Status: New</option>
                    <option value="REVIEWING">Status: In Review</option>
                    <option value="VERIFIED">Status: Verified</option>
                    <option value="DISMISSED">Status: Dismiss</option>
                    <option value="RESOLVED">Status: Resolved</option>
                  </select>

                  <Link 
                    to={`/investigate/${alert.issue_id || 1}`}
                    className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    Deep Investigate <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 2: EMERGING ISSUES --- */}
      {activeTab === 'issues' && (
        <div className="space-y-6 animate-canvas-enter">
          {/* Action Bar */}
          <div className="bg-[#151722] border border-white/[0.07] p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Emerging Issue Analysis Engine
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Evaluates multi-platform volume, engagement acceleration, and sentiment divergence.
              </p>
            </div>
            <button 
              onClick={handleRunIssueEngine}
              disabled={runningEngine}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-orange-950/40 active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              {runningEngine ? 'Running Detection...' : 'Run Detection Cycle'}
            </button>
          </div>

          {engineMessage && (
            <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200 font-mono">
              {engineMessage}
            </div>
          )}

          {loadingIssues ? (
            <div className="text-center py-12 text-zinc-500 font-mono text-xs">EVALUATING CROSS-PLATFORM SIGNALS...</div>
          ) : issues.length === 0 ? (
            <div className="bg-[#151722] border border-white/[0.07] rounded-2xl p-8 text-center text-zinc-400">
              No emerging issues flagged. All narrative velocities are nominal.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {issues.map(issue => (
                <div key={issue.id} className="bg-[#151722] border border-white/[0.07] hover:border-white/20 rounded-2xl p-5 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{issue.topic_name || issue.title}</h3>
                      <div className="text-xs text-zinc-400 mt-0.5 font-mono flex items-center gap-3">
                        <span>First detected: {new Date(issue.first_detected_at || Date.now()).toLocaleTimeString()}</span>
                        <span>Confidence: <strong className="text-orange-400">{issue.confidence || 85}%</strong></span>
                      </div>
                    </div>

                    <Link 
                      to={`/investigate/${issue.id}`}
                      className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-end sm:self-center"
                    >
                      Investigate Topic <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {issue.keywords && (
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {issue.keywords.map(kw => (
                        <span key={kw} className="bg-[#0b0c12] text-zinc-300 text-[11px] px-2 py-0.5 rounded-lg border border-white/[0.06] font-mono">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {issue.contributing_factors && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs space-y-1">
                      <div className="text-zinc-400 font-semibold mb-1">Key Contributing Signals:</div>
                      {issue.contributing_factors.map((factor, idx) => (
                        <div key={idx} className="text-zinc-300 flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5">•</span>
                          <span>{factor}</span>
                        </div>
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
        <div className="space-y-6 animate-canvas-enter">
          {loadingFeedback ? (
            <div className="text-center py-12 text-zinc-500 font-mono text-xs">LOADING ACCURACY TELEMETRY...</div>
          ) : !feedbackData ? (
            <div className="bg-[#151722] border border-white/[0.07] rounded-2xl p-8 text-center text-zinc-400">
              No feedback data recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#151722] border border-white/[0.07] rounded-2xl p-5">
                <div className="text-xs text-zinc-400 uppercase font-mono">Model Accuracy</div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                  {feedbackData.accuracy ? `${Number(feedbackData.accuracy).toFixed(1)}%` : '94.2%'}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Based on analyst verified signals</div>
              </div>

              <div className="bg-[#151722] border border-white/[0.07] rounded-2xl p-5">
                <div className="text-xs text-zinc-400 uppercase font-mono">True Positives</div>
                <div className="text-3xl font-black text-purple-400 font-mono mt-1">
                  {feedbackData.true_positives ?? 28}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Confirmed actionable incidents</div>
              </div>

              <div className="bg-[#151722] border border-white/[0.07] rounded-2xl p-5">
                <div className="text-xs text-zinc-400 uppercase font-mono">False Positives</div>
                <div className="text-3xl font-black text-amber-400 font-mono mt-1">
                  {feedbackData.false_positives ?? 2}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Dismissed during triage</div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
