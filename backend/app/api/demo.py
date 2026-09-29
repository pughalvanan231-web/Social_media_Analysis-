from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db, SessionLocal
from app.models.social import (
    Topic, TrendSnapshot, SocialPost, EmergingIssue, IntelligenceSignal, 
    IssueEvidence, Alert, post_topic, EngagementMetrics, PostAnalysis, Author
)
import datetime
import random
from app.intelligence.emerging_issues import detect_issues
from app.ai.alerts import generate_alerts
from app.services.data_pipeline import run_pipeline
from app.api.intelligence import ensure_topics_seeded
from app.ai.narratives import compute_narrative_growth

router = APIRouter(prefix="/api/demo", tags=["Demo"])

def run_demo_pipeline():
    db = SessionLocal()
    try:
        # Clear existing dynamic issues and alerts for a fresh scan
        db.query(Alert).delete()
        db.query(IssueEvidence).delete()
        db.query(IntelligenceSignal).delete()
        db.query(EmergingIssue).delete()
        db.query(TrendSnapshot).delete()
        db.execute(post_topic.delete())
        db.commit()
            
        topics = [
            "Urban Water Supply",
            "Transport Service Disruption",
            "Public Health Issue",
            "Major Power Grid Failure"
        ]
        query = random.choice(topics)
            
        allowed_sources = ["bluesky", "youtube", "x", "reddit"]
        try:
            run_pipeline(keyword=query, sources=allowed_sources, db=db)
        except Exception as e:
            print(f"Data pipeline live fetch note: {e}")

        # Ensure topics are seeded and structured
        ensure_topics_seeded(db)
        all_topics = db.query(Topic).all()
        posts = db.query(SocialPost).all()

        # Ensure posts have sentiment analysis and are linked to topics
        for p in posts:
            if not p.analysis:
                is_negative = "water" in (p.text or "").lower() or "disruption" in (p.text or "").lower() or "crisis" in (p.text or "").lower()
                analysis = PostAnalysis(
                    post_id=p.id,
                    sentiment_score=round(random.uniform(0.12, 0.38) if is_negative else random.uniform(0.55, 0.85), 2),
                    sentiment="negative" if is_negative else "positive",
                    confidence=0.92
                )
                db.add(analysis)

            # Ensure post is mapped to at least 1 topic
            if not p.topics and all_topics:
                p.topics.append(all_topics[0])

        db.commit()

        # Generate TrendSnapshots for each topic across historical time buckets
        now = datetime.datetime.utcnow()
        for topic in all_topics:
            is_anomaly_target = (topic.name.lower().startswith(query.lower()[:8]) or topic.id == 1)
            for i in range(5, 0, -1):
                t_time = now - datetime.timedelta(hours=i)
                vol = 14 + (i * 3) if not is_anomaly_target else (16 if i > 1 else 115)
                eng = vol * (35 if not is_anomaly_target else 145)
                sent = 0.52 if not is_anomaly_target else (0.48 if i > 1 else 0.19)
                snap = TrendSnapshot(
                    topic_id=topic.id,
                    timestamp=t_time,
                    volume=vol,
                    total_engagement=eng,
                    avg_sentiment=sent
                )
                db.add(snap)
        db.commit()

        # Update narrative velocities & classifications
        compute_narrative_growth(db)

        # Detect emerging issues through the intelligence engine
        detect_issues(db)

        # Generate explainable alerts
        generate_alerts(db)

    except Exception as e:
        print(f"Error running demo pipeline: {e}")
        db.rollback()
    finally:
        db.close()

@router.post("/run")
def trigger_demo():
    run_demo_pipeline()
    return {"status": "success", "message": "Demo intelligence scan completed."}
