import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GeoSpreadMap from '../components/GeoSpreadMap'

export default function MainDashboard() {
  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [dateFilter, setDateFilter] = useState('24h')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, issuesRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/dashboard/stats'),
        fetch('http://127.0.0.1:8000/api/alerts'),
        fetch('http://127.0.0.1:8000/api/issues')
      ])
      
      if (statsRes.ok) setStats(await statsRes.json())
      if (alertsRes.ok) {
        const allAlerts = await alertsRes.json()
        setAlerts(allAlerts.slice(0, 5)) // Top 5 recent alerts
      }
      if (issuesRes.ok) {
        const allIssues = await issuesRes.json()
        setIssues(allIssues.slice(0, 5)) // Top 5 issues
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center text-blue-400 font-mono">INITIALIZING INTELLIGENCE FEED...</div>
  }

  return (
    <div className="space-y-6">
      
      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded px-3 py-1.5 focus:outline-none">
          <option value="1h">Past Hour</option>
          <option value="24h">Past 24 Hours</option>
          <option value="7d">Past 7 Days</option>
        </select>
        <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded px-3 py-1.5 focus:outline-none">
          <option value="all">All Platforms</option>
          <option value="x">X</option>
          <option value="bluesky">Bluesky</option>
          <option value="youtube">YouTube</option>
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded px-3 py-1.5 focus:outline-none">
          <option value="all">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
        </select>
        
        <div className="ml-auto">
          <button onClick={fetchData} className="bg-blue-900/40 text-blue-400 border border-blue-800/50 hover:bg-blue-800/40 text-sm px-4 py-1.5 rounded transition-colors font-medium flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Active Signals" value={stats?.active_signals || 0} color="text-yellow-400" />
        <KPICard title="Critical Alerts" value={stats?.critical_alerts || 0} color="text-red-500" isAlert={stats?.critical_alerts > 0} />
        <KPICard title="Emerging Issues" value={stats?.emerging_issues || 0} color="text-orange-400" />
        <KPICard title="Trending Topics" value={stats?.trending_topics || 0} color="text-purple-400" />
        <KPICard title="Platforms" value={stats?.platforms || 0} color="text-blue-400" />
        <KPICard title="Posts Analyzed" value={stats?.posts_analyzed?.toLocaleString() || 0} color="text-green-400" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Issues & Spread */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Top Emerging Issues</h3>
              <Link to="/issues" className="text-sm text-blue-400 hover:text-blue-300">View All →</Link>
            </div>
            
            <div className="space-y-3">
              {issues.length === 0 ? (
                <div className="text-gray-500 text-center py-6 text-sm">No emerging issues detected.</div>
              ) : (
                issues.map(issue => (
                  <div key={issue.id} className="bg-gray-800/50 border border-gray-700/50 p-3 rounded flex justify-between items-center hover:bg-gray-800 transition-colors">
                    <div>
                      <div className="font-bold text-gray-200">{issue.topic_name}</div>
                      <div className="text-xs text-gray-500 mt-1 flex gap-2">
                        {issue.keywords.slice(0, 3).map(k => <span key={k}>#{k}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-xl font-black ${issue.signal_score >= 85 ? 'text-red-500' : 'text-orange-400'}`}>
                          {issue.signal_score}
                        </div>
                      </div>
                      <Link to={`/investigate/${issue.id}`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded">
                        Investigate
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Global Geographic Spread</h3>
            {issues.length > 0 ? (
              <div className="h-[300px] rounded overflow-hidden border border-gray-700">
                <GeoSpreadMap issueId={issues[0].id} />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-900 rounded border border-gray-800">
                Insufficient signal data for geographic mapping.
              </div>
            )}
          </div>
          
        </div>

        {/* Right Col: Alerts & Mini panels */}
        <div className="space-y-6">
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Recent Alerts</h3>
              <Link to="/alerts" className="text-sm text-blue-400 hover:text-blue-300">View All →</Link>
            </div>
            
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-gray-500 text-center py-6 text-sm">Incident queue empty.</div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="bg-gray-800/80 border-l-4 border-red-500 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-900/50 text-red-400">{alert.severity}</span>
                      <span className="text-xs text-gray-500">{new Date(alert.detected_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="mt-2 font-semibold text-gray-200 text-sm truncate">
                      {alert.supporting_metrics?.topic_name || "Unknown"}
                    </div>
                    <div className="mt-1 text-xs text-gray-400 line-clamp-2">
                      {alert.reason}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Placeholders for visual layout completeness if heavy graph not loaded */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Sentiment Overview</h3>
            <div className="h-24 flex items-center justify-center border border-dashed border-gray-700 rounded text-gray-500 text-sm">
              Global sentiment is slightly negative (-0.12)
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Community Network</h3>
            <div className="h-32 flex items-center justify-center border border-dashed border-gray-700 rounded text-gray-500 text-sm flex-col">
              <span className="mb-2">12 Active Clusters Detected</span>
              <Link to="/network" className="text-blue-400 hover:underline">Open Network Graph</Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

function KPICard({ title, value, color, isAlert }) {
  return (
    <div className={`bg-gray-900/80 border p-4 rounded-lg flex flex-col justify-center ${isAlert ? 'border-red-500/50 bg-red-950/20' : 'border-gray-800'}`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{title}</div>
      <div className={`text-3xl font-black ${color}`}>{value}</div>
    </div>
  )
}
