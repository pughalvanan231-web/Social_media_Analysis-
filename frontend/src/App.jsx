import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import SidebarLayout from './components/SidebarLayout'
import MainDashboard from './pages/MainDashboard'
import PipelineDashboard from './pages/PipelineDashboard'
import SentimentDashboard from './pages/SentimentDashboard'
import IntelligenceDashboard from './pages/IntelligenceDashboard'
import FeedIntelligence from './pages/FeedIntelligence'
import TrendsDashboard from './pages/TrendsDashboard'
import NetworkDashboard from './pages/NetworkDashboard'
import AlertsDashboard from './pages/AlertsDashboard'
import InvestigateDashboard from './pages/InvestigateDashboard'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DemoController from './components/DemoController'

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
      <DemoController onComplete={() => window.location.reload()} />
      <Routes>
        {/* Public Showcase Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Core Consolidated Intelligence Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsDashboard /></ProtectedRoute>} />
        <Route path="/trends" element={<ProtectedRoute><TrendsDashboard /></ProtectedRoute>} />
        <Route path="/sentiment" element={<ProtectedRoute><SentimentDashboard /></ProtectedRoute>} />
        <Route path="/sentiment/feed/:feedId" element={<ProtectedRoute><FeedIntelligence /></ProtectedRoute>} />
        <Route path="/intelligence" element={<ProtectedRoute><IntelligenceDashboard /></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><NetworkDashboard /></ProtectedRoute>} />
        <Route path="/pipeline" element={<ProtectedRoute><PipelineDashboard /></ProtectedRoute>} />
        <Route path="/investigate/:issueId" element={<ProtectedRoute><InvestigateDashboard /></ProtectedRoute>} />

        {/* Backward-Compatible Consolidated Redirects */}
        <Route path="/issues" element={<Navigate to="/alerts?tab=issues" replace />} />
        <Route path="/feedback" element={<Navigate to="/alerts?tab=feedback" replace />} />
        <Route path="/narratives" element={<Navigate to="/intelligence?tab=narratives" replace />} />
        <Route path="/sources/bluesky" element={<Navigate to="/pipeline?tab=bluesky" replace />} />
        <Route path="/sources/youtube" element={<Navigate to="/pipeline?tab=youtube" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
