import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Workflow, Cloud, Video, Play, RefreshCw, CheckCircle2, AlertCircle, Database, Search } from 'lucide-react'

export default function PipelineDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'pipeline'
  const [activeTab, setActiveTab] = useState(initialTab) // 'pipeline' | 'bluesky' | 'youtube'

  // Sync with searchParams
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['pipeline', 'bluesky', 'youtube'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  // --- Pipeline Orchestration State ---
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
      
      fetchStatus()
      setKeyword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  // --- Bluesky Connector State ---
  const [bskyKeyword, setBskyKeyword] = useState('')
  const [bskyPosts, setBskyPosts] = useState([])
  const [bskyLoading, setBskyLoading] = useState(false)
  const [bskyError, setBskyError] = useState(null)

  const handleBskySearch = async (e) => {
    e.preventDefault()
    if (!bskyKeyword.trim()) return

    setBskyLoading(true)
    setBskyError(null)
    setBskyPosts([])

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/connectors/bluesky/search?q=${encodeURIComponent(bskyKeyword)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch posts from Bluesky connector')
      }
      const data = await response.json()
      setBskyPosts(data.posts || [])
    } catch (err) {
      setBskyError(err.message)
    } finally {
      setBskyLoading(false)
    }
  }

  // --- YouTube Connector State ---
  const [ytKeyword, setYtKeyword] = useState('')
  const [ytPosts, setYtPosts] = useState([])
  const [ytLoading, setYtLoading] = useState(false)
  const [ytError, setYtError] = useState(null)

  const handleYtSearch = async (e) => {
    e.preventDefault()
    if (!ytKeyword.trim()) return

    setYtLoading(true)
    setYtError(null)
    setYtPosts([])

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/connectors/youtube/search?q=${encodeURIComponent(ytKeyword)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch videos from YouTube connector')
      }
      const data = await response.json()
      setYtPosts(data.posts || [])
    } catch (err) {
      setYtError(err.message)
    } finally {
      setYtLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Data Pipeline & Ingestion Connectors</h2>
              <p className="text-xs text-gray-400 mt-0.5">Orchestrate multi-platform ingestion, live stream querying, and deduplication</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-black/40 border border-white/5 rounded-xl self-stretch md:self-auto overflow-x-auto">
          <button
            onClick={() => handleTabChange('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Pipeline Orchestrator
          </button>
          <button
            onClick={() => handleTabChange('bluesky')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'bluesky'
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Bluesky Stream
          </button>
          <button
            onClick={() => handleTabChange('youtube')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'youtube'
                ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            YouTube Stream
          </button>
        </div>
      </div>

      {/* TAB 1: PIPELINE ORCHESTRATION */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-base font-semibold mb-4 text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-400" />
              Trigger Pipeline Ingestion Job
            </h3>
            <form onSubmit={handleRun} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">Target Query / Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. artificial intelligence, renewable energy, financial volatility..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">Active Connectors</label>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(sources).map(source => (
                    <label 
                      key={source} 
                      className={`flex items-center space-x-2.5 cursor-pointer px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                        sources[source] 
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' 
                          : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={sources[source]}
                        onChange={(e) => setSources({...sources, [source]: e.target.checked})}
                        className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-0 bg-black/40 border-white/20"
                      />
                      <span className="capitalize">{source}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={running}
                  className={`px-6 py-2.5 rounded-xl font-medium text-xs text-white transition-all flex items-center gap-2 ${
                    running 
                      ? 'bg-gray-700/50 cursor-not-allowed opacity-60' 
                      : 'bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-md shadow-purple-600/20'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
                  {running ? 'Ingesting Feeds...' : 'Execute Ingestion Run'}
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recent Execution History</h3>
              <button 
                onClick={fetchStatus} 
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="text-[11px] uppercase tracking-wider text-gray-400 bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Timestamp</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Fetched</th>
                    <th className="px-4 py-3 text-right">Inserted</th>
                    <th className="px-4 py-3 text-right">Duplicates</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {runs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        No pipeline runs recorded yet.
                      </td>
                    </tr>
                  ) : runs.map(run => (
                    <tr key={run.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono">
                        {new Date(run.run_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-white capitalize">
                        {run.source}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          run.status === 'completed' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-blue-400 font-mono">{run.records_fetched}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-mono">{run.records_inserted}</td>
                      <td className="px-4 py-3 text-right text-amber-400 font-mono">{run.duplicates_removed}</td>
                      <td className="px-4 py-3 text-right text-rose-400 font-mono">{run.errors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLUESKY CONNECTOR */}
      {activeTab === 'bluesky' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  Live AT Protocol Feed Explorer
                </h3>
                <p className="text-xs text-gray-400 mt-1">Directly query public Bluesky nodes for decentralised conversational metrics</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">
                  AT Protocol
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                  Public API
                </span>
              </div>
            </div>

            <form onSubmit={handleBskySearch} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={bskyKeyword}
                onChange={(e) => setBskyKeyword(e.target.value)}
                placeholder="Search Bluesky posts (e.g. security, climate, politics)..."
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
              <button 
                type="submit"
                disabled={bskyLoading}
                className={`px-6 py-2.5 rounded-xl font-medium text-xs text-white transition-all flex items-center justify-center gap-2 ${
                  bskyLoading 
                    ? 'bg-gray-700/50 cursor-not-allowed opacity-60' 
                    : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/20'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                {bskyLoading ? 'Querying Bluesky...' : 'Fetch Feed'}
              </button>
            </form>

            {bskyError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                {bskyError}
              </div>
            )}
          </div>

          {bskyPosts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Fetched Posts ({bskyPosts.length})</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bskyPosts.map((post) => (
                  <div key={post.id} className="glass-panel p-5 rounded-2xl hover:border-white/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="text-blue-400 text-xs font-mono">@{post.author_username || 'unknown'}</div>
                        <div className="text-gray-500 text-[11px]">{new Date(post.created_at).toLocaleString()}</div>
                      </div>
                      <p className="text-white text-sm leading-relaxed mb-4">{post.text}</p>
                    </div>
                    
                    <div>
                      <div className="flex gap-4 text-xs text-gray-400 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-rose-400">♥</span> {post.likes}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-400">💬</span> {post.comments}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400">🔄</span> {post.shares}
                        </div>
                        <div className="ml-auto text-[10px] px-2 py-0.5 bg-white/5 rounded border border-white/5 text-gray-400 uppercase tracking-wider">
                          {post.platform}
                        </div>
                      </div>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {post.hashtags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: YOUTUBE CONNECTOR */}
      {activeTab === 'youtube' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-rose-400" />
                  Live YouTube Video Connector
                </h3>
                <p className="text-xs text-gray-400 mt-1">Directly query video metadata, view counts, and channel engagement signals</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  YouTube Data API
                </span>
              </div>
            </div>

            <form onSubmit={handleYtSearch} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={ytKeyword}
                onChange={(e) => setYtKeyword(e.target.value)}
                placeholder="Search YouTube videos (e.g. geopolitics, market crash, tech)..."
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors"
                required
              />
              <button 
                type="submit"
                disabled={ytLoading}
                className={`px-6 py-2.5 rounded-xl font-medium text-xs text-white transition-all flex items-center justify-center gap-2 ${
                  ytLoading 
                    ? 'bg-gray-700/50 cursor-not-allowed opacity-60' 
                    : 'bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-md shadow-rose-600/20'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                {ytLoading ? 'Querying YouTube...' : 'Fetch Videos'}
              </button>
            </form>

            {ytError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                {ytError}
              </div>
            )}
          </div>

          {ytPosts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Fetched Videos ({ytPosts.length})</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ytPosts.map((post) => (
                  <div key={post.id} className="glass-panel p-5 rounded-2xl hover:border-white/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-rose-400 text-xs font-mono">📺 {post.author_username || 'Unknown Channel'}</div>
                        <div className="text-gray-500 text-[11px]">{new Date(post.created_at).toLocaleString()}</div>
                      </div>
                      <h4 className="text-white text-sm font-semibold mb-2 line-clamp-2">
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">
                          {post.text.split('\n')[0]}
                        </a>
                      </h4>
                      <p className="text-gray-400 text-xs mb-4 line-clamp-3">
                        {post.text.split('\n').slice(2).join('\n')}
                      </p>
                    </div>
                    
                    <div className="flex gap-4 text-xs text-gray-400 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">👁️</span> {post.views?.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-rose-400">👍</span> {post.likes?.toLocaleString()}
                      </div>
                      <div className="ml-auto text-[10px] px-2 py-0.5 bg-white/5 rounded border border-white/5 text-gray-400 uppercase tracking-wider">
                        YouTube
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
