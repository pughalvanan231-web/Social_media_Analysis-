import React, { useState, useEffect } from 'react'

export default function NarrativesDashboard() {
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
    const bgColor = type === 'rapid' ? 'bg-fuchsia-900/40 border-fuchsia-500/50' : 
                    type === 'emerging' ? 'bg-indigo-900/40 border-indigo-500/50' : 
                    'bg-slate-800 border-slate-600'
                    
    const titleColor = type === 'rapid' ? 'text-fuchsia-400' : 
                       type === 'emerging' ? 'text-indigo-400' : 
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
      <div className="bg-gradient-to-r from-purple-900/60 to-fuchsia-900/60 p-6 rounded-lg border border-purple-500/50 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Narrative Velocity Engine</h2>
          <p className="text-purple-200 mt-1">Advanced tracking of narrative evolution and propagation speed.</p>
        </div>
        <button 
          onClick={handleRunIntelligence}
          disabled={running}
          className={`mt-4 md:mt-0 px-6 py-2 rounded-lg font-semibold text-white transition-colors shadow-lg ${running ? 'bg-purple-700/50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'}`}
        >
          {running ? 'Processing...' : 'Analyze Narratives'}
        </button>
      </div>

      {message && (
        <div className="bg-purple-900/40 border border-purple-500/50 p-4 rounded-lg text-purple-200">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading narrative data...</div>
      ) : (
        <div className="space-y-10">
          {/* Rapid Narratives Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-700 pb-2">
              <h3 className="text-2xl font-bold text-white">High-Velocity Narratives</h3>
              <span className="bg-fuchsia-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">CRITICAL</span>
            </div>
            {narratives.rapid.length === 0 ? (
              <p className="text-gray-500">No high-velocity narratives detected currently.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {narratives.rapid.map(topic => <TopicCard key={topic.id} topic={topic} type="rapid" />)}
              </div>
            )}
          </section>

          {/* Forming Narratives Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-700 pb-2">
              <h3 className="text-2xl font-bold text-white">Forming Narratives</h3>
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">WATCH</span>
            </div>
            {narratives.emerging.length === 0 ? (
              <p className="text-gray-500">No forming narratives detected currently.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {narratives.emerging.map(topic => <TopicCard key={topic.id} topic={topic} type="emerging" />)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
