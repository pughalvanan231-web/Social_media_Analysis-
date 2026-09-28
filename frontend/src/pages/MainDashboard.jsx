import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ReferenceDot 
} from 'recharts'
import { 
  MOCK_STATS, MOCK_ISSUES, MOCK_ALERTS, MOCK_TREND_DATA, 
  MOCK_PLATFORM_DATA, MOCK_SENTIMENT_DATA 
} from '../services/mockData'
import { useAuth } from '../context/AuthContext'
import GeometricAvatar from '../components/GeometricAvatar'
import { 
  CheckCircle2, 
  Flame, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  ChevronDown, 
  Radio, 
  Sparkles,
  Workflow,
  ExternalLink
} from 'lucide-react'

export default function MainDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(MOCK_STATS)
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [issues, setIssues] = useState(MOCK_ISSUES)
  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)
  const [quickAccessTab, setQuickAccessTab] = useState('topics') // 'topics' or 'sources'

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, issuesRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/dashboard/stats').catch(() => null),
        fetch('http://127.0.0.1:8000/api/alerts').catch(() => null),
        fetch('http://127.0.0.1:8000/api/issues').catch(() => null)
      ])
      
      let isLive = false
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
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-zinc-400 font-mono">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs uppercase tracking-widest text-purple-400">Loading Intelligence Dashboard...</div>
      </div>
    )
  }

  // Calculate actual dynamic metric counts
  const monitoredPostsCount = stats?.posts_analyzed?.toLocaleString() || '0'
  const activeIssuesCount = stats?.emerging_issues ?? (stats?.active_issues ?? issues.length)
  const criticalAlertsCount = stats?.critical_alerts ?? alerts.length
  const trendingTopicsCount = stats?.trending_topics ?? (stats?.active_signals ?? 0)

  return (
    <div className="space-y-5 pb-8 font-sans">
      
      {/* 1. Dynamic User Greeting Banner */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3.5">
          <GeometricAvatar size={48} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight leading-tight capitalize">
                {user?.username || 'Operator'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold uppercase">
                {user?.role || 'Analyst'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Social media intelligence radar active • Real-time anomaly detection
            </p>
          </div>
        </div>

        {/* Live telemetry status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="text-zinc-400">Pipeline:</span>
          <span className={apiConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
            {apiConnected ? 'LIVE FEED' : 'DEMO MODE'}
          </span>
        </div>
      </div>

      {/* 2. Top Metric Cards Row + Quick Access (matching sleek layout with actual platform data) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Left 4 Cards: Monitored Posts, Active Issues, Critical Alerts, Trending Topics */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <MetricCard 
            label="Monitored Posts"
            icon={<Activity className="w-3.5 h-3.5 text-zinc-400" />}
            value={monitoredPostsCount}
            description="Ingested across feeds"
            time="Live"
            link="/pipeline"
          />

          <MetricCard 
            label="Active Issues"
            icon={<Flame className="w-3.5 h-3.5 text-orange-400" />}
            value={activeIssuesCount}
            description="Emerging threat topics"
            time="Current"
            link="/issues"
            highlight="orange"
          />

          <MetricCard 
            label="Critical Alerts"
            icon={<ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
            value={criticalAlertsCount}
            description="Requires analyst triage"
            time="Active"
            link="/alerts"
            highlight="red"
          />

          <MetricCard 
            label="Trending Signals"
            icon={<TrendingUp className="w-3.5 h-3.5 text-purple-400" />}
            value={trendingTopicsCount}
            description="Spike rate > 2.5σ"
            time="Last 24h"
            link="/trends"
            highlight="purple"
          />

        </div>

        {/* Right 1 Card: Quick Access (segmented switcher for actual intelligence topics & sources) */}
        <div className="lg:col-span-4 bg-[#151722] border border-white/[0.07] rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-200 mb-2.5">Quick Access</div>
            
            {/* Segmented Button */}
            <div className="bg-[#0b0c12] p-0.5 rounded-lg flex items-center border border-white/[0.06] mb-2.5">
              <button 
                onClick={() => setQuickAccessTab('topics')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  quickAccessTab === 'topics' 
                    ? 'bg-[#2b2d3d] text-zinc-100 font-semibold' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Recent Topics
              </button>
              <button 
                onClick={() => setQuickAccessTab('sources')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  quickAccessTab === 'sources' 
                    ? 'bg-[#2b2d3d] text-zinc-100 font-semibold' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Data Sources
              </button>
            </div>

            {quickAccessTab === 'topics' ? (
              <div className="space-y-1.5 text-xs">
                {issues.length > 0 ? (
                  issues.slice(0, 2).map((issue) => (
                    <Link 
                      key={issue.id}
                      to={`/investigate/${issue.id}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className="truncate">{issue.topic_name || issue.title}</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                    </Link>
                  ))
                ) : (
                  <div className="text-zinc-500 text-xs py-1">No recent investigations.</div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                <Link 
                  to="/pipeline?tab=bluesky"
                  className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Bluesky Firehose
                  </span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </Link>
                <Link 
                  to="/pipeline?tab=youtube"
                  className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> YouTube Ingestion
                  </span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </Link>
              </div>
            )}
          </div>

          <p className="text-[11px] text-zinc-500 mt-2 font-mono">
            {quickAccessTab === 'topics' 
              ? 'Jump directly to active investigations.' 
              : 'Direct connectors for social media queries.'}
          </p>
        </div>

      </div>

      {/* 3. Items that need your attention (Actual active alerts or all-clear) */}
      <div className="bg-[#151722] border border-white/[0.07] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Items that need your attention</h3>
          <Link 
            to="/alerts" 
            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
          >
            View all alerts <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {alerts.length === 0 ? (
          <div className="flex items-center gap-3 py-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs text-zinc-300">
              <strong className="text-white font-semibold">Signals nominal.</strong> All intelligence alerts are triaged and monitored.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 2).map((alert) => (
              <div 
                key={alert.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] transition-all gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    alert.severity === 'CRITICAL' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">{alert.title}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                      {new Date(alert.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Severity: {alert.severity}
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/investigate/${alert.issue_id || 1}`}
                  className="text-xs font-semibold px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded border border-purple-500/30 transition-colors flex items-center gap-1 self-end sm:self-center"
                >
                  Investigate <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Follow the latest updates (Real platform intelligence activity stream) */}
      <div className="bg-[#151722] border border-white/[0.07] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Follow the latest updates</h3>
          <Link 
            to="/alerts?tab=issues" 
            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
          >
            All emerging issues <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {issues.length > 0 ? (
            issues.slice(0, 2).map((issue) => (
              <div key={issue.id} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-[10px]">
                    <Flame className="w-3 h-3" />
                  </div>
                  <span className="text-zinc-300">
                    Emerging issue detected: <Link to={`/investigate/${issue.id}`} className="font-semibold text-white hover:text-purple-400 transition-colors">{issue.topic_name || issue.title}</Link>
                  </span>
                </div>
                <span className="text-zinc-500 text-[11px] font-mono">
                  {issue.confidence ? `${Number(issue.confidence).toFixed(0)}% confidence` : 'Active'}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-[10px]">
                  <Workflow className="w-3 h-3" />
                </div>
                <span className="text-zinc-300">
                  Data pipeline active: Continuous monitoring across connected platforms
                </span>
              </div>
              <span className="text-zinc-500 text-[11px] font-mono">Real-time</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Deep Intelligence Telemetry (Trend Curve, Platform breakdown, Sentiment) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3.5 pt-1">
        
        {/* Trend Graph */}
        <div className="xl:col-span-2 bg-[#151722] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Global Volume Trend & Anomaly Outliers</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Continuous ingestion volume with 3σ anomaly threshold markers</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Anomaly
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2333" vertical={false} />
                <XAxis dataKey="time" stroke="#525b75" fontSize={11} tickLine={false} />
                <YAxis stroke="#525b75" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#141724', borderColor: '#2b3042', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#c084fc' }}
                />
                <Line type="monotone" dataKey="volume" stroke="#a855f7" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#c084fc' }} />
                <ReferenceDot x="20:00" y={9200} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment & Platform Split */}
        <div className="bg-[#151722] border border-white/[0.07] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 tracking-tight mb-1">Sentiment Polarization</h3>
            <p className="text-xs text-zinc-400 mb-3">HuggingFace RoBERTa distribution</p>

            <div className="h-28 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MOCK_SENTIMENT_DATA} cx="50%" cy="50%" innerRadius={32} outerRadius={46} dataKey="value" stroke="none">
                    {MOCK_SENTIMENT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#141724', borderColor: '#2b3042', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col gap-1 text-[11px] font-mono text-zinc-300 ml-2">
                <div className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-sm"></span> Pos (15%)</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 bg-zinc-500 rounded-sm"></span> Neu (25%)</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-sm"></span> Neg (60%)</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06]">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Cross-Platform Mix</h4>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_PLATFORM_DATA} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#8b95b5" fontSize={11} width={65} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ backgroundColor: '#141724', borderColor: '#2b3042', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={9} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

function MetricCard({ label, icon, value, description, time, link, highlight }) {
  const highlightClass = 
    highlight === 'red' ? 'group-hover:text-red-400' :
    highlight === 'orange' ? 'group-hover:text-orange-400' :
    highlight === 'purple' ? 'group-hover:text-purple-400' :
    'group-hover:text-indigo-400'

  return (
    <Link 
      to={link}
      className="bg-[#151722] border border-white/[0.07] hover:border-white/20 rounded-xl p-4 flex flex-col justify-between transition-all group"
    >
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-medium text-zinc-300">{label}</span>
          {icon}
        </div>
        <div className={`text-2xl font-bold text-white font-mono mb-1 transition-colors ${highlightClass}`}>
          {value}
        </div>
        <div className="text-xs text-zinc-400">
          {description}
        </div>
      </div>
      <div className="text-[11px] text-zinc-500 mt-3 font-mono">
        {time}
      </div>
    </Link>
  )
}
