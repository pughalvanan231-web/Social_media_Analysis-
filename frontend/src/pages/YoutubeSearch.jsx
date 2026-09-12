import React, { useState } from 'react'

export default function YoutubeSearch() {
  const [keyword, setKeyword] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!keyword.trim()) return

    setLoading(true)
    setError(null)
    setPosts([])

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/connectors/youtube/search?q=${encodeURIComponent(keyword)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch videos from backend')
      }
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-900/40 p-6 rounded-lg border border-red-500/50 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">YouTube Connector</h2>
          <p className="text-red-300 mt-1">Search the world's largest video platform.</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="inline-block px-3 py-1 bg-red-600 text-xs font-semibold rounded-full mb-2 uppercase tracking-wider">
            Source: YouTube
          </div>
          <br/>
          <div className="inline-block px-3 py-1 bg-gray-700 text-xs font-semibold rounded-full uppercase tracking-wider">
            Data Type: API Data
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter search keyword (e.g. news)"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Results ({posts.length})</h3>
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-gray-400 text-sm font-mono">📺 {post.author_username || 'unknown channel'}</div>
                    <div className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleString()}</div>
                  </div>
                  <h4 className="text-white text-lg font-bold mb-2">
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors">
                      {post.text.split('\n')[0]}
                    </a>
                  </h4>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {post.text.split('\n').slice(2).join('\n')}
                  </p>
                  
                  <div className="flex gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="text-green-400">👁️</span> {post.views?.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-red-400">👍</span> {post.likes?.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400">💬</span> {post.comments?.toLocaleString()}
                    </div>
                    <div className="ml-auto text-xs px-2 py-1 bg-gray-900 rounded text-gray-500 uppercase tracking-wider">
                      {post.platform}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
