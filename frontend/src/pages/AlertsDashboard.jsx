import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function AlertsDashboard() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/alerts')
      if (response.ok) {
        setAlerts(await response.json())
      }
    } catch (err) {
      console.error("Failed to fetch alerts", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 15000)
    return () => clearInterval(interval)
  }, [])

  const updateAlertStatus = async (id, status) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/alerts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        fetchAlerts() // Refresh the list
      }
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-900/50 border-red-500 text-red-400'
      case 'HIGH': return 'bg-orange-900/50 border-orange-500 text-orange-400'
      case 'MEDIUM': return 'bg-yellow-900/50 border-yellow-500 text-yellow-400'
      case 'LOW': return 'bg-blue-900/50 border-blue-500 text-blue-400'
      default: return 'bg-gray-800 border-gray-600 text-gray-400'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW': return 'bg-blue-900/50 text-blue-300'
      case 'REVIEWING': return 'bg-yellow-900/50 text-yellow-300'
      case 'VERIFIED': return 'bg-red-900/50 text-red-300'
      case 'DISMISSED': return 'bg-gray-700 text-gray-300'
      case 'RESOLVED': return 'bg-green-900/50 text-green-300'
      default: return 'bg-gray-800 text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Intelligent Alert System</h2>
          <p className="text-gray-400">Manage automated alerts triggered by the Emerging Issues Engine.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading alerts...</div>
      ) : (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400 border border-gray-700">
              No active alerts. The system is nominal.
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col md:flex-row">
                
                {/* Severity Panel */}
                <div className={`p-4 md:w-32 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-700 ${alert.severity === 'CRITICAL' ? 'bg-red-950/30' : ''}`}>
                  <div className={`px-3 py-1 rounded border font-bold text-sm tracking-wide ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </div>
                  <div className="mt-2 text-xl font-bold text-white">{alert.score}</div>
                  <div className="text-xs text-gray-500 uppercase">Score</div>
                </div>

                {/* Details Panel */}
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-200">
                        {alert.supporting_metrics?.topic_name || "Unknown Topic"}
                      </h3>
                      <p className="text-red-400 text-sm mt-1">{alert.reason}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${getStatusBadge(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                    <div className="bg-gray-900 p-2 rounded border border-gray-700">
                      <div className="text-xs text-gray-500">Volume</div>
                      <div className="text-sm font-semibold text-gray-300">{alert.supporting_metrics?.volume_change || "N/A"}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded border border-gray-700">
                      <div className="text-xs text-gray-500">Sentiment</div>
                      <div className="text-sm font-semibold text-gray-300">{alert.supporting_metrics?.sentiment_change || "N/A"}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded border border-gray-700">
                      <div className="text-xs text-gray-500">Engagement</div>
                      <div className="text-sm font-semibold text-gray-300">{alert.supporting_metrics?.engagement_change || "N/A"}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded border border-gray-700">
                      <div className="text-xs text-gray-500">Spread</div>
                      <div className="text-sm font-semibold text-gray-300">{alert.supporting_metrics?.geographic_spread || "N/A"}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-4">
                    Detected: {new Date(alert.detected_at).toLocaleString()}
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="p-4 bg-gray-900/50 flex flex-row md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-700">
                  <select 
                    value={alert.status} 
                    onChange={(e) => updateAlertStatus(alert.id, e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white rounded p-2 text-sm w-full font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="NEW">New</option>
                    <option value="REVIEWING">Investigate (Reviewing)</option>
                    <option value="VERIFIED">Verify</option>
                    <option value="DISMISSED">Dismiss</option>
                    <option value="RESOLVED">Resolve</option>
                  </select>
                  
                  <Link to={`/investigate/${alert.issue_id}`} className="text-center bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded p-2 text-sm w-full font-semibold transition-colors">
                    View Issue
                  </Link>
                </div>
                
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
