import React, { useState, useEffect } from 'react'

export default function IntelligenceDashboard() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [narratives, setNarratives] = useState({ rapid: [], emerging: [], major: [] })
  const [loading, setLoading] = useState(true)

  const fetchNarratives = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/intelligence/narratives')
      if (response.ok) {
        const data = await response.json()
        setNarratives({
          rapid: data.rapidly_growing || [],
          emerging: data.emerging || [],
          major: data.major || []
        })
      }
    } catch (err) {
      console.error("Failed to fetch narratives", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNarratives()
    const interval = setInterval(fetchNarratives, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRunIntelligence = async () => {
    setRunning(true)
    setMessage('')
    try {
      const response = await fetch('http://127.0.0.1:8000/api/intelligence/run', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setMessage(data.message)
      } else {
        setMessage("Failed to trigger analysis.")
      }
    } catch (err) {
      setMessage("Error connecting to intelligence service.")
    } finally {
      setTimeout(() => setRunning(false), 2000)
    }
  }

  const TopicCard = ({ topic, type }) => {
    const bgColor = type === 'rapid' ? 'bg-orange-900/40 border-orange-500/50' : 
                    type === 'emerging' ? 'bg-teal-900/40 border-teal-500/50' : 
                    'bg-slate-800 border-slate-600'
                    
    const titleColor = type === 'rapid' ? 'text-orange-400' : 
                       type === 'emerging' ? 'text-teal-400' : 
                       'text-slate-300'

    return (
      <div className={`p-5 rounded-lg border shadow-lg ${bgColor} transition-transform hover:scale-[1.02] cursor-pointer`}>
        <div className="flex justify-between items-start mb-3">
          <h4 className={`text-lg font-bold ${titleColor} truncate mr-2`}>{topic.name}</h4>
          <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap
            ${topic.growth >= 100 ? 'bg-green-900/50 text-green-400' : 
              topic.growth > 0 ? 'bg-emerald-900/30 text-emerald-400' : 
              'bg-red-900/30 text-red-400'}`}>
            {topic.growth > 0 ? '+' : ''}{topic.growth}%
          </span>
        </div>
        
        <div className="mb-4">
          <span className="text-gray-400 text-sm block mb-1">Top Keywords:</span>
          <div className="flex flex-wrap gap-1">
            {topic.keywords && topic.keywords.slice(0, 5).map(kw => (
              <span key={kw} className="bg-gray-900/80 text-gray-300 text-xs px-2 py-1 rounded">
                {kw}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm border-t border-gray-700/50 pt-3 mt-auto">
          <span className="text-gray-400">Volume</span>
          <span className="font-mono font-bold text-white">{topic.volume.toLocaleString()} posts</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-amber-900/60 to-orange-900/60 p-6 rounded-lg border border-amber-500/50 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Topic & Narrative Intelligence</h2>
          <p className="text-amber-200 mt-1">Unsupervised BERTopic clustering and narrative velocity tracking.</p>
        </div>
        <button 
          onClick={handleRunIntelligence}
          disabled={running}
          className={`mt-4 md:mt-0 px-6 py-2 rounded-lg font-semibold text-white transition-colors shadow-lg ${running ? 'bg-amber-700/50 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'}`}
        >
          {running ? 'Clustering...' : 'Run Topic Discovery'}
        </button>
      </div>

      {message && (
        <div className="bg-amber-900/40 border border-amber-500/50 p-4 rounded-lg text-amber-200">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading intelligence data...</div>
      ) : (
        <div className="space-y-10">
          {/* Rapid Narratives Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-700 pb-2">
              <h3 className="text-2xl font-bold text-white">Rapidly Growing Narratives</h3>
              <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">HOT</span>
            </div>
            {narratives.rapid.length === 0 ? (
              <p className="text-gray-500">No rapidly growing narratives detected currently.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {narratives.rapid.map(topic => <TopicCard key={topic.id} topic={topic} type="rapid" />)}
              </div>
            )}
          </section>

          {/* Emerging Topics Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-700 pb-2">
              <h3 className="text-2xl font-bold text-white">Emerging Topics</h3>
              <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
            </div>
            {narratives.emerging.length === 0 ? (
              <p className="text-gray-500">No emerging topics detected currently.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {narratives.emerging.map(topic => <TopicCard key={topic.id} topic={topic} type="emerging" />)}
              </div>
            )}
          </section>

          {/* Major Topics Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-700 pb-2">
              <h3 className="text-2xl font-bold text-white">Existing Major Topics</h3>
            </div>
            {narratives.major.length === 0 ? (
              <p className="text-gray-500">No major topics detected currently.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {narratives.major.map(topic => <TopicCard key={topic.id} topic={topic} type="major" />)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
