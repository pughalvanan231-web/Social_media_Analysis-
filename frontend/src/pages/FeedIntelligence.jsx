import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import IndiaIntelligenceMap from '../components/IndiaIntelligenceMap'

export default function FeedIntelligence() {
  const { feedId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [intel, setIntel] = useState(null)
  const [geoData, setGeoData] = useState([])
  const [mapMetric, setMapMetric] = useState('Negative Sentiment')
  const [timeRange, setTimeRange] = useState('24 HOURS')
  const [actionMessage, setActionMessage] = useState(null)

  const handleAction = (msg) => {
    setActionMessage(msg)
    setTimeout(() => setActionMessage(null), 3000)
  }

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        setLoading(true)
        const [intelRes, geoRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/sentiment/feed/${feedId}`),
          fetch(`http://127.0.0.1:8000/api/geo/feed/${feedId}`)
        ])

        if (!intelRes.ok) throw new Error('Failed to load feed intelligence.')
        
        const intelData = await intelRes.json()
        setIntel(intelData)
        
        if (geoRes.ok) {
          const gData = await geoRes.json()
          setGeoData(gData)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchIntelligence()
  }, [feedId])

  // Mock sentiment trend data for the chart
  const trendData = [
    { time: '10:00', negative: 80, neutral: 10, positive: 10 },
    { time: '11:00', negative: 85, neutral: 10, positive: 5 },
    { time: '12:00', negative: 88, neutral: 8, positive: 4 },
    { time: '13:00', negative: 92, neutral: 5, positive: 3 },
    { time: '14:00', negative: 90, neutral: 6, positive: 4 },
  ]

  if (loading) {
    return <div className="text-gray-400 text-center py-20 font-semibold text-lg">Loading feed intelligence...</div>
  }

  if (error) {
    return <div className="text-red-400 text-center py-20 font-semibold text-lg">{error}</div>
  }

  if (!intel) {
    return <div className="text-gray-400 text-center py-20 font-semibold text-lg">No intelligence data available for this feed.</div>
  }

  const { feed, sentiment, emotion, topics, emerging_issue, explanation } = intel

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      <div className="bg-yellow-900/50 text-yellow-500 border border-yellow-700/50 p-2 text-center text-sm font-bold uppercase tracking-wider rounded-lg">
        SIH DEMO DATA - NOT REAL INTELLIGENCE
      </div>

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">FEED INTELLIGENCE</h1>
          <p className="text-gray-400 text-sm mt-1">
            <span className="capitalize text-indigo-400 font-medium">{feed.platform}</span> • {feed.author} • {feed.timestamp ? new Date(feed.timestamp).toLocaleString() : 'Unknown Time'}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button onClick={() => navigate('/sentiment')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-semibold transition-colors">
            BACK TO SENTIMENT
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
            INVESTIGATE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: ORIGINAL FEED */}
          <div className="bg-gray-800 p-5 rounded-lg shadow border border-gray-700">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">ORIGINAL FEED</h2>
            <div className="mb-4">
              <span className="capitalize font-bold text-indigo-300">{feed.platform}</span><br/>
              <span className="text-gray-400 text-sm">{feed.author}</span>
            </div>
            <p className="text-white text-lg leading-relaxed bg-gray-900/50 p-4 rounded border border-gray-700/50 font-serif">
              "{feed.text}"
            </p>
            <div className="mt-4 flex flex-wrap justify-between items-center text-sm text-gray-400">
              <div>
                Posted: <span className="text-gray-300">{feed.timestamp ? new Date(feed.timestamp).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex space-x-4">
                <span>Likes: {feed.likes}</span>
                <span>Comments: {feed.comments}</span>
                <span>Shares: {feed.shares}</span>
              </div>
            </div>
            {feed.hashtags && feed.hashtags.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-gray-500 uppercase mb-1">Hashtags</div>
                <div className="flex flex-wrap gap-2">
                  {feed.hashtags.map(tag => (
                    <span key={tag} className="text-indigo-400 text-sm">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 6: GEOGRAPHIC INTELLIGENCE MAP */}
          <div className="bg-gray-800 p-5 rounded-lg shadow border border-gray-700">
            <div className="flex justify-between items-end mb-4 border-b border-gray-700 pb-2">
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">GEOGRAPHIC INTELLIGENCE</h2>
                <p className="text-xs text-gray-500 mt-1">State-level distribution of related social-media sentiment</p>
              </div>
              <div className="flex space-x-3 text-xs">
                <div>
                  <label className="text-gray-500 mr-2 uppercase">Metric:</label>
                  <select 
                    value={mapMetric}
                    onChange={(e) => setMapMetric(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-gray-300 rounded p-1"
                  >
                    <option>Negative Sentiment</option>
                    <option>Post Volume</option>
                    <option>Engagement</option>
                    <option>Signal Score</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 mr-2 uppercase">Time Range:</label>
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-gray-300 rounded p-1"
                  >
                    <option>1 Hour</option>
                    <option>6 Hours</option>
                    <option>24 HOURS</option>
                    <option>7 Days</option>
                    <option>30 Days</option>
                  </select>
                </div>
              </div>
            </div>
            
            {geoData.length > 0 ? (
               <IndiaIntelligenceMap metric={mapMetric} data={geoData} />
            ) : (
               <div className="h-40 flex items-center justify-center text-gray-500 border border-gray-700 rounded bg-gray-900/50">
                 Geographic information unavailable for this feed.
               </div>
            )}
          </div>

          {/* SECTION 7: SENTIMENT TREND */}
          <div className="bg-gray-800 p-5 rounded-lg shadow border border-gray-700">
             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">SENTIMENT TREND</h2>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="Negative" />
                    <Line type="monotone" dataKey="neutral" stroke="#9ca3af" strokeWidth={2} name="Neutral" />
                    <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} name="Positive" />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* SECTION 2: AI SENTIMENT ANALYSIS */}
          <div className="bg-gray-800 p-5 rounded-lg shadow border border-gray-700">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">AI SENTIMENT ANALYSIS</h2>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Overall Sentiment:</span>
              <span className={`font-bold uppercase ${sentiment.label === 'negative' ? 'text-red-400' : sentiment.label === 'positive' ? 'text-green-400' : 'text-gray-300'}`}>
                {sentiment.label}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm">Confidence:</span>
              <span className="text-white font-mono">{(sentiment.confidence * 100).toFixed(0)}%</span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400 font-bold">NEGATIVE {(sentiment.negative * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden flex">
                <div className="bg-red-500 h-2.5" style={{ width: `${sentiment.negative * 100}%` }}></div>
                <div className="bg-gray-500 h-2.5" style={{ width: `${sentiment.neutral * 100}%` }}></div>
                <div className="bg-green-500 h-2.5" style={{ width: `${sentiment.positive * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-gray-500">
                <span>Pos: {(sentiment.positive * 100).toFixed(0)}%</span>
                <span>Neu: {(sentiment.neutral * 100).toFixed(0)}%</span>
                <span>Neg: {(sentiment.negative * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: EMOTION ANALYSIS */}
          <div className="bg-gray-800 p-5 rounded-lg shadow border border-gray-700">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">EMOTION ANALYSIS</h2>
            {emotion ? (
              <div className="space-y-3">
                {Object.entries(emotion).map(([emo, val]) => (
                  <div key={emo}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{emo}</span>
                      <span className="text-gray-400 font-mono">{val}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5" style={{ width: `${val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Emotion analysis unavailable for this feed.</div>
            )}
          </div>

          {/* SECTION 4: TOPICS & KEYWORDS */}
          <div className="bg-gray-800 p-5 rounded-lg shadow border border-gray-700">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">TOPICS & KEYWORDS</h2>
            {topics && topics.primary ? (
              <>
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase mb-1">Primary Topic</div>
                  <div className="text-white font-medium bg-gray-900 p-2 rounded border border-gray-700">{topics.primary}</div>
                </div>
                {topics.related && topics.related.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 uppercase mb-1">Related Topics</div>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      {topics.related.map(t => <li key={t}>{t}</li>)}
                    </ul>
                  </div>
                )}
                {topics.keywords && topics.keywords.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Top Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {topics.keywords.map(kw => (
                        <span key={kw} className="bg-purple-900/40 text-purple-300 border border-purple-700/50 px-2 py-1 text-xs rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">Topic analysis unavailable.</div>
            )}
          </div>

          {/* SECTION 5: EMERGING ISSUE */}
          <div className="bg-gray-800 p-5 rounded-lg shadow border border-gray-700">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">EMERGING ISSUE</h2>
            {emerging_issue ? (
              <div>
                <div className="flex items-center text-red-400 font-bold mb-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></span>
                  EMERGING ISSUE DETECTED
                </div>
                <div className="text-lg text-white font-medium mb-3">{emerging_issue.title}</div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Signal Score</div>
                    <div className="text-xl font-bold text-white">{emerging_issue.signal_score} <span className="text-sm text-gray-500 font-normal">/ 100</span></div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Severity</div>
                    <div className="text-md font-bold text-red-400">{emerging_issue.severity}</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-300 mb-4">
                  Trend: <span className="text-red-400">{emerging_issue.trend_percentage}</span> in the last 6 hours
                </div>

                <div className="bg-gray-900 p-3 rounded text-sm space-y-2 border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase mb-1 border-b border-gray-700 pb-1">Contribution</div>
                  {Object.entries(emerging_issue.contribution).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400">{key}</span>
                      <span className="text-red-400">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">NO EMERGING ISSUE LINKED</div>
            )}
          </div>

          {/* SECTION 10: WHY WAS THIS FEED FLAGGED? */}
          <div className="bg-gray-800 p-5 rounded-lg shadow border border-gray-700">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">WHY WAS THIS FEED FLAGGED?</h2>
            {explanation && explanation.factors ? (
              <div className="space-y-3">
                {explanation.factors.map((f, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <span className={`w-2 h-2 rounded-full mr-2 ${f.color === 'red' ? 'bg-red-500' : f.color === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'}`}></span>
                    <span className="text-gray-300 flex-1">{f.label}</span>
                    <span className="text-white font-mono">{f.value}</span>
                  </div>
                ))}
                
                <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-sm text-gray-400">CONFIDENCE</span>
                  <span className="font-bold text-white">{explanation.confidence}%</span>
                </div>
                
                <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded text-sm transition-colors border border-gray-600">
                  VIEW FULL EXPLANATION
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Explanation unavailable.</div>
            )}
          </div>

        </div>
      </div>

      {/* SECTION 11: ANALYST ACTIONS */}
      <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700 flex flex-wrap gap-3 justify-center md:justify-start relative">
        <span className="w-full md:w-auto text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center mr-4">ANALYST ACTIONS</span>
        <button onClick={() => handleAction('Investigation initiated.')} className="px-4 py-2 bg-indigo-900/50 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/50 rounded text-sm transition-colors cursor-pointer">Investigate Issue</button>
        <button onClick={() => handleAction('Opening related feeds...')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded text-sm transition-colors cursor-pointer">View Related Feeds</button>
        <button onClick={() => handleAction('Added to alert watch list.')} className="px-4 py-2 bg-yellow-900/50 hover:bg-yellow-800 text-yellow-500 border border-yellow-700/50 rounded text-sm transition-colors cursor-pointer">Add to Alert</button>
        <button onClick={() => handleAction('Signal marked as verified.')} className="px-4 py-2 bg-green-900/50 hover:bg-green-800 text-green-400 border border-green-700/50 rounded text-sm transition-colors cursor-pointer">Mark as Verified</button>
        <button onClick={() => handleAction('Signal dismissed.')} className="px-4 py-2 bg-gray-900 hover:bg-black text-gray-400 border border-gray-700 rounded text-sm transition-colors cursor-pointer">Dismiss Signal</button>
        <button onClick={() => handleAction('Generating report...')} className="px-4 py-2 bg-blue-900/50 hover:bg-blue-800 text-blue-400 border border-blue-700/50 rounded text-sm transition-colors ml-auto cursor-pointer">Generate Report</button>
        
        {actionMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-blue-400 border border-blue-800 px-4 py-2 rounded shadow-xl text-sm z-50 animate-bounce font-bold tracking-wide">
            {actionMessage}
          </div>
        )}
      </div>

    </div>
  )
}
