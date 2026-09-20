// Mock data for Gossip Protocol Intelligence Dashboard

export const MOCK_STATS = {
  posts_analyzed: 1450239,
  active_issues: 12,
  emerging_signals: 48,
  critical_alerts: 3,
  platforms_monitored: 4
};

export const MOCK_ISSUES = [
  {
    id: 1,
    title: "Urban Water Supply Disruption",
    description: "Detected general baseline activity without strong specific signals.",
    confidence: 82.5,
    anomaly_score: 4.8,
    sentiment_score: 0.12,
    activity_change_percent: 184.0,
    status: "HIGH SIGNAL",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    platforms: ["x", "reddit", "youtube"]
  },
  {
    id: 2,
    title: "Uncoordinated Transit Strike",
    description: "Detected because volume increased by 250% and sentiment shifted 40% in a negative direction.",
    confidence: 65.0,
    anomaly_score: 2.1,
    sentiment_score: 0.35,
    activity_change_percent: 250.0,
    status: "EMERGING",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    platforms: ["x", "bluesky"]
  }
];

export const MOCK_ALERTS = [
  {
    id: 1,
    issue_id: 1,
    title: "Urban Water Supply Disruption",
    explanation: "EMERGING ISSUE DETECTED\n\nUrban Water Supply Disruption\n\nEvidence:\n✓ Discussion volume increased by 184.0%\n✓ Activity is 4.8 standard deviations above baseline\n✓ 4 representative posts linked",
    severity: "CRITICAL",
    score: 82.5,
    detected_at: new Date(Date.now() - 300000).toISOString()
  }
];

export const MOCK_TREND_DATA = [
  { time: '00:00', volume: 1200, anomaly: false },
  { time: '04:00', volume: 1100, anomaly: false },
  { time: '08:00', volume: 1800, anomaly: false },
  { time: '12:00', volume: 2400, anomaly: false },
  { time: '16:00', volume: 3800, anomaly: false },
  { time: '20:00', volume: 9200, anomaly: true },
  { time: '24:00', volume: 8500, anomaly: false },
];

export const MOCK_PLATFORM_DATA = [
  { name: 'X', value: 45 },
  { name: 'Reddit', value: 30 },
  { name: 'YouTube', value: 15 },
  { name: 'Bluesky', value: 10 },
];

export const MOCK_SENTIMENT_DATA = [
  { name: 'Positive', value: 15, fill: '#3b82f6' },
  { name: 'Neutral', value: 25, fill: '#6b7280' },
  { name: 'Negative', value: 60, fill: '#ef4444' },
];

export const MOCK_CORRELATION = {
  issue_id: 1,
  platforms_detected: ["x", "reddit", "youtube"],
  number_of_posts: 1248,
  unique_sources: 850,
  time_window: { start: new Date(Date.now() - 3600000 * 4).toISOString(), end: new Date().toISOString() },
  related_keywords: ["water", "supply", "disruption", "urban", "shortage"],
  cross_platform_signal: 0.67
};

export const MOCK_SIGNALS = [
  { id: 1, signal_type: "volume_spike", value: 184.0, explanation: "Discussion volume increased by 184.0%" },
  { id: 2, signal_type: "anomaly", value: 4.8, explanation: "Activity is 4.8 standard deviations above baseline" },
  { id: 3, signal_type: "sentiment_shift", value: 72.0, explanation: "Sentiment shifted 72% in a negative direction" },
  { id: 4, signal_type: "cross_platform_presence", value: 3.0, explanation: "Detected across 3 platforms" },
  { id: 5, signal_type: "topic_growth", value: 45.0, explanation: "Underlying topic grew by 45%" }
];

export const MOCK_EVIDENCE = [
  {
    evidence_id: 1, relevance_score: 95.0, reason: "Top post driving the narrative",
    platform: "x", text: "No water supply since morning. What is the city council doing? #watercrisis",
    sentiment: "negative", created_at: new Date(Date.now() - 3600000).toISOString(),
    url: "https://x.com/mock/1"
  },
  {
    evidence_id: 2, relevance_score: 88.0, reason: "High engagement anomaly",
    platform: "reddit", text: "Water problem in our area. Anyone else facing this?",
    sentiment: "neutral", created_at: new Date(Date.now() - 7200000).toISOString(),
    url: "https://reddit.com/mock/1"
  },
  {
    evidence_id: 3, relevance_score: 82.0, reason: "Cross-platform confirmation",
    platform: "youtube", text: "Residents complain about water shortage - Local News",
    sentiment: "negative", created_at: new Date(Date.now() - 14400000).toISOString(),
    url: "https://youtube.com/mock/1"
  }
];
