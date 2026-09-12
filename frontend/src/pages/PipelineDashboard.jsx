import React, { useState, useEffect } from 'react'

export default function PipelineDashboard() {
  const [keyword, setKeyword] = useState('')
  const [sources, setSources] = useState({
    bluesky: true,
    youtube: false,
    x: false,
    reddit: false
  })
  const [running, setRunning] = useState(false)
  const [runs, setRuns] = useState([])
  const [error, setError] = useState(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pipeline/status')
      if (response.ok) {
        const data = await response.json()
        setRuns(data)
      }
    } catch (err) {
      console.error("Failed to fetch pipeline status", err)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRun = async (e) => {
    e.preventDefault()
    if (!keyword.trim()) return
    
    const selectedSources = Object.keys(sources).filter(s => sources[s])
    if (selectedSources.length === 0) {
      setError("Please select at least one source")
      return
    }

    setRunning(true)
    setError(null)
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          sources: selectedSources
        })
      })
      
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Pipeline run failed')
      }
      
      // Instantly fetch new status when complete
      fetchStatus()
      setKeyword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-purple-900/40 p-6 rounded-lg border border-purple-500/50 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Unified Data Pipeline</h2>
          <p className="text-purple-300 mt-1">Orchestrate ingestion, normalization, and deduplication across all sources.</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-white">Trigger Manual Run</h3>
        <form onSubmit={handleRun} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Target Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. technology"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Sources</label>
            <div className="flex flex-wrap gap-4">
              {Object.keys(sources).map(source => (
                <label key={source} className="flex items-center space-x-2 cursor-pointer bg-gray-900 p-3 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={sources[source]}
                    onChange={(e) => setSources({...sources, [source]: e.target.checked})}
                    className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-offset-gray-900 bg-gray-700 border-gray-600"
                  />
                  <span className="text-white capitalize">{source}</span>
                </label>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg">
              {error}
            </div>
          )}
          
          <button 
            type="submit"
            disabled={running}
            className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-colors ${running ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {running ? 'Pipeline Running...' : 'Execute Pipeline'}
          </button>
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <h3 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">Recent Pipeline Runs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Time</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Fetched</th>
                <th className="px-4 py-3 text-right">Inserted</th>
                <th className="px-4 py-3 text-right">Duplicates</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Errors</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No pipeline runs recorded yet.
                  </td>
                </tr>
              ) : runs.map(run => (
                <tr key={run.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(run.run_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-white capitalize">
                    {run.source}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${run.status === 'completed' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-blue-400 font-mono">{run.records_fetched}</td>
                  <td className="px-4 py-3 text-right text-green-400 font-mono">{run.records_inserted}</td>
                  <td className="px-4 py-3 text-right text-yellow-400 font-mono">{run.duplicates_removed}</td>
                  <td className="px-4 py-3 text-right text-red-400 font-mono">{run.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
