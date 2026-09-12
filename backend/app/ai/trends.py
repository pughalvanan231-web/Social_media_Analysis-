from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.social import SocialPost, Topic, TrendSnapshot, post_topic
from datetime import datetime, timedelta

def compute_topic_trends(db: Session):
    """
    Groups posts by minute (for MVP dynamic charts) and computes 
    volume, engagement, and sentiment for each Topic.
    """
    topics = db.query(Topic).all()
    
    # We will compute snapshots for the last 60 minutes
    now = datetime.utcnow()
    start_time = now - timedelta(minutes=60)
    
    for topic in topics:
        # Get posts for this topic in the time window
        posts = (
            db.query(SocialPost)
            .join(post_topic)
            .filter(post_topic.c.topic_id == topic.id)
            .filter(SocialPost.created_at >= start_time)
            .all()
        )
        
        # Group by minute
        minute_buckets = {}
        for post in posts:
            minute = post.created_at.replace(second=0, microsecond=0)
            if minute not in minute_buckets:
                minute_buckets[minute] = {'volume': 0, 'engagement': 0, 'sentiment_sum': 0.0, 'sentiment_count': 0}
            
            minute_buckets[minute]['volume'] += 1
            minute_buckets[minute]['engagement'] += (post.likes + post.comments + post.shares)
            
            if post.analysis:
                minute_buckets[minute]['sentiment_sum'] += post.analysis.sentiment_score
                minute_buckets[minute]['sentiment_count'] += 1

        for minute, data in minute_buckets.items():
            # Check if snapshot already exists
            existing_snapshot = db.query(TrendSnapshot).filter(
                TrendSnapshot.topic_id == topic.id,
                TrendSnapshot.timestamp == minute
            ).first()
            
            avg_sentiment = 0.5
            if data['sentiment_count'] > 0:
                avg_sentiment = data['sentiment_sum'] / data['sentiment_count']
                
            if existing_snapshot:
                existing_snapshot.volume = data['volume']
                existing_snapshot.total_engagement = data['engagement']
                existing_snapshot.avg_sentiment = avg_sentiment
            else:
                new_snapshot = TrendSnapshot(
                    topic_id=topic.id,
                    timestamp=minute,
                    volume=data['volume'],
                    total_engagement=data['engagement'],
                    avg_sentiment=avg_sentiment
                )
                db.add(new_snapshot)
                
    db.commit()
