from sqlalchemy.orm import Session
from app.models.social import Topic, TrendSnapshot, SocialPost, EmergingIssue, post_topic
from app.intelligence.signal_score import calculate_signal_score
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
        
        # Calculate Volume Growth (V) %
        mean_vol = max(sum(s.volume for s in history) / len(history), 1)
        v_growth = ((latest.volume - mean_vol) / mean_vol) * 100
        
        # Calculate Engagement Growth (E) %
        mean_eng = max(sum(s.total_engagement for s in history) / len(history), 1)
        e_growth = ((latest.total_engagement - mean_eng) / mean_eng) * 100
        
        # Calculate Sentiment Shift (M) % points
        mean_sent = sum(s.avg_sentiment for s in history) / len(history)
        m_shift = abs((latest.avg_sentiment - mean_sent) / mean_sent) * 100
        
        # Narrative Growth (N) - derived from topic's base growth rate
        n_growth = topic.growth_rate if topic.growth_rate else 0.0
        
        # Geographic/Community Spread (G)
        # For MVP, we calculate the number of unique authors participating in this topic
        unique_authors = db.query(SocialPost.author_username).join(post_topic).filter(post_topic.c.topic_id == topic.id).distinct().count()
        g_spread = float(unique_authors)
        
        # Calculate Final Signal Score
        score, level, factors = calculate_signal_score(v_growth, e_growth, m_shift, n_growth, g_spread)
        
        # Record Issue (update if exists, else create)
        existing_issue = db.query(EmergingIssue).filter(EmergingIssue.topic_id == topic.id).first()
        
        if existing_issue:
            existing_issue.signal_score = score
            existing_issue.signal_level = level
            existing_issue.contributing_factors = factors
        else:
            issue = EmergingIssue(
                topic_id=topic.id,
                signal_score=score,
                signal_level=level,
                contributing_factors=factors
            )
            db.add(issue)
            
    db.commit()
