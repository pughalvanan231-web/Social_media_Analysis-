import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import SidebarLayout from './components/SidebarLayout'
import MainDashboard from './pages/MainDashboard'
import PipelineDashboard from './pages/PipelineDashboard'
import SentimentDashboard from './pages/SentimentDashboard'
import IntelligenceDashboard from './pages/IntelligenceDashboard'
import NarrativesDashboard from './pages/NarrativesDashboard'
import FeedIntelligence from './pages/FeedIntelligence'
import TrendsDashboard from './pages/TrendsDashboard'
import IssuesDashboard from './pages/IssuesDashboard'
import NetworkDashboard from './pages/NetworkDashboard'
import AlertsDashboard from './pages/AlertsDashboard'
import InvestigateDashboard from './pages/InvestigateDashboard'
import FeedbackAnalytics from './pages/FeedbackAnalytics'
import BlueskySearch from './pages/BlueskySearch'
import YoutubeSearch from './pages/YoutubeSearch'
import LoginPage from './pages/LoginPage'

// Global fetch interceptor to inject JWT
const originalFetch = window.fetch
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  if (token && url.startsWith('http://127.0.0.1:8000/api')) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  }
  const response = await originalFetch(url, options)
  if (response.status === 401 && !url.includes('/api/auth/token')) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  return response
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  return <SidebarLayout>{children}</SidebarLayout>
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
        <Route path="/pipeline" element={<ProtectedRoute><PipelineDashboard /></ProtectedRoute>} />
        <Route path="/sentiment" element={<ProtectedRoute><SentimentDashboard /></ProtectedRoute>} />
        <Route path="/sentiment/feed/:feedId" element={<ProtectedRoute><FeedIntelligence /></ProtectedRoute>} />
        <Route path="/intelligence" element={<ProtectedRoute><IntelligenceDashboard /></ProtectedRoute>} />
        <Route path="/narratives" element={<ProtectedRoute><NarrativesDashboard /></ProtectedRoute>} />
        <Route path="/trends" element={<ProtectedRoute><TrendsDashboard /></ProtectedRoute>} />
        <Route path="/issues" element={<ProtectedRoute><IssuesDashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsDashboard /></ProtectedRoute>} />
        <Route path="/investigate/:issueId" element={<ProtectedRoute><InvestigateDashboard /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><FeedbackAnalytics /></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><NetworkDashboard /></ProtectedRoute>} />
        <Route path="/sources/bluesky" element={<ProtectedRoute><BlueskySearch /></ProtectedRoute>} />
        <Route path="/sources/youtube" element={<ProtectedRoute><YoutubeSearch /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
