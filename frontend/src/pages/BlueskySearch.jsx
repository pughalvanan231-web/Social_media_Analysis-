import React, { useState } from 'react'

export default function BlueskySearch() {
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
      const response = await fetch(`http://127.0.0.1:8000/api/connectors/bluesky/search?q=${encodeURIComponent(keyword)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch posts from backend')
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
      <div className="bg-blue-900/40 p-6 rounded-lg border border-blue-500/50 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Bluesky Connector</h2>
          <p className="text-blue-300 mt-1">Search the AT Protocol network.</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="inline-block px-3 py-1 bg-blue-600 text-xs font-semibold rounded-full mb-2 uppercase tracking-wider">
            Source: Bluesky
          </div>
          <br/>
          <div className="inline-block px-3 py-1 bg-gray-700 text-xs font-semibold rounded-full uppercase tracking-wider">
            Data Type: Public API Data
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter search keyword (e.g. water)"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
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
              <div key={post.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-gray-400 text-sm font-mono">@{post.author_username || 'unknown'}</div>
                  <div className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleString()}</div>
                </div>
                <p className="text-white text-lg mb-4">{post.text}</p>
                <div className="flex gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="text-red-400">♥</span> {post.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">💬</span> {post.comments}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">🔄</span> {post.shares}
                  </div>
                  <div className="ml-auto text-xs px-2 py-1 bg-gray-900 rounded text-gray-500 uppercase tracking-wider">
                    {post.platform}
                  </div>
                </div>
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
