import React, { useState, useEffect } from 'react'

export default function IssueExplanation({ issueId }) {
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!issueId) return
    
    setLoading(true)
    fetch(`http://127.0.0.1:8000/api/issues/${issueId}/explanation`)
      .then(res => {
        if (!res.ok) throw new Error("Explanation not available")
        return res.json()
      })
      .then(data => {
        setExplanation(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [issueId])

  if (loading) return <div className="p-4 text-blue-400">Loading explanation...</div>
  if (error) return <div className="p-4 text-red-400">{error}</div>
  if (!explanation) return null

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-indigo-500/30">
      <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        WHY FLAGGED?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 text-gray-300">
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Discussion volume: <strong className="text-white">{explanation.volume_change}</strong></span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Sentiment change: <strong className="text-white">{explanation.sentiment_change}</strong></span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Engagement change: <strong className="text-white">{explanation.engagement_change}</strong></span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Topic/narrative growth: <strong className="text-white">{explanation.topic_growth}</strong></span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Geographic spread: <strong className="text-white">{explanation.geographic_spread}</strong></span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Community spread: <strong className="text-white">{explanation.community_spread}</strong></span>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">ℹ</span>
            <span>Signal Confidence: <strong className="text-blue-400">{explanation.confidence}</strong></span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Representative Posts</h4>
          <div className="space-y-3">
            {explanation.representative_posts.map((post, i) => (
              <div key={i} className="bg-gray-900 p-3 rounded border border-gray-700 text-sm">
                <p className="text-gray-300 italic mb-2">"{post.text}"</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="uppercase">{post.platform}</span>
                  <span>Engagement: {post.engagement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
