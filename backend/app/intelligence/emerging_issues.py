from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.social import Topic, TrendSnapshot, SocialPost, EmergingIssue, post_topic, IntelligenceSignal, IssueEvidence
from app.intelligence.engine import (
    calculate_volume_signal,
    calculate_anomaly_signal,
    calculate_sentiment_signal,
    calculate_topic_signal,
    calculate_cross_platform_signal,
    calculate_engagement_signal,
    explain_issue
)
import json

def detect_issues(db: Session):
    """
    Extracts raw metrics from the database and runs them through the intelligence engine.
    """
    topics = db.query(Topic).all()
    
    for topic in topics:
        # Get snapshots for this topic
        snapshots = db.query(TrendSnapshot).filter(TrendSnapshot.topic_id == topic.id).order_by(TrendSnapshot.timestamp.asc()).all()
        
        if len(snapshots) < 2:
            continue
            
        history = snapshots[:-1]
        latest = snapshots[-1]
        
        mean_vol = max(sum(s.volume for s in history) / len(history), 1)
        mean_eng = max(sum(s.total_engagement for s in history) / len(history), 1)
        mean_sent = sum(s.avg_sentiment for s in history) / len(history)
        
        # We need a proxy for anomaly if z-score isn't in snapshots.
        # Simple z-score approximation based on history
        vol_variance = sum((s.volume - mean_vol) ** 2 for s in history) / len(history)
        vol_stddev = (vol_variance ** 0.5) if vol_variance > 0 else 1.0
        z_score = (latest.volume - mean_vol) / vol_stddev
        
        # Get platforms
        platforms = db.query(SocialPost.platform).join(post_topic).filter(post_topic.c.topic_id == topic.id).distinct().all()
        platforms_count = len(platforms)
        
        # 1. Calculate Signals
        signals_data = []
        
        v_score, v_exp = calculate_volume_signal(latest.volume, mean_vol)
        signals_data.append({"type": "volume_spike", "score": v_score, "explanation": v_exp, "value": latest.volume})
        
        a_score, a_exp = calculate_anomaly_signal(z_score)
        signals_data.append({"type": "anomaly", "score": a_score, "explanation": a_exp, "value": z_score})
        
        s_score, s_exp = calculate_sentiment_signal(latest.avg_sentiment, mean_sent)
        signals_data.append({"type": "sentiment_shift", "score": s_score, "explanation": s_exp, "value": latest.avg_sentiment})
        
        t_score, t_exp = calculate_topic_signal(topic.growth_rate if topic.growth_rate else 0.0)
        signals_data.append({"type": "topic_growth", "score": t_score, "explanation": t_exp, "value": topic.growth_rate})
        
        cp_score, cp_exp = calculate_cross_platform_signal(platforms_count)
        signals_data.append({"type": "cross_platform_presence", "score": cp_score, "explanation": cp_exp, "value": platforms_count})
        
        e_score, e_exp = calculate_engagement_signal(latest.total_engagement, mean_eng)
        signals_data.append({"type": "engagement_spike", "score": e_score, "explanation": e_exp, "value": latest.total_engagement})
        
        # Total Signal Strength (unweighted sum for transparency)
        total_score = sum(s["score"] for s in signals_data)
        
        # Normalize final score to 0-100 based on a max theoretical of 6.0
        confidence = min((total_score / 6.0) * 100, 100.0)
        
        # Determine Status
        status = "NORMAL"
        if confidence >= 70:
            status = "HIGH SIGNAL"
        elif confidence >= 40:
            status = "EMERGING"
        elif confidence >= 15:
            status = "LOW SIGNAL"
            
        if status in ["NORMAL", "LOW SIGNAL"]:
            continue # Don't create an issue unless it's emerging or high
            
        # Explanation
        explanation = explain_issue(signals_data)
        
        # 2. Record Issue
        # Find if we already have an issue for this topic based on title/description proxy
        # Since we decoupled from topic_id, we use a proxy or just create new if we didn't track
        # A more robust system would map issues to topics in a many-to-many, but for now we create
        
        issue = EmergingIssue(
            title=f"Emerging trend: {topic.name}",
            description=explanation,
            activity_change_percent=((latest.volume - mean_vol) / mean_vol) * 100,
            anomaly_score=z_score,
            sentiment_score=latest.avg_sentiment,
            confidence=confidence,
            status="NEW"
        )
        db.add(issue)
        db.flush() # get ID
        
        # 3. Save Signals
        for s in signals_data:
            if s["score"] > 0.05: # Only save relevant signals
                sig_record = IntelligenceSignal(
                    issue_id=issue.id,
                    signal_type=s["type"],
                    value=s["value"],
                    explanation=s["explanation"],
                    source="intelligence_engine"
                )
                db.add(sig_record)
                
        # 4. Save Evidence (Top posts)
        top_posts = (
            db.query(SocialPost)
            .join(post_topic, SocialPost.id == post_topic.c.post_id)
            .filter(post_topic.c.topic_id == topic.id)
            .limit(5)
            .all()
        )
        for post in top_posts:
            evidence = IssueEvidence(
                issue_id=issue.id,
                post_id=post.id,
                relevance_score=confidence,
                reason="Top post driving the narrative"
            )
            db.add(evidence)
            
    db.commit()
