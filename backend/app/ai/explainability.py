from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.social import EmergingIssue, Topic, SocialPost, TrendSnapshot, EngagementMetrics, post_topic
from app.ai.geographic_spread import analyze_issue_geography
from app.ai.network import build_social_network

def generate_issue_explanation(issue_id: int, db: Session) -> dict:
    """
    Generates a deterministic explainability report for why a signal was flagged,
    based on actual calculated metrics in the DB.
    """
    
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue:
        return {"error": "Issue not found"}
        
    topic = issue.topic
    if not topic:
        return {"error": "Underlying topic not found"}
        
    # 1. Signal Score
    signal_score = issue.signal_score
    
    # 2. Top contributing factors
    factors = issue.contributing_factors or []
    
    # 3. Important Keywords
    keywords = topic.keywords or []
    
    # 4. Representative posts
    # Fetch posts linked to this topic, sorted by engagement
    posts_query = (
        db.query(SocialPost)
        .join(post_topic, SocialPost.id == post_topic.c.post_id)
        .outerjoin(EngagementMetrics, SocialPost.id == EngagementMetrics.post_id)
        .filter(post_topic.c.topic_id == topic.id)
        .order_by(desc(EngagementMetrics.engagement_total))
        .limit(3)
    )
    top_posts = posts_query.all()
    representative_posts = []
    for p in top_posts:
        eng = p.engagement.engagement_total if p.engagement else 0
        representative_posts.append({
            "text": p.text[:200] + "..." if len(p.text) > 200 else p.text,
            "platform": p.platform,
            "engagement": eng
        })
        
    # 5. Volume Change & 7. Engagement Change & 6. Sentiment Change
    # Let's get the latest two trend snapshots to compare
    snapshots = (
        db.query(TrendSnapshot)
        .filter(TrendSnapshot.topic_id == topic.id)
        .order_by(desc(TrendSnapshot.timestamp))
        .limit(2)
        .all()
    )
    
    vol_change = "N/A"
    eng_change = "N/A"
    sent_change = "N/A"
    
    if len(snapshots) >= 2:
        current = snapshots[0]
        previous = snapshots[1]
        
        if previous.volume > 0:
            v_pct = ((current.volume - previous.volume) / previous.volume) * 100
            vol_change = f"{v_pct:+.1f}%"
        else:
            vol_change = "Increased (from 0)"
            
        if previous.total_engagement > 0:
            e_pct = ((current.total_engagement - previous.total_engagement) / previous.total_engagement) * 100
            eng_change = f"{e_pct:+.1f}%"
            
        # Sentiment scale is 0 to 1
        s_diff = (current.avg_sentiment - previous.avg_sentiment) * 100
        sent_change = f"{s_diff:+.1f}% shift"
    elif len(snapshots) == 1:
        # Only one snapshot, we just report the totals
        vol_change = f"Volume: {snapshots[0].volume}"
        eng_change = f"Engagement: {snapshots[0].total_engagement}"
        sent_change = f"Sentiment Score: {snapshots[0].avg_sentiment:.2f}"
        
    # 8. Topic Growth
    topic_growth = f"{topic.growth_rate:+.1f}%"
    
    # 9. Geographic & Community Spread
    geo_data = analyze_issue_geography(issue_id, db)
    if geo_data.get("available") and geo_data.get("summary"):
        geo_spread = f"Spread across {geo_data['summary'].get('total_regions', 0)} regions"
    else:
        geo_spread = "Geographic data unavailable"
        
    # We do a lightweight network build to get community count
    try:
        network = build_social_network(db, topic_id=topic.id, limit=200)
        unique_communities = len(set([n.get("community") for n in network.get("nodes", [])]))
        community_spread = f"Active across {unique_communities} detected communities" if unique_communities > 0 else "Insufficient network data"
    except Exception:
        community_spread = "Community calculation failed"
        
    # 10. Confidence
    # Rough heuristic: High volume and multiple factors = high confidence
    confidence_score = min(100, int((topic.volume / 10) + (len(factors) * 15)))
    confidence = f"{confidence_score}%"
    
    return {
        "signal_score": signal_score,
        "contributing_factors": factors,
        "important_keywords": keywords,
        "representative_posts": representative_posts,
        "sentiment_change": sent_change,
        "volume_change": vol_change,
        "engagement_change": eng_change,
        "topic_growth": topic_growth,
        "geographic_spread": geo_spread,
        "community_spread": community_spread,
        "confidence": confidence
    }
