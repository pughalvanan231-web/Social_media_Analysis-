import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, Tooltip as LeafletTooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function IndiaIntelligenceMap({ metric, data }) {
  const [geoJsonData, setGeoJsonData] = useState(null)
  const [selectedState, setSelectedState] = useState(null)

  useEffect(() => {
    fetch('/india-states.json')
      .then(res => res.json())
      .then(data => setGeoJsonData(data))
      .catch(err => console.error("Error loading GeoJSON", err))
  }, [])

  // metric colors logic based on negative intensity
  const getColor = (value) => {
    if (value === undefined || value === null) return '#1f2937' // dark gray for no data
    if (value > 80) return '#7f1d1d' // dark red
    if (value > 60) return '#ef4444' // red/orange
    if (value > 40) return '#f97316' // orange
    if (value > 20) return '#eab308' // yellow
    return '#fef08a' // light yellow
  }

  const getStateData = (stateName) => {
    return data.find(d => d.state.toLowerCase() === stateName.toLowerCase())
  }

  const getMetricValue = (stateData) => {
    if (!stateData) return null
    if (metric === 'Negative Sentiment') return stateData.negative_sentiment
    if (metric === 'Post Volume') return stateData.post_count
    if (metric === 'Engagement') return stateData.sentiment_change // mock
    if (metric === 'Signal Score') return stateData.signal_score
    return stateData.negative_sentiment // fallback
  }

  const style = (feature) => {
    const stateName = feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.name
    const stateData = getStateData(stateName)
    const value = getMetricValue(stateData)
    
    return {
      fillColor: getColor(value),
      weight: 1,
      opacity: 1,
      color: '#4b5563', // border
      fillOpacity: 0.8
    }
  }

  const onEachFeature = (feature, layer) => {
    const stateName = feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.name
    const stateData = getStateData(stateName)
    
    layer.on({
      mouseover: (e) => {
        const layer = e.target
        layer.setStyle({
          weight: 2,
          color: '#fff',
          fillOpacity: 1
        })
        layer.bringToFront()
      },
      mouseout: (e) => {
        layer.setStyle(style(feature))
      },
      click: () => {
        if (stateData) {
          setSelectedState({ name: stateName, ...stateData })
        } else {
          setSelectedState({ name: stateName, noData: true })
        }
      }
    })
    
    // Attach Tooltip
    if (stateData) {
      layer.bindTooltip(`
        <div class="font-sans">
          <strong class="uppercase">${stateName}</strong><br/>
          Negative Sentiment: ${stateData.negative_sentiment}%<br/>
          Related Posts: ${stateData.post_count}<br/>
          Change: +${stateData.sentiment_change}%<br/>
          Signal: ${stateData.signal_level}
        </div>
      `, { sticky: true, className: 'bg-gray-800 text-white border border-gray-700 p-2 rounded shadow-lg' })
    } else {
      layer.bindTooltip(`
        <div class="font-sans">
          <strong class="uppercase">${stateName}</strong><br/>
          No intelligence data available.
        </div>
      `, { sticky: true, className: 'bg-gray-800 text-white border border-gray-700 p-2 rounded shadow-lg' })
    }
  }

  if (!geoJsonData) {
    return <div className="h-[400px] flex items-center justify-center bg-gray-900 rounded-lg text-gray-400">Loading map data...</div>
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[500px]">
      <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 relative z-0">
        <MapContainer center={[22.5937, 78.9629]} zoom={4} className="h-full w-full bg-gray-900" style={{background: '#111827'}} scrollWheelZoom={false}>
          {/* We don't necessarily need a tile layer if we just want a choropleth, but let's add a dark minimal one or none. */}
          {geoJsonData && (
            <GeoJSON 
              data={geoJsonData} 
              style={style} 
              onEachFeature={onEachFeature} 
            />
          )}
        </MapContainer>
      </div>

      {/* State Detail Panel */}
      {selectedState && (
        <div className="w-full md:w-72 bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-lg flex flex-col">
          <h3 className="text-lg font-bold text-white uppercase mb-2 border-b border-gray-700 pb-2">{selectedState.name}</h3>
          
          {selectedState.noData ? (
             <p className="text-gray-400 text-sm mt-4">No aggregated intelligence data available for this state.</p>
          ) : (
            <div className="space-y-4 mt-2 overflow-y-auto custom-scrollbar">
              <div>
                <div className="text-xs text-gray-400">Negative Sentiment</div>
                <div className="text-xl font-bold text-red-400">{selectedState.negative_sentiment}%</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-400">Related Posts</div>
                  <div className="text-lg font-semibold text-white">{selectedState.post_count}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Negative Posts</div>
                  <div className="text-lg font-semibold text-white">{selectedState.negative_posts}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Sentiment Change</div>
                <div className="text-md font-semibold text-orange-400">+{selectedState.sentiment_change}%</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Top Related Issue</div>
                <div className="text-sm font-medium text-white">{selectedState.top_issue}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Top Keywords</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedState.keywords && selectedState.keywords.map(kw => (
                    <span key={kw} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{kw}</span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <div className="text-xs text-gray-400">Signal Score</div>
                <div className="text-lg font-bold text-white">{selectedState.signal_score} / 100</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
