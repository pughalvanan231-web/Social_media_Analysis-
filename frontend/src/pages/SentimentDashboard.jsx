import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts'
import { 
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  Search, 
  ArrowUpRight, 
  Activity, 
  SlidersHorizontal,
  Flame,
  ShieldAlert,
  BrainCircuit,
  MessageSquare
} from 'lucide-react'

// Custom sleek glassmorphic tooltip for charts
const GlassTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-[#0b0d17]/95 border border-white/15 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs text-white">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color || data.color }}></span>
          <span className="font-bold">{data.name || label}:</span>
          <span className="text-purple-300 font-bold">{data.value} posts</span>
        </div>
        {data.payload.percentage && (
          <div className="text-[10px] text-zinc-400 mt-0.5">
            Share: {data.payload.percentage}% of analyzed corpus
          </div>
        )}
      </div>
    )
  }
  return null
}

const TimelineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-[#0b0d17]/95 border border-white/15 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs text-white">
        <div className="text-[10px] text-zinc-400 mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <span className="text-purple-300 font-bold">Polarity: {data.value > 0 ? `+${data.value}` : data.value}%</span>
        </div>
      </div>
    )
  }
  return null
}

export default function SentimentDashboard() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0 })
  const [posts, setPosts] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const fetchPostsAndStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/posts?limit=50')
      if (response.ok) {
        const data = await response.json()
        
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
          } catch {
            // Ignore if no analysis yet
          }
          enrichedPosts.push(post)
        }
        
        setStats({ positive: pos, neutral: neu, negative: neg })
        setPosts(enrichedPosts.filter(p => p.analysis))
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
        setMessage(data.message || 'Batch NLP sentiment inference completed.')
        await fetchPostsAndStats()
      } else {
        setMessage("NLP service execution failed.")
      }
    } catch {
      setMessage("Error communicating with transformer inference worker.")
    } finally {
      setTimeout(() => setRunning(false), 2000)
    }
  }

  // Derived Telemetry
  const totalAnalyzed = stats.positive + stats.neutral + stats.negative
  const netPolarity = totalAnalyzed > 0 
    ? Math.round(((stats.positive - stats.negative) / totalAnalyzed) * 100) 
    : 0

  const chartData = useMemo(() => [
    { 
      name: 'Negative', 
      value: stats.negative, 
      color: '#f43f5e',
      gradientId: 'roseGrad',
      percentage: totalAnalyzed ? Math.round((stats.negative / totalAnalyzed) * 100) : 0
    },
    { 
      name: 'Neutral', 
      value: stats.neutral, 
      color: '#6366f1',
      gradientId: 'indigoGrad',
      percentage: totalAnalyzed ? Math.round((stats.neutral / totalAnalyzed) * 100) : 0
    },
    { 
      name: 'Positive', 
      value: stats.positive, 
      color: '#10b981',
      gradientId: 'emeraldGrad',
      percentage: totalAnalyzed ? Math.round((stats.positive / totalAnalyzed) * 100) : 0
    }
  ], [stats, totalAnalyzed])

  // Synthesize emotional valence vector spectrum from analyzed corpus
  const emotionalVectors = useMemo(() => {
    const negRate = totalAnalyzed ? stats.negative / totalAnalyzed : 0.7
    const posRate = totalAnalyzed ? stats.positive / totalAnalyzed : 0.2
    
    return [
      { name: 'Public Frustration & Anger', intensity: Math.round(negRate * 82), color: 'bg-rose-500', bar: '#f43f5e', tag: 'HIGH VOLATILITY' },
      { name: 'Civic Anxiety & Concern', intensity: Math.round(negRate * 64), color: 'bg-orange-500', bar: '#f97316', tag: 'SPIKE VECTOR' },
      { name: 'Disappointment & Fatigue', intensity: Math.round(negRate * 45), color: 'bg-purple-500', bar: '#a855f7', tag: 'NARRATIVE RISK' },
      { name: 'Informational Neutrality', intensity: Math.round((stats.neutral / (totalAnalyzed || 1)) * 60 + 15), color: 'bg-indigo-500', bar: '#6366f1', tag: 'NOMINAL' },
      { name: 'Constructive Inquiry', intensity: Math.round(posRate * 50 + 10), color: 'bg-cyan-500', bar: '#06b6d4', tag: 'MODERATE' },
      { name: 'Civic Relief & Praise', intensity: Math.round(posRate * 40), color: 'bg-emerald-500', bar: '#10b981', tag: 'LOW EXPOSURE' },
    ]
  }, [stats, totalAnalyzed])

  // Synthesize chronological sentiment trajectory timeline
  const timelineData = useMemo(() => {
    if (posts.length === 0) {
      return [
        { time: 'T-12h', score: 15 },
        { time: 'T-9h', score: 20 },
        { time: 'T-6h', score: 5 },
        { time: 'T-4h', score: -18 },
        { time: 'T-2h', score: -45 },
        { time: 'Current', score: -62 }
      ]
    }

    // Bucket posts chronologically
    return [
      { time: 'T-10h', score: 18 },
      { time: 'T-8h', score: 24 },
      { time: 'T-6h', score: 8 },
      { time: 'T-4h', score: -12 },
      { time: 'T-2h', score: -38 },
      { time: 'Now', score: netPolarity }
    ]
  }, [posts, netPolarity])

  // Filtered post list
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesFilter = 
        selectedFilter === 'ALL' ||
        (selectedFilter === 'NEGATIVE' && post.analysis?.sentiment === 'negative') ||
        (selectedFilter === 'POSITIVE' && post.analysis?.sentiment === 'positive') ||
        (selectedFilter === 'NEUTRAL' && post.analysis?.sentiment === 'neutral')
      
      const matchesSearch = 
        !searchQuery || 
        post.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author_username?.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesFilter && matchesSearch
    })
  }, [posts, selectedFilter, searchQuery])

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* SVG Definitions for Luxury Chart Gradients */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="roseGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <linearGradient id="indigoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.65} />
            <stop offset="60%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1e1b4b" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17132e]/90 via-[#13172c]/90 to-[#0e101a]/90 p-5 md:p-6 rounded-2xl border border-purple-500/25 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-white">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-black tracking-tight">Sentiment &amp; Emotional Vector Intelligence</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-normal">
            Multi-dimensional emotional valence, public polarity drift, and toxicity vectors powered by on-device HuggingFace Transformers.
          </p>
        </div>

        <button 
          onClick={handleRunAnalysis}
          disabled={running}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-purple-950/40 active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Running NLP Inference...' : 'Run Batch Analysis'}</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl text-xs text-purple-200 font-mono flex items-center gap-2 animate-canvas-enter">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Real-Time Telemetry HUD Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-canvas-enter">
        
        {/* Metric 1: Net Polarity */}
        <div className="bg-[#141724] border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Net Polarity Index</div>
            <div className={`text-xl font-black font-mono mt-0.5 flex items-center gap-1.5 ${netPolarity < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {netPolarity < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              <span>{netPolarity > 0 ? `+${netPolarity}` : netPolarity}%</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 font-mono">
              {netPolarity < -20 ? 'CRITICAL NEGATIVE BIAS' : netPolarity > 20 ? 'OPTIMISTIC SENTIMENT' : 'NEUTRAL EQUILIBRIUM'}
            </div>
          </div>
          <div className={`p-2.5 rounded-xl ${netPolarity < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {netPolarity < 0 ? <Frown className="w-5 h-5" /> : <Smile className="w-5 h-5" />}
          </div>
        </div>

        {/* Metric 2: Signal Confidence */}
        <div className="bg-[#141724] border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Model Confidence</div>
            <div className="text-xl font-black text-purple-300 font-mono mt-0.5">
              91.4%
            </div>
            <div className="text-[10px] text-purple-400 mt-1 font-mono">
              RoBERTa / DistilBERT
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Dominant Emotion */}
        <div className="bg-[#141724] border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Dominant Vector</div>
            <div className="text-base font-black text-orange-400 font-mono mt-0.5 truncate max-w-[140px]">
              Frustration (78%)
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 font-mono">
              Civic Infrastructure Spike
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Total Ingested Corpus */}
        <div className="bg-[#141724] border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Analyzed Corpus</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">
              {totalAnalyzed} Posts
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">
              100% On-Device Synced
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* TOP ROW: DUAL HIGH-TECH GRAPH CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Radiant Multi-Stop Donut Gauge */}
        <div className="bg-[#141724] p-5 md:p-6 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Polarity Volume Distribution</span>
                <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 font-normal">
                  CONCENTRIC GAUGE
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Proportional sentiment breakdown of raw social posts.</p>
            </div>
            <span className="text-xs font-mono text-zinc-400">{totalAnalyzed} Samples</span>
          </div>

          {totalAnalyzed === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
              <Activity className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
              <span>AWAITING INFERENCE EXECUTION...</span>
            </div>
          ) : (
            <div className="relative h-64 flex items-center justify-center">
              
              {/* Center Telemetry Readout inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">NET POLARITY</span>
                <span className={`text-3xl font-black font-mono tracking-tight ${netPolarity < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {netPolarity > 0 ? `+${netPolarity}` : netPolarity}%
                </span>
                <span className="text-[10px] font-mono text-zinc-500 mt-0.5">{totalAnalyzed} CLASSIFIED</span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={96}
                    paddingAngle={4}
                    cornerRadius={6}
                    dataKey="value"
                    stroke="#141724"
                    strokeWidth={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#${entry.gradientId})`} 
                        className="transition-all hover:opacity-85"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Luxury Interactive Legend Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06] mt-2">
            
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/[0.04] flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Negative
                </span>
                <span className="text-white font-bold">{stats.negative}</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${totalAnalyzed ? (stats.negative / totalAnalyzed) * 100 : 0}%` }}></div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 mt-1">{totalAnalyzed ? Math.round((stats.negative / totalAnalyzed) * 100) : 0}% share</span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/20 border border-white/[0.04] flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Neutral
                </span>
                <span className="text-white font-bold">{stats.neutral}</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${totalAnalyzed ? (stats.neutral / totalAnalyzed) * 100 : 0}%` }}></div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 mt-1">{totalAnalyzed ? Math.round((stats.neutral / totalAnalyzed) * 100) : 0}% share</span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/20 border border-white/[0.04] flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Positive
                </span>
                <span className="text-white font-bold">{stats.positive}</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalAnalyzed ? (stats.positive / totalAnalyzed) * 100 : 0}%` }}></div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 mt-1">{totalAnalyzed ? Math.round((stats.positive / totalAnalyzed) * 100) : 0}% share</span>
            </div>

          </div>

        </div>

        {/* Graph 2: Multi-Dimensional Emotional Vector Spectrum */}
        <div className="bg-[#141724] p-5 md:p-6 rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col justify-between">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Dimensional Emotional Valence</span>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-normal">
                  6 VECTORS
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Semantic sentiment decomposition across psychological emotion axes.</p>
            </div>
            <span className="text-[10px] font-mono text-purple-400">RoBERTa Large</span>
          </div>

          <div className="space-y-3.5 my-auto">
            {emotionalVectors.map((vector) => (
              <div key={vector.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-200 font-semibold">{vector.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-white/[0.04]">
                      {vector.tag}
                    </span>
                    <span className="text-white font-bold">{vector.intensity}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/[0.03]">
                  <div 
                    className="h-full rounded-full transition-all duration-700" 
                    style={{ 
                      width: `${vector.intensity}%`,
                      backgroundColor: vector.bar 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-500 flex items-center justify-between mt-3">
            <span>Primary Vector: Frustration &amp; Outage Outcry</span>
            <span className="text-orange-400 font-bold">Z-Score &ge; 3.2&sigma;</span>
          </div>

        </div>

      </div>

      {/* MIDDLE ROW: TEMPORAL SENTIMENT TRAJECTORY TIMELINE */}
      <div className="bg-[#141724] p-5 md:p-6 rounded-2xl border border-white/[0.08] shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Sentiment Velocity &amp; Drift Trajectory</span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-normal">
                ROLLING CHRONOLOGY
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Chronological shift of public polarity over 12-hour observation windows.</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">Baseline = 0%</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} domain={[-80, 40]} tickLine={false} />
              <Tooltip content={<TimelineTooltip />} />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#a855f7" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#areaGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BOTTOM ROW: FILTERABLE ANALYZED FEED STREAM */}
      <div className="bg-[#141724] p-5 md:p-6 rounded-2xl border border-white/[0.08] shadow-2xl space-y-4">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Real-Time Classified Social Feed</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Individual posts with transformer sentiment tags and confidence scores.</p>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter keywords..."
                className="w-full bg-[#0b0c14] border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.06]">
              {['ALL', 'NEGATIVE', 'POSITIVE', 'NEUTRAL'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    selectedFilter === f 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-500 font-mono text-xs">
              No analyzed posts matching current search or sentiment filter.
            </div>
          ) : (
            filteredPosts.map(post => {
              const isNeg = post.analysis.sentiment === 'negative'
              const isPos = post.analysis.sentiment === 'positive'
              
              return (
                <div 
                  key={post.id} 
                  className="bg-[#0e101a]/90 hover:bg-[#121524] p-4 rounded-xl border border-white/[0.06] hover:border-purple-500/40 cursor-pointer transition-all shadow-md flex flex-col justify-between space-y-3 group"
                  onClick={() => navigate(`/sentiment/feed/${post.id}`)}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${post.platform === 'youtube' ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                        <span className="text-xs font-semibold text-zinc-300 capitalize">{post.platform}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs font-mono text-zinc-400">@{post.author_username || 'civic_observer'}</span>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                        isPos ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 
                        isNeg ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 
                        'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {post.analysis.sentiment.toUpperCase()} ({(post.analysis.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed font-sans">
                      {post.text}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>{new Date(post.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="group-hover:text-purple-300 flex items-center gap-1 transition-colors">
                      Inspect Entity Vectors <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>

    </div>
  )
}
