from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db, SessionLocal
from app.models.social import (
    Topic, TrendSnapshot, SocialPost, EmergingIssue, IntelligenceSignal, 
    IssueEvidence, Alert, post_topic
)
import datetime
import random
from app.intelligence.emerging_issues import detect_issues
from app.ai.alerts import generate_alerts

router = APIRouter(prefix="/api/demo", tags=["Demo"])

def seed_scenario(db: Session, scenario_id: int):
    # 1. Clear existing intelligence data
    db.query(Alert).delete()
    db.query(IssueEvidence).delete()
    db.query(IntelligenceSignal).delete()
    db.query(EmergingIssue).delete()
    db.query(TrendSnapshot).delete()
    
    # We must be careful not to delete topics in a way that breaks foreign keys.
    # We'll just delete the mapping and posts for this demo
    db.execute(post_topic.delete())
    db.query(SocialPost).delete()
    db.query(Topic).delete()
    db.commit()

    now = datetime.datetime.now(datetime.timezone.utc)
    
    # Base configuration per scenario
    if scenario_id == 1:
        topic_name = "Urban Water Supply"
        keywords = ["water", "supply", "disruption", "shortage", "dry", "bmc", "bwssb"]
        posts_data = [
            ("x", "No water supply since morning in Andheri. What is the BMC doing? #mumbaiwatercrisis", "negative", 500, now - datetime.timedelta(minutes=10)),
            ("reddit", "Water problem in Whitefield. Anyone else in Bengaluru facing this?", "neutral", 250, now - datetime.timedelta(minutes=20)),
            ("youtube", "Chennai residents protest over sudden water shortage - Local News", "negative", 1200, now - datetime.timedelta(minutes=50)),
            ("bluesky", "Still no water in South Delhi. This is ridiculous.", "negative", 150, now - datetime.timedelta(minutes=5)),
            ("x", "Water tankers seen near Marine Drive.", "neutral", 300, now - datetime.timedelta(minutes=2)),
        ]
        history_volumes = [100, 110, 105, 120, 500] # Anomaly at end
        history_sentiments = [0.5, 0.51, 0.49, 0.4, 0.2] # Shift negative
        
    elif scenario_id == 2:
        topic_name = "Transport Service Disruption"
        keywords = ["train", "local", "metro", "delay", "station"]
        posts_data = [
            ("x", "All local trains cancelled at Dadar station. Complete chaos! #mumbailocal", "negative", 800, now - datetime.timedelta(minutes=15)),
            ("reddit", "Is there a sudden strike in Namma Metro? I've been waiting at Majestic for an hour.", "neutral", 400, now - datetime.timedelta(minutes=25)),
            ("x", "No DTC buses either. The entire Delhi network is down.", "negative", 600, now - datetime.timedelta(minutes=10)),
            ("bluesky", "Stuck at Chennai Central, avoid the station if possible.", "negative", 200, now - datetime.timedelta(minutes=5)),
            ("youtube", "Live: Commuters stranded as sudden flash strike hits local transport", "neutral", 2500, now - datetime.timedelta(minutes=30)),
        ]
        history_volumes = [200, 190, 210, 250, 1200]
        history_sentiments = [0.6, 0.58, 0.55, 0.3, 0.15]
        
    elif scenario_id == 3:
        topic_name = "Emerging Public Health Issue"
        keywords = ["fever", "dengue", "symptoms", "hospital", "sick"]
        posts_data = [
            ("reddit", "Half my office in Gurgaon called in sick today with the same weird fever.", "negative", 600, now - datetime.timedelta(minutes=45)),
            ("x", "Apollo hospital ER is completely packed tonight. What's going around in Hyderabad?", "negative", 900, now - datetime.timedelta(minutes=30)),
            ("bluesky", "Anyone else in Pune have this sudden fever and cough? It hit me in hours.", "negative", 300, now - datetime.timedelta(minutes=15)),
            ("x", "Schools in Kerala reporting 30% absence rate today due to mysterious viral illness.", "negative", 1500, now - datetime.timedelta(minutes=5)),
            ("youtube", "Doctors warn of rapid spread of new dengue-like fever across multiple states", "neutral", 3000, now - datetime.timedelta(minutes=60)),
        ]
        history_volumes = [50, 60, 55, 80, 800]
        history_sentiments = [0.5, 0.45, 0.48, 0.35, 0.25]
        
    elif scenario_id == 4:
        topic_name = "Major Power Grid Failure"
        keywords = ["power", "outage", "electricity", "blackout", "grid"]
        posts_data = [
            ("x", "Half of South Mumbai is in the dark right now. Massive blackout? #mumbaipowercut", "negative", 1200, now - datetime.timedelta(minutes=10)),
            ("reddit", "No electricity in Indiranagar since 3 hours. BESCOM not responding.", "negative", 500, now - datetime.timedelta(minutes=20)),
            ("bluesky", "Traffic lights are down everywhere due to the grid failure. Complete jam.", "negative", 300, now - datetime.timedelta(minutes=5)),
            ("youtube", "Breaking: Northern Grid fails, multiple states plunged into darkness.", "neutral", 5000, now - datetime.timedelta(minutes=35)),
            ("x", "My inverter is running out, need this power issue fixed ASAP.", "negative", 800, now - datetime.timedelta(minutes=15)),
        ]
        history_volumes = [80, 75, 90, 400, 1500]
        history_sentiments = [0.5, 0.52, 0.48, 0.25, 0.1]
        
    # Create Topic
    topic = Topic(name=topic_name, keywords=keywords, volume=history_volumes[-1], growth_rate=350.0)
    db.add(topic)
    db.commit()
    
    # Create Trend Snapshots for timeline (representing hours)
    for i in range(5):
        snap = TrendSnapshot(
            topic_id=topic.id,
            timestamp=now - datetime.timedelta(hours=5 - i),
            volume=history_volumes[i],
            avg_sentiment=history_sentiments[i],
            total_engagement=history_volumes[i] * random.randint(2, 5)
        )
        db.add(snap)
    db.commit()
    
    # Create Posts
    for i, (plat, text, sent, eng, ts) in enumerate(posts_data):
        post = SocialPost(
            platform=plat,
            source_post_id=f"demo_{scenario_id}_{i}",
            text=text,
            sentiment=sent,
            created_at=ts,
            topics=[topic] # Links the post to the topic
        )
        db.add(post)
    db.commit()

def run_demo_pipeline(scenario_id: int):
    db = SessionLocal()
    try:
        seed_scenario(db, scenario_id)
        detect_issues(db)
        generate_alerts(db)
    finally:
        db.close()

@router.post("/run")
def trigger_demo(scenario_id: int = 1, background_tasks: BackgroundTasks = None):
    if scenario_id not in [1, 2, 3, 4]:
        raise HTTPException(status_code=400, detail="Invalid scenario ID. Must be 1, 2, 3, or 4.")
        
    if background_tasks:
        background_tasks.add_task(run_demo_pipeline, scenario_id)
        return {"status": "accepted", "message": "Demo pipeline started."}
    else:
        # Run synchronously if no background_tasks (e.g. simple test)
        run_demo_pipeline(scenario_id)
        return {"status": "success", "message": "Demo pipeline finished."}
