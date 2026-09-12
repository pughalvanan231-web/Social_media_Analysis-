from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db, SessionLocal
from app.models.social import Topic, SocialPost
from app.ai.topics import discover_topics
from app.ai.narratives import compute_narrative_growth

router = APIRouter(prefix="/api/intelligence", tags=["Intelligence"])

def run_topic_job():
    db = SessionLocal()
    try:
        discover_topics(db, sample_size=1000)
        compute_narrative_growth(db)
    finally:
        db.close()

@router.post("/run")
def trigger_topic_discovery(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_topic_job)
    return {"status": "accepted", "message": "Topic clustering and narrative analysis started in the background."}

@router.get("/topics")
def get_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).order_by(Topic.volume.desc()).all()
    return [{
        "id": t.id,
        "name": t.name,
        "keywords": t.keywords,
        "volume": t.volume,
        "growth_rate": t.growth_rate,
        "classification": t.classification
    } for t in topics]

@router.get("/topics/{topic_id}")
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    posts = topic.posts[:20] # Return top 20
    
    return {
        "id": topic.id,
        "name": topic.name,
        "keywords": topic.keywords,
        "volume": topic.volume,
        "growth_rate": topic.growth_rate,
        "classification": topic.classification,
        "posts": [
            {
                "id": p.id,
                "platform": p.platform,
                "text": p.text,
                "author_username": p.author_username
            } for p in posts
        ]
    }

@router.get("/narratives")
def get_narratives(db: Session = Depends(get_db)):
    topics = db.query(Topic).all()
    
    rapid = [t for t in topics if t.classification == "rapid_narrative"]
    emerging = [t for t in topics if t.classification == "emerging"]
    major = [t for t in topics if t.classification == "major"]
    
    # Sort rapid by growth rate, others by volume
    rapid.sort(key=lambda x: x.growth_rate, reverse=True)
    emerging.sort(key=lambda x: x.growth_rate, reverse=True)
    major.sort(key=lambda x: x.volume, reverse=True)
    
    return {
        "rapidly_growing": [{"id": t.id, "name": t.name, "growth": t.growth_rate, "volume": t.volume, "keywords": t.keywords} for t in rapid],
        "emerging": [{"id": t.id, "name": t.name, "growth": t.growth_rate, "volume": t.volume, "keywords": t.keywords} for t in emerging],
        "major": [{"id": t.id, "name": t.name, "growth": t.growth_rate, "volume": t.volume, "keywords": t.keywords} for t in major]
    }
