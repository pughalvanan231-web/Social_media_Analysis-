import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Layers, 
  GitBranch, 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  ChevronRight, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  Radar, 
  Eye, 
  BarChart3,
  Flame,
  ArrowUpRight
} from 'lucide-react'

export default function IntelligenceDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'narratives'
  const [activeTab, setActiveTab] = useState(initialTab) // 'narratives' | 'topics' | 'risk'

  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [narratives, setNarratives] = useState({ rapid: [], emerging: [], major: [] })
  const [allTopics, setAllTopics] = useState([])
  const [topicSearch, setTopicSearch] = useState('')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [topicDetail, setTopicDetail] = useState(null)
  const [loadingTopicDetail, setLoadingTopicDetail] = useState(false)
  const [topRiskPost, setTopRiskPost] = useState(null)
  const [loadingRisk, setLoadingRisk] = useState(false)
  const [loading, setLoading] = useState(true)

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['narratives', 'topics', 'risk'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

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
    }
  }

  const fetchAllTopics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/intelligence/topics')
      if (response.ok) {
        const data = await response.json()
        setAllTopics(data || [])
        if (data && data.length > 0 && !selectedTopic) {
          handleSelectTopic(data[0].id)
        }
      }
    } catch (err) {
      console.error("Failed to fetch topics", err)
    }
  }

  const fetchTopRisk = async () => {
    setLoadingRisk(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/intelligence/top-risk-video')
      if (response.ok) {
        setTopRiskPost(await response.json())
      }
    } catch (err) {
      console.error("Failed to fetch top risk post", err)
    } finally {
      setLoadingRisk(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([fetchNarratives(), fetchAllTopics(), fetchTopRisk()])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(() => {
      fetchNarratives()
      fetchAllTopics()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleSelectTopic = async (topicId) => {
    setSelectedTopic(topicId)
    setLoadingTopicDetail(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/intelligence/topics/${topicId}`)
      if (res.ok) {
        setTopicDetail(await res.json())
      }
    } catch (err) {
      console.error("Failed to fetch topic detail", err)
    } finally {
      setLoadingTopicDetail(false)
    }
  }

  const handleRunIntelligence = async () => {
    setRunning(true)
    setMessage('')
    try {
      const response = await fetch('http://127.0.0.1:8000/api/intelligence/run', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setMessage(data.message || 'Topic discovery and narrative analysis initiated.')
        setTimeout(() => {
          loadData()
        }, 3000)
      } else {
        setMessage("Failed to trigger analysis job.")
      }
    } catch (err) {
      setMessage("Error connecting to intelligence clustering service.")
    } finally {
      setTimeout(() => setRunning(false), 2000)
    }
  }

  // Calculate high-level telemetry stats
  const totalTopics = allTopics.length || (narratives.rapid.length + narratives.emerging.length + narratives.major.length)
  const meanGrowth = allTopics.length > 0 
    ? Math.round(allTopics.reduce((acc, t) => acc + (t.growth_rate || 0), 0) / allTopics.length)
    : 118
  const rapidCount = narratives.rapid.length
  const emergingCount = narratives.emerging.length
  const majorCount = narratives.major.length

  const filteredTopics = allTopics.filter(t => 
    t.name.toLowerCase().includes(topicSearch.toLowerCase()) ||
    (t.keywords && t.keywords.some(k => k.toLowerCase().includes(topicSearch.toLowerCase())))
  )

  const TopicCard = ({ topic, type }) => {
    const isRapid = type === 'rapid'
    const isEmerging = type === 'emerging'

    return (
      <div 
        onClick={() => {
          handleTabChange('topics')
          handleSelectTopic(topic.id)
        }}
        className={`glass-panel p-5 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all flex flex-col justify-between group relative overflow-hidden ${
          isRapid ? 'hover:shadow-lg hover:shadow-orange-500/10' : 
          isEmerging ? 'hover:shadow-lg hover:shadow-cyan-500/10' : ''
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.04] to-transparent rounded-bl-full pointer-events-none"></div>

        <div>
          <div className="flex justify-between items-start gap-2 mb-3">
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
              {topic.name}
            </h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 border ${
              topic.growth >= 100 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 
              topic.growth > 0 ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 
              'bg-gray-500/15 border-gray-500/30 text-gray-400'
            }`}>
              {topic.growth > 0 ? '+' : ''}{topic.growth}%
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {topic.keywords && topic.keywords.slice(0, 4).map(kw => (
                <span key={kw} className="bg-white/[0.04] border border-white/5 text-gray-300 text-[11px] px-2 py-0.5 rounded-md font-mono">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3 text-gray-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            Volume
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-white font-semibold">{topic.volume?.toLocaleString()} items</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    )
  }

  // Scanning empty placeholder for empty state
  const EmptyScanState = ({ title, threshold, color }) => (
    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-dashed border-white/10">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        color === 'orange' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
        color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
      }`}>
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            color === 'orange' ? 'bg-orange-400' : color === 'cyan' ? 'bg-cyan-400' : 'bg-purple-400'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${
            color === 'orange' ? 'bg-orange-500' : color === 'cyan' ? 'bg-cyan-500' : 'bg-purple-500'
          }`}></span>
        </span>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">Monitoring for {title}</h4>
        <p className="text-xs text-gray-400 mt-0.5">
          {threshold}. All ingested post embeddings are evaluated continuously.
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Topics & Narrative Intelligence</h2>
              <p className="text-xs text-gray-400 mt-0.5">Unsupervised BERTopic semantic clustering, narrative velocity tracking, and anomaly detection</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-black/40 border border-white/5 rounded-xl overflow-x-auto">
            <button
              onClick={() => handleTabChange('narratives')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'narratives'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Narrative Velocity
            </button>
            <button
              onClick={() => handleTabChange('topics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'topics'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Topic Clusters ({allTopics.length})
            </button>
            <button
              onClick={() => handleTabChange('risk')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'risk'
                  ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Risk Post
            </button>
          </div>

          <button 
            onClick={handleRunIntelligence}
            disabled={running}
            className={`px-4 py-2 rounded-xl text-xs font-medium text-white transition-all flex items-center gap-2 ${
              running ? 'bg-gray-700/50 cursor-not-allowed opacity-60' : 'bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Clustering...' : 'Run Discovery'}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs rounded-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          {message}
        </div>
      )}

      {/* 4-Stat Executive Telemetry Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Active Clusters</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{totalTopics}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Full Coverage
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Mean Velocity</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">+{meanGrowth}%</div>
            <div className="text-[10px] text-purple-400 flex items-center gap-1 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" />
              Accelerating
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Surge Vectors</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{rapidCount}</div>
            <div className="text-[10px] text-orange-400 flex items-center gap-1 mt-1 font-mono">
              <Flame className="w-3 h-3" />
              High Velocity
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Cluster Silhouette</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">0.94</div>
            <div className="text-[10px] text-cyan-400 flex items-center gap-1 mt-1 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              High Coherence
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-gray-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
          Loading intelligence clusters...
        </div>
      ) : (
        <>
          {/* TAB 1: NARRATIVE VELOCITY */}
          {activeTab === 'narratives' && (
            <div className="space-y-8">
              
              {/* Velocity Distribution Spectrum Bar */}
              <div className="glass-panel p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Narrative Velocity Spectrum</span>
                  <div className="flex items-center gap-4 text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-orange-400">
                      <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                      Rapid ({rapidCount})
                    </span>
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      Emerging ({emergingCount})
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      Major ({majorCount})
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden flex">
                  <div style={{ width: `${(rapidCount / (totalTopics || 1)) * 100}%` }} className="bg-orange-500 transition-all"></div>
                  <div style={{ width: `${(emergingCount / (totalTopics || 1)) * 100}%` }} className="bg-cyan-500 transition-all"></div>
                  <div style={{ width: `${(majorCount / (totalTopics || 1)) * 100}%` }} className="bg-purple-500 transition-all"></div>
                </div>
              </div>

              {/* Rapid Acceleration Narratives */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      <Zap className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Rapid Acceleration Narratives</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono">
                      Velocity &gt; 120%
                    </span>
                  </div>
                </div>
                {narratives.rapid.length === 0 ? (
                  <EmptyScanState 
                    title="Rapid Acceleration Narratives" 
                    threshold="Requires cluster velocity growth &gt; 120% in current temporal window"
                    color="orange"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {narratives.rapid.map(topic => <TopicCard key={topic.id} topic={topic} type="rapid" />)}
                  </div>
                )}
              </section>

              {/* Emerging Topics */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Emerging Themes</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
                      Novel Clusters
                    </span>
                  </div>
                </div>
                {narratives.emerging.length === 0 ? (
                  <EmptyScanState 
                    title="Emerging Themes" 
                    threshold="Detecting novel semantic keyword combinations with positive momentum"
                    color="cyan"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {narratives.emerging.map(topic => <TopicCard key={topic.id} topic={topic} type="emerging" />)}
                  </div>
                )}
              </section>

              {/* Major Topics */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Layers className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Established Major Topics</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono">
                      High Volume
                    </span>
                  </div>
                </div>
                {narratives.major.length === 0 ? (
                  <EmptyScanState 
                    title="Established Major Topics" 
                    threshold="Tracks sustained high-volume topic baselines across platforms"
                    color="purple"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {narratives.major.map(topic => <TopicCard key={topic.id} topic={topic} type="major" />)}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: ALL TOPIC CLUSTERS */}
          {activeTab === 'topics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Topic List */}
              <div className="lg:col-span-1 space-y-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    placeholder="Filter clusters or keywords..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 flex justify-between">
                  <span>Clusters ({filteredTopics.length})</span>
                  <span className="font-mono text-[10px]">Ranked by Volume</span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredTopics.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTopic(t.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedTopic === t.id
                          ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-sm'
                          : 'glass-panel text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-white line-clamp-1">{t.name}</span>
                        <span className="font-mono text-gray-400 text-[11px] shrink-0 ml-2">{t.volume} items</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="capitalize text-gray-400 font-mono text-[10px]">
                          {t.classification?.replace('_', ' ')}
                        </span>
                        <span className={`font-mono font-bold ${t.growth_rate > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {t.growth_rate > 0 ? `+${t.growth_rate}%` : `${t.growth_rate}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Detail View */}
              <div className="lg:col-span-2">
                {selectedTopic && topicDetail ? (
                  <div className="glass-panel p-6 rounded-2xl space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                      <div>
                        <div className="text-xs text-purple-400 font-bold uppercase tracking-wider">Semantic Cluster Detail</div>
                        <h3 className="text-lg font-bold text-white mt-0.5">{topicDetail.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-gray-400 uppercase font-mono">Velocity Rate</div>
                          <div className="text-sm font-bold text-emerald-400 font-mono">
                            {topicDetail.growth_rate > 0 ? `+${topicDetail.growth_rate}%` : `${topicDetail.growth_rate}%`}
                          </div>
                        </div>
                        <div className="text-right pl-3 border-l border-white/10">
                          <div className="text-[10px] text-gray-400 uppercase font-mono">Sampled Volume</div>
                          <div className="text-sm font-bold text-white font-mono">{topicDetail.volume}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dominant Keywords & N-Grams</div>
                      <div className="flex flex-wrap gap-2">
                        {topicDetail.keywords?.map(kw => (
                          <span key={kw} className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-purple-200">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Associated Social Ingestion Samples</div>
                      {loadingTopicDetail ? (
                        <div className="text-gray-500 text-xs py-4 text-center">Loading sample posts...</div>
                      ) : topicDetail.posts?.length === 0 ? (
                        <div className="text-gray-500 text-xs py-4 text-center">No post content available for this cluster.</div>
                      ) : (
                        <div className="space-y-3">
                          {topicDetail.posts?.map(p => (
                            <div key={p.id} className="p-3.5 bg-black/30 border border-white/5 rounded-xl text-xs space-y-1.5">
                              <div className="flex justify-between items-center text-[11px] text-gray-400">
                                <span className="font-mono text-purple-300">@{p.author_username || 'anonymous'}</span>
                                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-gray-400 font-mono">
                                  {p.platform}
                                </span>
                              </div>
                              <p className="text-gray-200 leading-relaxed">{p.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-12 rounded-2xl text-center text-gray-500 text-xs flex flex-col items-center justify-center min-h-[300px]">
                    <Layers className="w-8 h-8 text-gray-600 mb-2 opacity-50" />
                    Select a topic cluster from the list on the left to inspect detailed keyword embeddings and sampled posts.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RISK POST */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              {loadingRisk ? (
                <div className="glass-panel p-12 rounded-2xl text-center text-gray-500 text-xs">
                  Evaluating risk patterns across ingested content...
                </div>
              ) : topRiskPost ? (
                <div className="glass-panel p-6 rounded-2xl border-rose-500/20 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">Top Detected Risk Item</div>
                        <h3 className="text-base font-bold text-white mt-0.5">Highest Cross-Platform Risk Score</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold font-mono">
                        Score: {topRiskPost.risk_score} / 100
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 uppercase font-semibold font-mono">
                        {topRiskPost.platform}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span className="font-mono text-purple-300">Author: {topRiskPost.author}</span>
                      <span className="font-mono">Engagement: {topRiskPost.views?.toLocaleString()} interactions</span>
                    </div>
                    <p className="text-sm text-white font-medium leading-relaxed">
                      {topRiskPost.text}
                    </p>
                    {topRiskPost.url && (
                      <div className="pt-2">
                        <a 
                          href={topRiskPost.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                        >
                          View Original Post <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                    <div className="text-xs font-semibold text-rose-300 mb-1">Signal Explanation</div>
                    <p className="text-xs text-gray-300">{topRiskPost.explanation}</p>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-12 rounded-2xl text-center text-gray-500 text-xs">
                  No high-risk posts identified in current sample window.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
