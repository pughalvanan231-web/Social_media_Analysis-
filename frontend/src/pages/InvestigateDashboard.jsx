import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import IssueExplanation from '../components/IssueExplanation'
import GeoSpreadMap from '../components/GeoSpreadMap'

export default function InvestigateDashboard() {
  const { issueId } = useParams()
  const [issue, setIssue] = useState(null)
  const [posts, setPosts] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [platformFilter, setPlatformFilter] = useState('all')
  const [noteText, setNoteText] = useState('')
  const [verifying, setVerifying] = useState(false)

  const fetchOverview = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/investigate/${issueId}`)
      if (res.ok) setIssue(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/investigate/${issueId}/posts?platform=${platformFilter}`)
      if (res.ok) setPosts(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/investigate/${issueId}/history`)
      if (res.ok) setHistory(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  const init = async () => {
    setLoading(true)
    await Promise.all([fetchOverview(), fetchPosts(), fetchHistory()])
    setLoading(false)
  }

  useEffect(() => {
    init()
  }, [issueId, platformFilter])

  const handleVerify = async () => {
    setVerifying(true)
    try {
      await fetch(`http://127.0.0.1:8000/api/investigate/${issueId}/verify`, { method: 'POST' })
      await fetchHistory()
    } catch (e) {
      console.error(e)
    }
    setVerifying(false)
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    
    try {
      await fetch(`http://127.0.0.1:8000/api/investigate/${issueId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: noteText })
      })
      setNoteText('')
      await fetchHistory()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading && !issue) return <div className="text-center py-12 text-gray-500">Loading workspace...</div>
  if (!issue) return <div className="text-center py-12 text-red-500">Issue not found</div>

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/issues" className="text-blue-400 hover:text-blue-300">← Back</Link>
            <span className={`px-2 py-1 rounded text-xs font-bold border ${
              issue.signal_level === 'CRITICAL' ? 'bg-red-900/50 text-red-400 border-red-500' : 'bg-orange-900/50 text-orange-400 border-orange-500'
            }`}>
              {issue.signal_level}
            </span>
            <span className="text-xl font-bold text-gray-300">Score: {issue.signal_score}</span>
          </div>
          <h2 className="text-3xl font-bold text-white">{issue.topic_name}</h2>
          <div className="flex gap-2 mt-2">
            {issue.keywords.map(kw => (
              <span key={kw} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">#{kw}</span>
            ))}
          </div>
        </div>
        
        <button 
          onClick={handleVerify}
          disabled={verifying}
          className="mt-4 md:mt-0 px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg transition-colors"
        >
          {verifying ? 'Verifying...' : 'Mark as Verified'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Context & Spread */}
        <div className="lg:col-span-2 space-y-6">
          <IssueExplanation issueId={issueId} />
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Geographic & Community Spread</h3>
            <div className="h-[400px]">
              <GeoSpreadMap issueId={issueId} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Evidence / Source Posts</h3>
              <select 
                value={platformFilter} 
                onChange={e => setPlatformFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded p-1 text-sm focus:outline-none"
              >
                <option value="all">All Platforms</option>
                <option value="x">X / Twitter</option>
                <option value="bluesky">Bluesky</option>
                <option value="youtube">YouTube</option>
                <option value="reddit">Reddit</option>
              </select>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {posts.map(p => (
                <div key={p.id} className="bg-gray-900 p-4 rounded border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-blue-400">@{p.author}</span>
                    <span className="text-xs font-bold uppercase text-gray-500">{p.platform}</span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{p.text}</p>
                  <div className="flex justify-between mt-3 text-xs text-gray-500">
                    <span>{new Date(p.created_at).toLocaleString()}</span>
                    <span>Engagement: {p.engagement}</span>
                  </div>
                </div>
              ))}
              {posts.length === 0 && <div className="text-gray-500">No posts found for this platform.</div>}
            </div>
          </div>
        </div>

        {/* Right Column: Analyst Workspace */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Analyst Notes</h3>
            
            <form onSubmit={handleAddNote} className="mb-6">
              <textarea 
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                rows="4"
                placeholder="Add investigation notes..."
              ></textarea>
              <button type="submit" className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors">
                Save Note
              </button>
            </form>

            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">Audit Trail</h4>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className={`p-3 rounded text-sm border ${h.type === 'note' ? 'bg-gray-900 border-blue-900/50' : 'bg-gray-900/50 border-gray-700'}`}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-bold text-gray-400">{h.actor}</span>
                    <span>{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                  {h.type === 'note' ? (
                    <p className="text-gray-300">{h.content}</p>
                  ) : (
                    <p className="text-green-400 font-mono text-xs">{h.action}</p>
                  )}
                </div>
              ))}
              {history.length === 0 && <div className="text-gray-500 text-sm">No activity recorded.</div>}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
