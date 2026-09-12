from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db, SessionLocal
from app.models.social import SocialPost, PostAnalysis

# Note: We import this here so the model starts loading, 
# but it might take a moment on first boot.
from app.ai.sentiment import analyze_posts_batch

router = APIRouter(prefix="/api/ai", tags=["AI"])

def run_analysis_task(batch_size: int = 100):
    """
    Wrapper for the background task to ensure it gets its own DB session.
    """
    db = SessionLocal()
    try:
        analyze_posts_batch(db, batch_size)
    finally:
        db.close()

@router.post("/analyze/sentiment")
def trigger_sentiment_analysis(background_tasks: BackgroundTasks, batch_size: int = 100):
    """
    Trigger a background job to analyze posts missing sentiment scores.
    """
    background_tasks.add_task(run_analysis_task, batch_size)
    return {"status": "accepted", "message": f"Background analysis job started for up to {batch_size} posts."}
