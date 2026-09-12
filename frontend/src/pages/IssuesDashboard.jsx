import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GeoSpreadMap from '../components/GeoSpreadMap'
import IssueExplanation from '../components/IssueExplanation'

export default function IssuesDashboard() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedIssue, setExpandedIssue] = useState(null)
  const [expandedExplanation, setExpandedExplanation] = useState(null)

  const fetchIssues = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/issues')
      if (response.ok) {
        setIssues(await response.json())
      }
    } catch (err) {
      console.error("Failed to fetch issues", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssues()
    const interval = setInterval(fetchIssues, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleRunEngine = async () => {
    setRunning(true)
    setMessage('')
    try {
      const response = await fetch('http://127.0.0.1:8000/api/issues/run', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setMessage(data.message)
      } else {
        setMessage("Failed to trigger engine.")
      }
    } catch (err) {
      setMessage("Error connecting to intelligence service.")
    } finally {
      setTimeout(() => setRunning(false), 2000)
    }
  }

  const getBadgeColors = (level) => {
    switch(level) {
      case 'CRITICAL': return 'bg-red-900/50 border-red-500 text-red-400'
      case 'HIGH': return 'bg-orange-900/50 border-orange-500 text-orange-400'
      case 'MEDIUM': return 'bg-yellow-900/50 border-yellow-500 text-yellow-400'
      case 'LOW': return 'bg-blue-900/50 border-blue-500 text-blue-400'
      default: return 'bg-gray-800 border-gray-600 text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-red-900/60 to-purple-900/60 p-6 rounded-lg border border-red-500/50 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Emerging Issue Engine</h2>
          <p className="text-red-200 mt-1">Multi-signal aggregation evaluating Volume, Engagement, Sentiment, Narrative, and Community vectors.</p>
        </div>
        <button 
          onClick={handleRunEngine}
          disabled={running}
          className={`mt-4 md:mt-0 px-6 py-2 rounded-lg font-semibold text-white transition-colors shadow-lg ${running ? 'bg-red-700/50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 shadow-red-500/20'}`}
        >
          {running ? 'Evaluating...' : 'Run Issue Detection'}
        </button>
      </div>

      {message && (
        <div className="bg-red-900/40 border border-red-500/50 p-4 rounded-lg text-red-200">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Evaluating intelligence signals...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {issues.length === 0 ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400 border border-gray-700">
              No emerging issues detected. Signals are nominal.
            </div>
          ) : (
            issues.map(issue => (
              <div key={issue.id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col">
                
                <div className="flex flex-col md:flex-row">
                  {/* Score Panel */}
                  <div className={`p-6 flex flex-col justify-center items-center md:w-48 border-b md:border-b-0 md:border-r border-gray-700 ${issue.signal_level === 'CRITICAL' ? 'bg-red-950/30' : ''}`}>
                    <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Signal Score</div>
                    <div className={`text-5xl font-black ${issue.signal_score >= 85 ? 'text-red-500' : issue.signal_score >= 60 ? 'text-orange-500' : 'text-yellow-500'}`}>
                      {issue.signal_score}
                    </div>
                    <div className="text-gray-500 text-sm font-mono mt-1">/ 100</div>
                    
                    <div className={`mt-4 px-3 py-1 rounded border font-bold text-sm tracking-wide ${getBadgeColors(issue.signal_level)}`}>
                      {issue.signal_level}
                    </div>
                  </div>

                  {/* Content Panel */}
                  <div className="p-6 flex-1 relative">
                    <h3 className="text-2xl font-bold text-white mb-2">{issue.topic_name}</h3>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {issue.keywords && issue.keywords.map(kw => (
                        <span key={kw} className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">#{kw}</span>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Reason / Contributing Factors:</h4>
                      <ul className="space-y-2">
                        {issue.contributing_factors && issue.contributing_factors.map((factor, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-500 mr-2 mt-0.5">•</span>
                            <span className="text-gray-300">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="absolute top-6 right-6 flex flex-col gap-2">
                      <Link 
                        to={`/investigate/${issue.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold transition-colors shadow-lg text-center"
                      >
                        Deep Investigate
                      </Link>
                      <button 
                        onClick={() => setExpandedExplanation(expandedExplanation === issue.id ? null : issue.id)}
                        className="px-4 py-2 bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-200 rounded text-sm font-medium transition-colors border border-indigo-500/50"
                      >
                        {expandedExplanation === issue.id ? 'Hide Explanation' : 'Why Flagged?'}
                      </button>
                      <button 
                        onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors border border-gray-600"
                      >
                        {expandedIssue === issue.id ? 'Hide Geo Spread' : 'View Geo Spread'}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedExplanation === issue.id && (
                  <div className="p-6 border-t border-gray-700 bg-gray-900/80">
                    <IssueExplanation issueId={issue.id} />
                  </div>
                )}

                {expandedIssue === issue.id && (
                  <div className="p-6 border-t border-gray-700 bg-gray-900/50">
                    <GeoSpreadMap issueId={issue.id} />
                  </div>
                )}
                
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
