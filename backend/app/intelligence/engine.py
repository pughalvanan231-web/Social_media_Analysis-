def normalize_metric(value: float, max_expected: float) -> float:
    """Normalizes a value between 0.0 and 1.0 based on a maximum expected ceiling."""
    if value <= 0: return 0.0
    return min(value / max_expected, 1.0)

def calculate_volume_signal(current_volume: float, baseline_volume: float):
    if baseline_volume <= 0:
        if current_volume > 0:
            return 1.0, "Volume increased from 0"
        return 0.0, "No volume change"
    
    growth_pct = ((current_volume - baseline_volume) / baseline_volume) * 100
    if growth_pct <= 0:
        return 0.0, f"Volume decreased or flat ({growth_pct:.1f}%)"
    
    score = normalize_metric(growth_pct, 500.0)
    return score, f"Discussion volume increased by {growth_pct:.1f}%"

def calculate_anomaly_signal(z_score: float):
    if z_score < 2.0:
        return 0.0, "Activity is within normal statistical range"
    
    # Cap z-score impact around 5.0
    score = normalize_metric(z_score - 2.0, 3.0) 
    return score, f"Activity is {z_score:.1f} standard deviations above baseline"

def calculate_sentiment_signal(avg_sentiment: float, prev_sentiment: float = None):
    # Sentiment is usually 0.0 to 1.0 (where < 0.4 is negative, > 0.6 is positive)
    is_negative = avg_sentiment < 0.45
    
    if prev_sentiment is not None and prev_sentiment > 0:
        shift_pct = ((avg_sentiment - prev_sentiment) / prev_sentiment) * 100
        score = normalize_metric(abs(shift_pct), 50.0)
        direction = "negative" if shift_pct < 0 else "positive"
        return score, f"Sentiment shifted {abs(shift_pct):.1f}% in a {direction} direction"
    else:
        # If no baseline, just flag high negativity
        if is_negative:
            # e.g., avg_sentiment 0.2 means very negative. Score = 0.5 to 1.0
            score = normalize_metric(0.45 - avg_sentiment, 0.45)
            return score, f"Highly negative sentiment detected (score: {avg_sentiment:.2f})"
        return 0.0, f"Sentiment is neutral/positive (score: {avg_sentiment:.2f})"

def calculate_topic_signal(growth_rate: float):
    if growth_rate <= 0:
        return 0.0, "Topic narrative is not growing"
    
    score = normalize_metric(growth_rate, 200.0)
    return score, f"Underlying topic/narrative grew by {growth_rate:.1f}%"

def calculate_cross_platform_signal(platforms_count: int):
    if platforms_count <= 1:
        return 0.0, f"Discussions isolated to 1 platform"
    
    # 4 platforms is max
    score = normalize_metric(float(platforms_count - 1), 3.0)
    return score, f"Related discussions appeared across {platforms_count} platforms"

def calculate_engagement_signal(current_eng: float, baseline_eng: float):
    if baseline_eng <= 0:
        if current_eng > 0:
            return 1.0, "Engagement increased from 0"
        return 0.0, "No engagement change"
        
    growth_pct = ((current_eng - baseline_eng) / baseline_eng) * 100
    if growth_pct <= 0:
        return 0.0, f"Engagement decreased or flat ({growth_pct:.1f}%)"
    
    score = normalize_metric(growth_pct, 300.0)
    return score, f"Engagement velocity increased by {growth_pct:.1f}%"

def explain_issue(signals: list) -> str:
    """Takes a list of dictionaries with 'explanation' and 'score' and returns formatted text."""
    # Filter to signals that actually contributed (score > 0.1)
    contributing = [s for s in signals if s.get('score', 0) > 0.1]
    
    if not contributing:
        return "Detected general baseline activity without strong specific signals."
        
    explanation = "Detected because:\n"
    for s in contributing:
        explanation += f"- {s.get('explanation')}\n"
        
    return explanation.strip()
