def normalize_metric(value: float, max_expected: float) -> float:
    """
    Normalizes a value between 0 and 1 using a linear clip.
    E.g. if max_expected is 500 (meaning +500%), a value of 600% becomes 1.0.
    """
    if value <= 0: return 0.0
    return min(value / max_expected, 1.0)

def calculate_signal_score(volume_growth: float, engagement_growth: float, sentiment_shift: float, narrative_growth: float, geographic_spread: float):
    """
    Calculates the S score:
    S = 0.30V + 0.20E + 0.20M + 0.15N + 0.15G
    """
    # Normalize inputs. We define "max_expected" thresholds where hitting the threshold = 1.0 (max signal).
    # V: Volume growth ceiling at +500%
    norm_v = normalize_metric(volume_growth, 500.0)
    
    # E: Engagement growth ceiling at +300%
    norm_e = normalize_metric(engagement_growth, 300.0)
    
    # M: Sentiment shift (absolute percentage points shift, e.g. 50% shift = 1.0)
    norm_m = normalize_metric(abs(sentiment_shift), 50.0)
    
    # N: Narrative growth (using a standard 200% ceiling)
    norm_n = normalize_metric(narrative_growth, 200.0)
    
    # G: Geographic spread (e.g., 5+ unique communities/regions = 1.0)
    norm_g = normalize_metric(geographic_spread, 5.0)
    
    # Calculate weighted score (0 to 1)
    s = (0.30 * norm_v) + (0.20 * norm_e) + (0.20 * norm_m) + (0.15 * norm_n) + (0.15 * norm_g)
    
    # Convert to 0-100 scale
    final_score = round(s * 100, 1)
    
    # Determine level
    level = "LOW"
    if final_score >= 85:
        level = "CRITICAL"
    elif final_score >= 60:
        level = "HIGH"
    elif final_score >= 30:
        level = "MEDIUM"
        
    # Generate factors
    factors = []
    if norm_v > 0.5: factors.append("Sudden massive increase in discussion volume")
    elif norm_v > 0.2: factors.append("Noticeable increase in discussion")
    
    if norm_e > 0.5: factors.append("Extremely high engagement velocity")
    elif norm_e > 0.2: factors.append("Engagement is steadily increasing")
    
    if norm_m > 0.3: factors.append("Significant shift in public sentiment")
    if norm_n > 0.4: factors.append("Underlying narrative is growing rapidly")
    if norm_g >= 0.6: factors.append("Issue is spreading across multiple communities")
    
    if not factors:
        factors.append("General baseline activity")
        
    return final_score, level, factors
