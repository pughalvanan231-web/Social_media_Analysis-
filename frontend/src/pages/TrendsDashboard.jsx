import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter } from 'recharts'

export default function TrendsDashboard() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [trendData, setTrendData] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const trendsRes = await fetch('http://127.0.0.1:8000/api/trends')
      if (trendsRes.ok) {
        const data = await trendsRes.json()
        
        // Format dates for display
        const formattedData = data.map(d => ({
          ...d,
          formattedTime: new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }))
        
        setTrendData(formattedData)
      }

      const anomRes = await fetch('http://127.0.0.1:8000/api/anomalies')
      if (anomRes.ok) {
        setAnomalies(await anomRes.json())
      }
    } catch (err) {
      console.error("Failed to fetch trends data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleRunEngine = async () => {
    setRunning(true)
    setMessage('')
    try {
      const response = await fetch('http://127.0.0.1:8000/api/trends/run', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setMessage(data.message)
      } else {
        setMessage("Failed to trigger engine.")
      }
    } catch (err) {
      setMessage("Error connecting to engine.")
    } finally {
      setTimeout(() => setRunning(false), 2000)
    }
  }

  // Find dynamic keys for lines (e.g. WATER_volume, FIRE_volume)
  const getLineKeys = () => {
    if (trendData.length === 0) return []
    const keys = Object.keys(trendData[trendData.length - 1]).filter(k => k.endsWith('_volume'))
    return keys
  }
  
  // Create a robust color palette for lines
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f43f5e']

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-rose-900/60 to-red-900/60 p-6 rounded-lg border border-rose-500/50 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Trend & Anomaly Engine</h2>
          <p className="text-rose-200 mt-1">Statistical Z-Score detection for volume and sentiment deviations.</p>
        </div>
        <button 
          onClick={handleRunEngine}
          disabled={running}
          className={`mt-4 md:mt-0 px-6 py-2 rounded-lg font-semibold text-white transition-colors shadow-lg ${running ? 'bg-rose-700/50 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'}`}
        >
          {running ? 'Calculating...' : 'Run Engine'}
        </button>
      </div>

      {message && (
        <div className="bg-rose-900/40 border border-rose-500/50 p-4 rounded-lg text-rose-200">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading time-series data...</div>
      ) : (
        <div className="space-y-8">
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Topic Volume Timeline</h3>
            
            {trendData.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No trend snapshots available yet.</p>
            ) : (
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="formattedTime" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    {getLineKeys().map((key, idx) => (
                      <Line 
                        key={key}
                        type="monotone" 
                        dataKey={key} 
                        name={key.replace('_volume', '')} 
                        stroke={colors[idx % colors.length]} 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 8 }} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2 flex items-center gap-2">
              Statistically Justified Anomalies
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">Z {'>'} 2.0</span>
            </h3>
            
            {anomalies.length === 0 ? (
              <p className="text-gray-500">No anomalies detected.</p>
            ) : (
              <div className="space-y-4">
                {anomalies.map(anomaly => (
                  <div key={anomaly.id} className="bg-gray-900/50 p-4 rounded border border-gray-700/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-white">{anomaly.topic}</span>
                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase
                          ${anomaly.type === 'volume_spike' ? 'bg-orange-900/40 text-orange-400' : 'bg-purple-900/40 text-purple-400'}`}>
                          {anomaly.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(anomaly.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-6 items-center">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Normal</div>
                        <div className="text-gray-300 font-mono">{anomaly.expected_value}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Current</div>
                        <div className="text-rose-400 font-mono font-bold">{anomaly.actual_value}</div>
                      </div>
                      <div className="text-center bg-gray-800 px-3 py-2 rounded">
                        <div className="text-xs text-gray-500">Growth</div>
                        <div className="text-green-400 font-bold">{anomaly.growth_percentage > 0 ? '+' : ''}{anomaly.growth_percentage}%</div>
                      </div>
                      <div className="text-center bg-gray-800 px-3 py-2 rounded">
                        <div className="text-xs text-gray-500">Z-Score</div>
                        <div className="text-red-400 font-bold">{anomaly.z_score}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
