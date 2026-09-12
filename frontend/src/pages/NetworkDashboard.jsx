import React, { useState, useEffect } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

export default function NetworkDashboard() {
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] })
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(false)
  const [panelData, setPanelData] = useState(null) // Holds data for the hierarchical panel

  useEffect(() => {
    // Fetch topics for dropdown
    fetch('http://127.0.0.1:8000/api/intelligence/topics')
      .then(res => res.json())
      .then(data => setTopics(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    fetchNetwork()
  }, [selectedTopic])

  const fetchNetwork = async () => {
    setLoading(true)
    try {
      const url = selectedTopic
        ? `http://127.0.0.1:8000/api/network?topic_id=${selectedTopic}`
        : 'http://127.0.0.1:8000/api/network'
      const res = await fetch(url)
      const data = await res.json()
      setNetworkData(data)
      
      const comRes = await fetch('http://127.0.0.1:8000/api/communities')
      const comData = await comRes.json()
      setCommunities(comData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNodeClick = (node) => {
    setPanelData({
      type: 'node',
      data: node
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Network & Community Analysis</h2>
          <p className="text-gray-400">Discover user communities and high-interaction nodes.</p>
        </div>
        <select
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded p-2"
        >
          <option value="">All Topics</option>
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-gray-800 rounded-lg border border-gray-700 h-[600px] overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/50">
              <span className="text-blue-400 animate-pulse">Loading Network...</span>
            </div>
          )}
          {networkData.nodes.length > 0 ? (
            <ForceGraph2D
              width={800} // Ideally responsive, hardcoding for MVP
              height={600}
              graphData={networkData}
              nodeLabel="label"
              nodeAutoColorBy="community"
              nodeVal="val"
              onNodeClick={handleNodeClick}
              linkColor={() => 'rgba(255,255,255,0.2)'}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No network data found.
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 overflow-y-auto h-[600px] space-y-6">
          
          <div>
            <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4 text-blue-400">
              Hierarchical Overview
            </h3>
            
            <div className="space-y-4">
              <div className="pl-2 border-l-2 border-blue-500">
                <p className="text-sm text-gray-400">Topic</p>
                <p className="font-bold">
                  {selectedTopic ? topics.find(t => t.id == selectedTopic)?.name : 'Global Network'}
                </p>
              </div>

              <div className="pl-6 border-l-2 border-purple-500 relative">
                <div className="absolute w-4 h-0.5 bg-purple-500 left-0 top-3 -ml-2"></div>
                <p className="text-sm text-gray-400">Top Communities</p>
                <div className="space-y-2 mt-2">
                  {communities.slice(0, 3).map(c => (
                    <div key={c.id} className="text-sm bg-gray-900 p-2 rounded border border-gray-700">
                      <p className="font-semibold text-purple-400">Cluster {c.id}</p>
                      <p className="text-xs text-gray-400">{c.member_count} nodes</p>
                      <p className="text-xs text-gray-400 truncate">Key: {c.key_nodes.slice(0,3).join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {panelData && panelData.type === 'node' && (
            <div className="mt-8 border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-2 text-indigo-400">Node Inspector</h3>
              <div className="bg-gray-900 p-3 rounded text-sm space-y-2">
                <p><span className="text-gray-400">Label:</span> {panelData.data.label}</p>
                <p><span className="text-gray-400">Role:</span> {panelData.data.role}</p>
                <p><span className="text-gray-400">Community:</span> {panelData.data.community}</p>
                <p><span className="text-gray-400">Centrality:</span> {panelData.data.centrality.toFixed(4)}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
