from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db, SessionLocal
from app.models.social import (
    Topic, TrendSnapshot, SocialPost, EmergingIssue, IntelligenceSignal, 
    IssueEvidence, Alert, post_topic, EngagementMetrics, PostAnalysis
)
import datetime
import random
from app.intelligence.emerging_issues import detect_issues
from app.ai.alerts import generate_alerts
from app.services.data_pipeline import run_pipeline

router = APIRouter(prefix="/api/demo", tags=["Demo"])

def run_demo_pipeline():
    db = SessionLocal()
    try:
        # Clear existing data for a fresh run
        db.query(Alert).delete()
        db.query(IssueEvidence).delete()
        db.query(IntelligenceSignal).delete()
        db.query(EmergingIssue).delete()
        db.query(TrendSnapshot).delete()
        db.execute(post_topic.delete())
        db.query(EngagementMetrics).delete()
        db.query(PostAnalysis).delete()
        db.query(SocialPost).delete()
        db.query(Topic).delete()
        db.commit()
            
        topics = [
            "Urban Water Supply",
            "Transport Service Disruption",
            "Public Health Issue",
            "Major Power Grid Failure"
        ]
        query = random.choice(topics)
            
        allowed_sources = ["bluesky", "youtube", "x", "reddit"]
        run_pipeline(keyword=query, sources=allowed_sources, db=db)
        
        detect_issues(db)
        generate_alerts(db)
    finally:
        db.close()

@router.post("/run")
def trigger_demo(background_tasks: BackgroundTasks = None):
    if background_tasks:
        background_tasks.add_task(run_demo_pipeline)
        return {"status": "accepted", "message": "Demo pipeline started."}
    else:
        # Run synchronously if no background_tasks (e.g. simple test)
        run_demo_pipeline()
        return {"status": "success", "message": "Demo pipeline finished."}
