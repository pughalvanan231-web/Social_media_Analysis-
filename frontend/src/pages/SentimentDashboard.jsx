import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function SentimentDashboard() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0 })
  const [posts, setPosts] = useState([])
  const navigate = useNavigate()

  const fetchPostsAndStats = async () => {
    try {
      // In a real app we would have a dedicated stats endpoint
      // For MVP, we'll fetch posts and aggregate locally for demonstration
      const response = await fetch('http://127.0.0.1:8000/api/posts?limit=50')
      if (response.ok) {
        const data = await response.json()
        
        // Fetch analysis for each post to aggregate (in production we'd do this via a SQL join on the backend)
        let pos = 0, neu = 0, neg = 0
        const enrichedPosts = []
        
        for (const post of data) {
          try {
            const analysisRes = await fetch(`http://127.0.0.1:8000/api/posts/${post.id}/analysis`)
            if (analysisRes.ok) {
              const analysis = await analysisRes.json()
              post.analysis = analysis
              if (analysis.sentiment === 'positive') pos++
              if (analysis.sentiment === 'neutral') neu++
              if (analysis.sentiment === 'negative') neg++
            }
          } catch (e) {
            // Ignore if no analysis yet
          }
          enrichedPosts.push(post)
        }
        
        setStats({ positive: pos, neutral: neu, negative: neg })
        setPosts(enrichedPosts.filter(p => p.analysis)) // Only show analyzed
      }
    } catch (err) {
      console.error("Failed to fetch sentiment stats", err)
    }
  }

  useEffect(() => {
    fetchPostsAndStats()
    const interval = setInterval(fetchPostsAndStats, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleRunAnalysis = async () => {
    setRunning(true)
    setMessage('')
    try {
      const response = await fetch('http://127.0.0.1:8000/api/ai/analyze/sentiment?batch_size=50', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setMessage(data.message)
      } else {
        setMessage("Failed to trigger analysis.")
      }
    } catch (err) {
      setMessage("Error connecting to AI service.")
    } finally {
      setTimeout(() => setRunning(false), 2000)
    }
  }

  const chartData = [
    { name: 'Positive', value: stats.positive, color: '#4ade80' },
    { name: 'Neutral', value: stats.neutral, color: '#94a3b8' },
    { name: 'Negative', value: stats.negative, color: '#f87171' }
  ]

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-6 rounded-lg border border-indigo-500/50 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Local AI Sentiment Engine</h2>
          <p className="text-indigo-200 mt-1">100% private, on-device NLP processing (Hugging Face Transformers)</p>
        </div>
        <button 
          onClick={handleRunAnalysis}
          disabled={running}
          className={`mt-4 md:mt-0 px-6 py-2 rounded-lg font-semibold text-white transition-colors shadow-lg ${running ? 'bg-indigo-700/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}
        >
          {running ? 'Triggering...' : 'Run Batch Analysis'}
        </button>
      </div>
      
      {message && (
        <div className="bg-indigo-900/40 border border-indigo-500/50 p-4 rounded-lg text-indigo-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold mb-6 text-white w-full border-b border-gray-700 pb-2">Sentiment Distribution</h3>
          {stats.positive === 0 && stats.neutral === 0 && stats.negative === 0 ? (
            <div className="text-gray-500 h-64 flex items-center">No analysis data yet.</div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">Analyzed Feed</h3>
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] pr-2 custom-scrollbar">
            {posts.length === 0 ? (
              <div className="text-gray-500 text-center mt-10">No analyzed posts to display.</div>
            ) : (
              posts.map(post => (
                <div 
                  key={post.id} 
                  className="bg-gray-900/50 p-4 rounded border border-gray-700/50 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => navigate(`/sentiment/feed/${post.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-400 capitalize">{post.platform} • @{post.author_username}</span>
                    <span className={`text-xs px-2 py-1 rounded font-bold
                      ${post.analysis.sentiment === 'positive' ? 'bg-green-900/30 text-green-400' : 
                        post.analysis.sentiment === 'negative' ? 'bg-red-900/30 text-red-400' : 
                        'bg-gray-700 text-gray-300'}
                    `}>
                      {post.analysis.sentiment.toUpperCase()} ({(post.analysis.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-3">{post.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
