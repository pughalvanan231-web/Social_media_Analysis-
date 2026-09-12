import React, { useState, useEffect } from 'react'

export default function FeedbackAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/feedback/analytics')
        if (res.ok) {
          setAnalytics(await res.json())
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchAnalytics()
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading analytics...</div>
  if (!analytics) return <div className="text-center py-12 text-red-500">Failed to load analytics</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Feedback & Model Analytics</h2>
          <p className="text-gray-400">Track human-in-the-loop verification and model precision</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Total Signals</h3>
          <div className="text-3xl font-bold text-white">{analytics.total_signals}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Verified</h3>
          <div className="text-3xl font-bold text-green-400">{analytics.verified_signals}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">False Positives</h3>
          <div className="text-3xl font-bold text-red-400">{analytics.false_positives}</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Alert Precision</h3>
          <div className="text-3xl font-bold text-blue-400">{analytics.alert_precision.toFixed(1)}%</div>
          <p className="text-xs text-gray-500 mt-1">Verified / (Verified + False Positives)</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Recent Analyst Feedback</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Issue ID</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recent_feedback.map(f => (
                <tr key={f.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(f.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">#{f.issue_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      f.action === 'FALSE_POSITIVE' ? 'bg-red-900/50 text-red-400 border-red-500' :
                      f.action === 'CONFIRM' ? 'bg-green-900/50 text-green-400 border-green-500' :
                      'bg-gray-700 text-gray-300 border-gray-600'
                    }`}>
                      {f.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{f.reason}</td>
                </tr>
              ))}
              {analytics.recent_feedback.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">No recent feedback recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
