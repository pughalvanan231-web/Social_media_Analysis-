import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function GeoSpreadMap({ issueId }) {
  const [geoData, setGeoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!issueId) return
    
    setLoading(true)
    fetch(`http://127.0.0.1:8000/api/geo/issues/${issueId}`)
      .then(res => res.json())
      .then(data => {
        setGeoData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError("Failed to load geographic data")
        setLoading(false)
      })
  }, [issueId])

  if (loading) return <div className="p-4 text-blue-400">Loading map...</div>
  if (error) return <div className="p-4 text-red-400">{error}</div>
  
  if (!geoData || !geoData.available) {
    return (
      <div className="p-8 text-center bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">
          Geographic data unavailable for this source.
        </p>
      </div>
    )
  }

  // Calculate dynamic radius based on count relative to max count
  const maxCount = Math.max(...geoData.regions.map(r => r.count), 1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Regions Affected</p>
          <p className="text-2xl font-bold text-blue-400">{geoData.summary.total_regions}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider">First Observed</p>
          <p className="text-lg font-bold text-purple-400 truncate">
            {geoData.summary.first_observed_region || "Unknown"}
          </p>
        </div>
        <div className="bg-gray-800 p-3 rounded border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Start Date</p>
          <p className="text-lg font-bold text-gray-200">
            {geoData.summary.first_observed_date ? new Date(geoData.summary.first_observed_date).toLocaleDateString() : "Unknown"}
          </p>
        </div>
      </div>

      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-700">
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: '#1f2937' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {geoData.regions.map((region, i) => (
            <CircleMarker
              key={i}
              center={[region.lat, region.lng]}
              radius={Math.max(5, (region.count / maxCount) * 20)}
              fillColor="#ef4444"
              color="#ef4444"
              weight={1}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="text-gray-900">
                  <strong className="block border-b pb-1 mb-1">{region.name}</strong>
                  <span>Intensity: {region.count} mentions</span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      
      <div className="bg-gray-800 rounded p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Spread Timeline</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {geoData.timeline.length > 0 ? (
            geoData.timeline.map((point, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-700 pb-1">
                <span className="text-gray-400">{point.date}</span>
                <span className="text-gray-200">
                  {Object.entries(point.regions).map(([r, c]) => `${r} (${c})`).join(', ')}
                </span>
                <span className="font-bold text-blue-400">Total: {point.total}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No timeline data.</p>
          )}
        </div>
      </div>
    </div>
  )
}
