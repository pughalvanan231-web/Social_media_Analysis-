import os
from datetime import datetime, timedelta
import random
from app.database.connection import SessionLocal
from app.models.social import (
    Topic, EmergingIssue, Alert, SocialPost, 
    TrendSnapshot, Anomaly, Author, EngagementMetrics, AnalystFeedback
)

def clear_data(db):
    print("Clearing existing presentation data...")
    db.query(AnalystFeedback).delete()
    db.query(Alert).delete()
    db.query(EmergingIssue).delete()
    db.query(Anomaly).delete()
    db.query(TrendSnapshot).delete()
    db.query(EngagementMetrics).delete()
    db.query(SocialPost).delete()
    db.query(Author).delete()
    db.query(Topic).delete()
    db.commit()

def seed_demo_data():
    db = SessionLocal()
    try:
        clear_data(db)
        
        print("Seeding DEMO data...")
        now = datetime.utcnow()
        
        # 1. Authors
        author1 = Author(platform="x", platform_user_id="111", username="crypto_whale", display_name="Crypto Whale")
        author2 = Author(platform="bluesky", platform_user_id="222", username="tech_insider", display_name="Tech Insider")
        db.add_all([author1, author2])
        db.commit()
        
        # 2. Topics
        topic1 = Topic(name="AI Regulation Bill Leak", keywords=["AI", "regulation", "leak", "congress"], volume=14500, growth_rate=350.5, classification="emerging")
        topic2 = Topic(name="SpaceX Mars Mission Delay", keywords=["SpaceX", "Mars", "delay", "explosion"], volume=8200, growth_rate=120.0, classification="rapid_narrative")
        topic3 = Topic(name="Quantum Computing Breakthrough", keywords=["quantum", "computing", "qubit", "breakthrough"], volume=5400, growth_rate=45.2, classification="major")
        db.add_all([topic1, topic2, topic3])
        db.commit()
        
        # 3. Trend Snapshots
        for i in range(24):
            t = now - timedelta(hours=24-i)
            snap = TrendSnapshot(
                topic_id=topic1.id, 
                timestamp=t, 
                volume=random.randint(100, 1000) * (i+1),
                avg_sentiment=random.uniform(-0.8, -0.2),
                total_engagement=random.randint(5000, 20000)
            )
            db.add(snap)
        db.commit()
        
        # 4. Posts
        post1 = SocialPost(
            platform="x", source_post_id="x_1001", author_id=author1.id,
            text="Massive leak from Congress indicates strict AI regulation is coming next week! #AI #Regulation",
            created_at=now - timedelta(hours=2), language="en", url="https://x.com/crypto_whale/status/1001"
        )
        post2 = SocialPost(
            platform="bluesky", source_post_id="bsky_2001", author_id=author2.id,
            text="Hearing rumors that the new AI bill will require licensing for all LLMs over 10B parameters. Huge if true.",
            created_at=now - timedelta(hours=1), language="en"
        )
        db.add_all([post1, post2])
        db.commit()
        
        # 5. Engagement Metrics
        eng1 = EngagementMetrics(post_id=post1.id, likes=4500, shares=1200, comments=800, engagement_total=6500)
        eng2 = EngagementMetrics(post_id=post2.id, likes=1200, shares=300, comments=150, engagement_total=1650)
        db.add_all([eng1, eng2])
        
        # 6. Emerging Issues & Alerts
        issue1 = EmergingIssue(
            topic_id=topic1.id, signal_score=92.5, signal_level="CRITICAL", 
            contributing_factors={"velocity": 0.9, "sentiment_shift": -0.8}, status="NEW"
        )
        issue2 = EmergingIssue(
            topic_id=topic2.id, signal_score=75.0, signal_level="HIGH", 
            contributing_factors={"velocity": 0.6}, status="VERIFIED"
        )
        db.add_all([issue1, issue2])
        db.commit()
        
        alert1 = Alert(
            issue_id=issue1.id, score=92.5, severity="CRITICAL", 
            reason="Unprecedented volume spike (350%) detected around AI regulation keywords with strong negative sentiment.",
            status="NEW"
        )
        alert2 = Alert(
            issue_id=issue2.id, score=75.0, severity="HIGH", 
            reason="Rapid narrative forming around SpaceX delays.",
            status="VERIFIED"
        )
        db.add_all([alert1, alert2])
        
        # 7. Anomalies
        anom1 = Anomaly(
            topic_id=topic1.id, anomaly_type="volume_spike", 
            expected_value=1500, actual_value=14500, z_score=4.5
        )
        db.add(anom1)
        
        db.commit()
        print("DEMO data seeded successfully.")
        
    except Exception as e:
        print(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
