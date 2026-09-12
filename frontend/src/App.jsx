import React, { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import SidebarLayout from './components/SidebarLayout'
import MainDashboard from './pages/MainDashboard'
import BlueskySearch from './pages/BlueskySearch'
import YoutubeSearch from './pages/YoutubeSearch'
import PipelineDashboard from './pages/PipelineDashboard'
import SentimentDashboard from './pages/SentimentDashboard'
import IntelligenceDashboard from './pages/IntelligenceDashboard'
import TrendsDashboard from './pages/TrendsDashboard'
import IssuesDashboard from './pages/IssuesDashboard'
import NetworkDashboard from './pages/NetworkDashboard'
import AlertsDashboard from './pages/AlertsDashboard'
import InvestigateDashboard from './pages/InvestigateDashboard'
import FeedbackAnalytics from './pages/FeedbackAnalytics'

function App() {
  return (
    <SidebarLayout>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/pipeline" element={<PipelineDashboard />} />
        <Route path="/sentiment" element={<SentimentDashboard />} />
        <Route path="/intelligence" element={<IntelligenceDashboard />} />
        <Route path="/trends" element={<TrendsDashboard />} />
        <Route path="/issues" element={<IssuesDashboard />} />
        <Route path="/alerts" element={<AlertsDashboard />} />
        <Route path="/investigate/:issueId" element={<InvestigateDashboard />} />
        <Route path="/feedback" element={<FeedbackAnalytics />} />
        <Route path="/network" element={<NetworkDashboard />} />
        <Route path="/sources/bluesky" element={<BlueskySearch />} />
        <Route path="/sources/youtube" element={<YoutubeSearch />} />
      </Routes>
    </SidebarLayout>
  )
}

export default App
