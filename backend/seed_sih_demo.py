import os
from datetime import datetime, timedelta
import random
from app.database.connection import SessionLocal
from app.models.social import (
    Topic, EmergingIssue, Alert, SocialPost, 
    TrendSnapshot, Anomaly, Author, EngagementMetrics, AnalystFeedback, User
)
from app.core.security import get_password_hash

def clear_data(db):
    print("Clearing existing presentation data...")
    from app.models.social import PostAnalysis
    db.query(PostAnalysis).delete()
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

def seed_users(db):
    if not db.query(User).filter(User.username == "admin").first():
        db.add(User(username="admin", email="admin@gossip-protocol.local", hashed_password=get_password_hash("admin123"), role="ADMIN", is_active=True))
    if not db.query(User).filter(User.username == "analyst").first():
        db.add(User(username="analyst", email="analyst@gossip-protocol.local", hashed_password=get_password_hash("analyst123"), role="ANALYST", is_active=True))
    db.commit()

def generate_water_scenario(db):
    print("Generating SIH Urban Water Supply Disruption Scenario...")
    now = datetime.utcnow()
    
    # 1. Topic Creation
    water_topic = Topic(
        name="Urban Water Supply Disruption", 
        keywords=["water", "supply", "disruption", "outage", "dirty", "contamination", "pipeline", "pressure", "metro"], 
        volume=32400, 
        growth_rate=412.5, 
        classification="rapid_narrative"
    )
    db.add(water_topic)
    db.commit()

    # 2. Chronological Timeline (T-72 to T-0)
    for i in range(72, -1, -2):
        t = now - timedelta(hours=i)
        
        # Base activity
        vol = 200 + random.randint(-50, 50)
        sent = random.uniform(-0.1, 0.1)
        eng = vol * 10
        
        # Ramp up at T-24
        if i <= 24 and i > 12:
            vol = int(vol * 2.5)
            sent = random.uniform(-0.4, -0.2)
            eng = vol * 15
            
        # Spike at T-12
        if i <= 12:
            vol = int(vol * 8.0)
            sent = random.uniform(-0.9, -0.6)
            eng = vol * 30
            
        snap = TrendSnapshot(
            topic_id=water_topic.id,
            timestamp=t,
            volume=vol,
            avg_sentiment=sent,
            total_engagement=eng
        )
        db.add(snap)
        
        # Add anomaly at T-12
        if i == 12:
            anom = Anomaly(
                topic_id=water_topic.id, anomaly_type="volume_spike", 
                expected_value=500, actual_value=vol, z_score=6.2, timestamp=t
            )
            db.add(anom)
            
    db.commit()

    # 3. Authors & Posts demonstrating the pipeline
    authors = [
        Author(platform="x", platform_user_id="u1", username="city_watcher", display_name="City Watcher"),
        Author(platform="x", platform_user_id="u2", username="angry_resident77", display_name="Resident 77"),
        Author(platform="bluesky", platform_user_id="u3", username="metro_news", display_name="Metro News Update"),
        Author(platform="reddit", platform_user_id="u4", username="plumbing_expert", display_name="Plumbing Expert"),
    ]
    db.add_all(authors)
    db.commit()

    # T-72: Normal activity
    post1 = SocialPost(
        platform="x", source_post_id="p1", author_id=authors[0].id,
        text="The water pressure seems a bit low today in Sector 4. Anyone else noticing this? #water",
        created_at=now - timedelta(hours=70), language="en", url="https://x.com/p1",
        emotion="neutral"
    )
    # T-24: Increasing discussion
    post2 = SocialPost(
        platform="reddit", source_post_id="p2", author_id=authors[3].id,
        text="I've been getting calls all morning from the downtown area about brown water coming from taps. Seems like a main line issue.",
        created_at=now - timedelta(hours=22), language="en", url="https://reddit.com/p2",
        emotion="surprise"
    )
    # T-12: Spike & Sentiment Drop
    post3 = SocialPost(
        platform="x", source_post_id="p3", author_id=authors[1].id,
        text="THIS IS UNACCEPTABLE! We have no water for 6 hours and what comes out is literally brown sludge. The city is silent! @MetroGov #WaterCrisis #MetroDisaster",
        created_at=now - timedelta(hours=10), language="en", url="https://x.com/p3",
        emotion="anger"
    )
    # T-6: Community Spread & Narrative
    post4 = SocialPost(
        platform="bluesky", source_post_id="p4", author_id=authors[2].id,
        text="BREAKING: Thousands of residents reporting complete water outages and severe contamination across 12 sectors. Preliminary reports suggest a catastrophic failure at the central pumping station.",
        created_at=now - timedelta(hours=5), language="en", url="https://bsky.app/p4",
        emotion="fear"
    )
    
    db.add_all([post1, post2, post3, post4])
    db.commit()

    from app.models.social import PostAnalysis

    analysis1 = PostAnalysis(post_id=post1.id, sentiment="neutral", sentiment_score=-0.1, confidence=0.85)
    analysis2 = PostAnalysis(post_id=post2.id, sentiment="negative", sentiment_score=-0.4, confidence=0.92)
    analysis3 = PostAnalysis(post_id=post3.id, sentiment="negative", sentiment_score=-0.9, confidence=0.98)
    analysis4 = PostAnalysis(post_id=post4.id, sentiment="negative", sentiment_score=-0.8, confidence=0.95)
    db.add_all([analysis1, analysis2, analysis3, analysis4])
    db.commit()

    # Engagement Metrics
    db.add_all([
        EngagementMetrics(post_id=post1.id, likes=12, shares=2, comments=4, engagement_total=18),
        EngagementMetrics(post_id=post2.id, likes=450, shares=120, comments=85, engagement_total=655),
        EngagementMetrics(post_id=post3.id, likes=12500, shares=8400, comments=2100, engagement_total=23000),
        EngagementMetrics(post_id=post4.id, likes=45000, shares=22000, comments=9500, engagement_total=76500)
    ])

    # 4. Emerging Issue Generation
    issue = EmergingIssue(
        topic_id=water_topic.id,
        signal_score=96.4,
        signal_level="CRITICAL",
        contributing_factors=[
            "Unprecedented 412% velocity spike in last 12 hours.",
            "Sentiment shifted from neutral to strongly negative (-0.75 avg).",
            "Narrative 'catastrophic failure' detected scaling across platforms.",
            "High geographic concentration in urban downtown sectors."
        ],
        status="VERIFIED",
        created_at=now - timedelta(hours=4)
    )
    db.add(issue)
    db.commit()

    # 5. Alert Generation
    alert = Alert(
        issue_id=issue.id,
        score=96.4,
        severity="CRITICAL",
        reason="A critical infrastructure disruption is unfolding. Massive volume spike combined with extremely negative sentiment regarding urban water supply contamination.",
        status="VERIFIED",
        detected_at=now - timedelta(hours=2)
    )
    db.add(alert)
    db.commit()

    # 6. Analyst Feedback / Decision Support
    admin_user = db.query(User).filter(User.username == "admin").first()
    if admin_user:
        feedback = AnalystFeedback(
            issue_id=issue.id,
            analyst_action="VERIFIED",
            previous_score=96.4,
            new_status="VERIFIED",
            reason="Verified multiple local news reports and high-engagement videos confirming main pipeline rupture. Immediate mobilization recommended.",
            created_at=now
        )
        db.add(feedback)
    
    db.commit()

def seed_demo_data():
    db = SessionLocal()
    try:
        clear_data(db)
        seed_users(db)
        generate_water_scenario(db)
        print("SIH DEMO data seeded successfully.")
    except Exception as e:
        print(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
