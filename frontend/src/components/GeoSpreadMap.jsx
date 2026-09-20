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

  if (loading) return <div className="p-4 text-blue-400 font-mono text-sm">Loading map...</div>
  if (error) return <div className="p-4 text-red-400 font-mono text-sm">{error}</div>
  
  if (!geoData || !geoData.available) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900/50 rounded border border-gray-800">
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
          Location data unavailable
        </p>
      </div>
    )
  }

  const maxCount = Math.max(...geoData.regions.map(r => r.count), 1)

  return (
    <div className="h-full flex flex-col space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] uppercase font-bold text-gray-500">Approximate / Inferred Location</span>
        <span className="text-[10px] uppercase font-bold text-gray-500">Supporting Visualization</span>
      </div>
      <div className="flex-1 rounded overflow-hidden border border-gray-700 relative z-0">
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: '#1f2937' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          {geoData.regions.map((region, i) => (
            <CircleMarker
              key={i}
              center={[region.lat, region.lng]}
              radius={Math.max(8, (region.count / maxCount) * 20)}
              fillColor="#ef4444"
              color="#ef4444"
              weight={1}
              opacity={0.8}
              fillOpacity={0.5}
            >
              <Popup>
                <div className="text-gray-900 p-1 min-w-[150px]">
                  <strong className="block border-b border-gray-300 pb-1 mb-2 text-sm uppercase tracking-wider">{region.name}</strong>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Posts:</span>
                      <span className="font-bold">{region.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth:</span>
                      <span className="font-bold text-orange-600">+{region.activity_growth || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sentiment:</span>
                      <span className="font-bold text-red-600">{region.sentiment || 'Negative'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 mt-1">
                      <span className="text-gray-600">Topic:</span>
                      <span className="font-bold truncate max-w-[100px]">{geoData.topic_name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
