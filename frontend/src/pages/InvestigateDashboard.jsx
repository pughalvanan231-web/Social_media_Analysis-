import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, ReferenceDot } from 'recharts'
import { MOCK_ISSUES, MOCK_CORRELATION, MOCK_SIGNALS, MOCK_EVIDENCE, MOCK_TREND_DATA, MOCK_PLATFORM_DATA } from '../services/mockData'
import GeoSpreadMap from '../components/GeoSpreadMap'

export default function InvestigateDashboard() {
  const { issueId } = useParams()
  
  const [issue, setIssue] = useState(null)
  const [correlation, setCorrelation] = useState(null)
  const [signals, setSignals] = useState([])
  const [evidence, setEvidence] = useState([])
  const [timeline, setTimeline] = useState([])
  const [platformStats, setPlatformStats] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [history, setHistory] = useState([])
  const [generatingReport, setGeneratingReport] = useState(false)
  const [isDemoFallback, setIsDemoFallback] = useState(false)

  const fetchData = async () => {
    try {
      // Try fetching real API data, fallback to mock if it fails
      const baseUrl = `http://127.0.0.1:8000/api/issues/${issueId}`
      
      const [issueRes, corrRes, sigRes, evRes, timeRes] = await Promise.all([
        fetch(baseUrl).catch(() => null),
        fetch(`${baseUrl}/correlation`).catch(() => null),
        fetch(`${baseUrl}/signals`).catch(() => null),
        fetch(`${baseUrl}/evidence`).catch(() => null),
        fetch(`${baseUrl}/timeline`).catch(() => null),
      ])

      if (issueRes && issueRes.ok) {
        setIssue(await issueRes.json())
      } else {
        setIssue(MOCK_ISSUES.find(i => i.id == issueId) || MOCK_ISSUES[0])
      }

      if (corrRes && corrRes.ok) {
        setCorrelation(await corrRes.json())
      } else {
        setCorrelation(MOCK_CORRELATION)
      }

      if (sigRes && sigRes.ok) {
        setSignals(await sigRes.json())
      } else {
        setSignals(MOCK_SIGNALS)
      }

      if (evRes && evRes.ok) {
        setEvidence(await evRes.json())
      } else {
        setEvidence(MOCK_EVIDENCE)
      }

      if (timeRes && timeRes.ok) {
        const timeData = await timeRes.json()
        setTimeline(timeData.length ? timeData : MOCK_TREND_DATA)
      } else {
        setTimeline(MOCK_TREND_DATA)
      }
      
      // We can derive platform stats from evidence if not provided directly
      setPlatformStats(MOCK_PLATFORM_DATA)
      
      // Mock history for notes
      setHistory([{ type: 'note', actor: 'System', content: 'Issue investigation initialized.', timestamp: new Date().toISOString() }])

    } catch (e) {
      console.warn("Using mock data", e)
      setIsDemoFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [issueId])

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setHistory([...history, { type: 'note', actor: 'A. SMITH (L2)', content: noteText, timestamp: new Date().toISOString() }])
    setNoteText('')
  }
  
  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      
      const res = await fetch(`http://127.0.0.1:8000/api/reports`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ issue_id: Number(issueId), format: 'pdf' })
      })
      
      if (!res.ok) throw new Error("Report generation failed")
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `Intelligence_Report_Issue_${issueId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch(e) {
      console.error(e)
      alert("Failed to generate report from server. Please ensure the backend is running.")
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) return <div className="flex h-[60vh] items-center justify-center text-blue-400 font-mono">LOADING WORKSPACE...</div>
  if (!issue) return <div className="text-center py-12 text-red-500">Issue not found</div>

  return (
    <div className="space-y-6 pb-12 text-gray-200">
      
      {/* HEADER */}
      <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/" className="text-gray-500 hover:text-white transition-colors text-sm font-bold">← DASHBOARD</Link>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
              issue.status === 'HIGH SIGNAL' || issue.confidence >= 70 ? 'bg-red-900/40 text-red-400' : 'bg-orange-900/40 text-orange-400'
            }`}>
              {issue.status || 'EMERGING'}
            </span>
            {isDemoFallback && (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-900/40 text-purple-400 border border-purple-500/50">
                DEMO MODE FALLBACK
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-white">{issue.title || "Unknown Issue"}</h1>
        </div>
        <div className="mt-4 md:mt-0 flex gap-6 text-xs font-mono text-gray-500 text-right">
          <div className="flex flex-col">
            <span>FIRST DETECTED</span>
            <span className="text-gray-300 font-bold">{new Date(issue.timestamp || issue.first_detected_at).toLocaleString()}</span>
          </div>
          <div className="flex flex-col border-l border-gray-800 pl-6">
            <span>LAST UPDATED</span>
            <span className="text-gray-300 font-bold">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Data & Charts */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* SECTION 1 - Intelligence Summary */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Section 1: Intelligence Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <SummaryCard label="Activity Change" value={`+${Number(issue.activity_change_percent).toFixed(1)}%`} color="text-red-400" />
              <SummaryCard label="Anomaly Score" value={`${Number(issue.anomaly_score).toFixed(1)}σ`} color="text-orange-400" />
              <SummaryCard label="Sentiment" value={issue.sentiment_score < 0.4 ? "Negative" : "Neutral"} color="text-blue-400" />
              <SummaryCard label="Related Posts" value={correlation?.number_of_posts?.toLocaleString() || "0"} color="text-gray-200" />
              <SummaryCard label="Platforms" value={correlation?.platforms_detected?.length || "1"} color="text-gray-200" />
              <SummaryCard label="Time Window" value="Past 24h" color="text-gray-200" />
            </div>
          </div>

          {/* SECTION 1.5 - Geographic Spread */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Section 2: Geographic Spread</h2>
            <div className="h-72">
              <GeoSpreadMap issueId={issueId} />
            </div>
          </div>

          {/* SECTION 3 - Timeline */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Section 3: Timeline</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="time" stroke="#4b5563" fontSize={12} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                  <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  {/* Mark Anomaly if exists */}
                  <ReferenceDot x="20:00" y={9200} r={5} fill="#ef4444" stroke="none" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs font-mono text-gray-500">
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> First Signal</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Acceleration</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Peak Anomaly</span>
            </div>
          </div>

          {/* SECTION 4 & 5 - Platforms and Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Section 4: Platform Analysis</h2>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformStats} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={60} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{fill: '#1f2937'}} contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Section 5: Key Topics</h2>
              <div className="flex flex-wrap gap-2">
                {correlation?.related_keywords?.map(kw => (
                  <span key={kw} className="bg-gray-800 border border-gray-700 text-blue-400 font-mono text-xs px-3 py-1.5 rounded">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 6 - Evidence */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Section 6: Representative Evidence</h2>
            <div className="space-y-4">
              {evidence.map(ev => (
                <div key={ev.evidence_id || ev.id} className="bg-gray-950 border border-gray-800 rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50"></div>
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{ev.platform}</span>
                    <span className="text-[10px] font-mono text-gray-600">{new Date(ev.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-300 pl-2 mb-3">{ev.text}</p>
                  <div className="pl-2 flex justify-between items-center bg-gray-900/50 p-2 rounded text-xs">
                    <span className="text-green-400 font-bold">{ev.reason}</span>
                    <a href={ev.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View Source ↗</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Explanations & Notes */}
        <div className="space-y-6">
          
          {/* SECTION 2 - Why was this detected */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Sec 2: Why Detected?</h2>
            <div className="space-y-3">
              {signals.map(sig => (
                <div key={sig.id} className="flex items-start gap-3 bg-gray-950/50 p-3 rounded border border-gray-800">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-500 mb-0.5">{sig.signal_type.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-gray-300">{sig.explanation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7 - Analyst Notes */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Sec 7: Analyst Notes</h2>
            <div className="max-h-48 overflow-y-auto space-y-3 mb-4 pr-2">
              {history.map((h, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700/50 p-3 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-blue-400">{h.actor}</span>
                    <span className="text-[10px] font-mono text-gray-500">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm text-gray-300">{h.content}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddNote}>
              <textarea 
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add investigation context..."
                className="w-full bg-gray-950 border border-gray-800 rounded p-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 resize-none h-24 mb-2"
              />
              <button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold uppercase tracking-widest py-2 rounded transition-colors">
                Save Note
              </button>
            </form>
          </div>

          {/* SECTION 8 - Report */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Sec 8: Export</h2>
            <p className="text-xs text-gray-500 mb-4">Compile all evidence, timeline, signals, and analyst notes into an actionable intelligence brief.</p>
            <button 
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded transition-colors"
            >
              {generatingReport ? 'GENERATING...' : 'Generate Intelligence Report'}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-gray-950 border border-gray-800 p-3 rounded">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</div>
      <div className={`text-xl font-black ${color}`}>{value}</div>
    </div>
  )
}
