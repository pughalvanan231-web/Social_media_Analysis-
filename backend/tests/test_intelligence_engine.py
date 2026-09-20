import pytest
from app.intelligence.engine import (
    normalize_metric,
    calculate_volume_signal,
    calculate_anomaly_signal,
    calculate_sentiment_signal,
    calculate_topic_signal,
    calculate_cross_platform_signal,
    calculate_engagement_signal,
    explain_issue
)

def test_normalize_metric():
    assert normalize_metric(0, 100) == 0.0
    assert normalize_metric(-10, 100) == 0.0
    assert normalize_metric(50, 100) == 0.5
    assert normalize_metric(100, 100) == 1.0
    assert normalize_metric(200, 100) == 1.0

def test_calculate_volume_signal():
    score, text = calculate_volume_signal(600, 200) # +200% growth
    assert score == 0.4
    assert "increased by 200.0%" in text
    
    score, text = calculate_volume_signal(100, 200)
    assert score == 0.0
    assert "decreased or flat" in text
    
    score, text = calculate_volume_signal(100, 0)
    assert score == 1.0
    assert "increased from 0" in text

def test_calculate_anomaly_signal():
    score, text = calculate_anomaly_signal(1.5)
    assert score == 0.0
    assert "normal" in text
    
    score, text = calculate_anomaly_signal(3.5)
    # (3.5 - 2.0) / 3.0 = 1.5 / 3.0 = 0.5
    assert score == 0.5
    assert "3.5 standard deviations" in text

def test_calculate_sentiment_signal():
    # Test shift
    score, text = calculate_sentiment_signal(0.2, 0.4) # -50% shift
    assert score == 1.0
    assert "shifted 50.0% in a negative direction" in text
    
    # Test flat highly negative (no baseline)
    score, text = calculate_sentiment_signal(0.2)
    # 0.45 - 0.2 = 0.25. 0.25 / 0.45 = 0.555...
    assert score > 0.5
    assert "Highly negative" in text
    
    # Test flat positive (no baseline)
    score, text = calculate_sentiment_signal(0.8)
    assert score == 0.0
    assert "neutral/positive" in text

def test_calculate_cross_platform_signal():
    score, text = calculate_cross_platform_signal(1)
    assert score == 0.0
    
    score, text = calculate_cross_platform_signal(4)
    assert score == 1.0
    assert "across 4 platforms" in text

def test_explain_issue():
    signals = [
        {"score": 0.5, "explanation": "Volume increased by 250%"},
        {"score": 0.8, "explanation": "Activity is 4.4 standard deviations above baseline"},
        {"score": 0.0, "explanation": "Discussions isolated to 1 platform"}
    ]
    
    explanation = explain_issue(signals)
    
    assert "Detected because:" in explanation
    assert "Volume increased by 250%" in explanation
    assert "4.4 standard deviations" in explanation
    assert "isolated to 1 platform" not in explanation # Score is 0.0, shouldn't be included
