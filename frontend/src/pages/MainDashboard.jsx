import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ReferenceDot } from 'recharts'
import { MOCK_STATS, MOCK_ISSUES, MOCK_ALERTS, MOCK_TREND_DATA, MOCK_PLATFORM_DATA, MOCK_SENTIMENT_DATA } from '../services/mockData'

export default function MainDashboard() {
  const [stats, setStats] = useState(MOCK_STATS)
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [issues, setIssues] = useState(MOCK_ISSUES)
  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, issuesRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/dashboard/stats').catch(() => null),
        fetch('http://127.0.0.1:8000/api/alerts').catch(() => null),
        fetch('http://127.0.0.1:8000/api/issues').catch(() => null)
      ])
      
      let isLive = false;
      
      if (statsRes && statsRes.ok) {
        setStats(await statsRes.json())
        isLive = true
      }
      if (alertsRes && alertsRes.ok) {
        const allAlerts = await alertsRes.json()
        setAlerts(allAlerts.slice(0, 5))
        isLive = true
      }
      if (issuesRes && issuesRes.ok) {
        const allIssues = await issuesRes.json()
        setIssues(allIssues.slice(0, 5))
        isLive = true
      }
      
      setApiConnected(isLive)
    } catch (e) {
      console.warn("Using mock data due to API unavailability", e)
      setApiConnected(false)
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
    return <div className="flex h-[60vh] items-center justify-center text-blue-400 font-mono">INITIALIZING GOSSIP PROTOCOL...</div>
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / System Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">GOSSIP PROTOCOL</h2>
          <p className="text-sm text-gray-400 font-mono mt-1">Cross-platform early-signal intelligence</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 text-sm font-mono items-center">
          <div className="flex flex-col text-right">
            <span className="text-gray-500 text-xs">MONITORING STATUS</span>
            <span className={`font-bold ${apiConnected ? 'text-green-400' : 'text-yellow-500'}`}>
              {apiConnected ? 'LIVE PIPELINE ACTIVE' : 'DEMO MODE - MOCK DATA'}
            </span>
          </div>
          <div className="flex flex-col text-right pl-4 border-l border-gray-800">
            <span className="text-gray-500 text-xs">ANALYST</span>
            <span className="text-blue-400 font-bold">A. SMITH (L2)</span>
          </div>
        </div>
      </div>

      {/* Workflow Visualization */}
      <div className="flex justify-between items-center text-xs font-mono text-gray-600 px-8 py-2">
        <span className="text-blue-500 font-bold">COLLECT</span>
        <span>→</span>
        <span className="text-blue-400 font-bold">ANALYZE</span>
        <span>→</span>
        <span className="text-orange-400 font-bold">DETECT</span>
        <span>→</span>
        <span className="text-red-400 font-bold">EXPLAIN</span>
        <span>→</span>
        <span className="text-purple-400 font-bold">INVESTIGATE</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Monitored Posts" value={stats?.posts_analyzed?.toLocaleString() || 0} color="text-gray-200" />
        <KPICard title="Active Issues" value={stats?.active_issues || 0} color="text-orange-400" />
        <KPICard title="Emerging Signals" value={stats?.emerging_signals || 0} color="text-yellow-400" />
        <KPICard title="Critical Alerts" value={stats?.critical_alerts || 0} color="text-red-500" isAlert={stats?.critical_alerts > 0} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Emerging Issues & Charts */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Emerging Issues Feed */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Detected Emerging Issues</h3>
              <Link to="/issues" className="text-xs text-blue-400 hover:text-blue-300">View All →</Link>
            </div>
            
            <div className="space-y-3">
              {issues.length === 0 ? (
                <div className="text-gray-500 text-center py-6 text-sm">No emerging issues detected.</div>
              ) : (
                issues.map(issue => (
                  <div key={issue.id} className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-lg flex flex-col hover:bg-gray-800/60 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-gray-100 text-lg">{issue.title || issue.topic_name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex gap-3">
                          <span>First detected: {new Date(issue.timestamp || issue.first_detected_at).toLocaleTimeString()}</span>
                          {issue.platforms && (
                            <span className="text-gray-400">
                              Platforms: {issue.platforms.map(p => p.toUpperCase()).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`px-2 py-1 text-xs font-bold rounded ${issue.status === 'HIGH SIGNAL' ? 'bg-red-900/30 text-red-400' : 'bg-orange-900/30 text-orange-400'}`}>
                        {issue.status || 'EMERGING'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-gray-900/50 rounded p-2 text-center">
                        <div className="text-[10px] text-gray-500 uppercase">Activity Change</div>
                        <div className="text-sm font-bold text-gray-300">+{Number(issue.activity_change_percent).toFixed(1)}%</div>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2 text-center">
                        <div className="text-[10px] text-gray-500 uppercase">Anomaly Score</div>
                        <div className="text-sm font-bold text-gray-300">{Number(issue.anomaly_score).toFixed(1)}σ</div>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2 text-center">
                        <div className="text-[10px] text-gray-500 uppercase">Signal Confidence</div>
                        <div className={`text-sm font-bold ${issue.confidence >= 70 ? 'text-red-400' : 'text-orange-400'}`}>
                          {Number(issue.confidence).toFixed(1)}/100
                        </div>
                      </div>
                    </div>
                    
                      <div className="flex gap-2">
                      <Link to={`/investigate/${issue.id}`} className="flex-1 text-center py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold rounded border border-blue-500/20 transition-colors">
                        Investigate Topic
                      </Link>
                      <Link to={`/investigate/${issue.id}`} className="flex-1 text-center py-1.5 bg-gray-700/20 hover:bg-gray-700/50 text-gray-300 text-xs font-bold rounded border border-gray-600/30 transition-colors block">
                        View Evidence
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Trend Chart */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Global Volume Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="time" stroke="#4b5563" fontSize={12} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    <ReferenceDot x="20:00" y={9200} r={5} fill="#ef4444" stroke="none" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Anomaly Detected
              </div>
            </div>

            {/* Distributions */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5 flex flex-col">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Cross-Platform Distribution</h3>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_PLATFORM_DATA} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={60} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{fill: '#1f2937'}} contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mt-4 mb-2">Sentiment Distribution</h3>
              <div className="h-28 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={MOCK_SENTIMENT_DATA} cx="50%" cy="50%" innerRadius={30} outerRadius={45} dataKey="value" stroke="none">
                      {MOCK_SENTIMENT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-col gap-1 ml-4 text-xs text-gray-400">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-sm"></span> Positive</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-gray-500 rounded-sm"></span> Neutral</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-sm"></span> Negative</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Alerts */}
        <div className="space-y-6">
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5 h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Explainable Alerts</h3>
              <Link to="/alerts" className="text-xs text-blue-400 hover:text-blue-300">View All →</Link>
            </div>
            
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-gray-500 text-center py-6 text-sm">No active alerts.</div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="bg-gray-950 border border-gray-800 rounded overflow-hidden">
                    {/* Alert Header */}
                    <div className={`px-3 py-2 border-b ${alert.severity === 'CRITICAL' ? 'border-red-900/50 bg-red-950/20' : 'border-orange-900/50 bg-orange-950/20'} flex justify-between items-center`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${alert.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`}>
                        {alert.severity} ALERT
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(alert.detected_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    
                    {/* Alert Body */}
                    <div className="p-3">
                      <div className="font-bold text-gray-200 text-sm mb-2">{alert.title}</div>
                      
                      {/* Explanations parsed from backend text */}
                      <div className="space-y-1 mt-2">
                        {alert.explanation?.split('\n').filter(line => line.startsWith('✓')).map((line, i) => (
                          <div key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{line.replace('✓', '').trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="bg-gray-900/50 px-3 py-2 border-t border-gray-800 flex justify-end gap-2">
                      <button className="text-[10px] uppercase font-bold tracking-wider text-gray-400 hover:text-white px-2 py-1">Dismiss</button>
                      <Link to={`/investigate/${alert.issue_id}`} className="text-[10px] uppercase font-bold tracking-wider text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-900/20 rounded border border-blue-900/50 text-center">Investigate to Report</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

function KPICard({ title, value, color, isAlert }) {
  return (
    <div className={`bg-gray-900/40 border p-4 rounded-lg flex flex-col justify-center ${isAlert ? 'border-red-900/50' : 'border-gray-800'}`}>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{title}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  )
}
