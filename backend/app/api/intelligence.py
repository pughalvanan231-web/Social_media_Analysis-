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

@router.get("/top-risk-video")
def get_top_risk_post(db: Session = Depends(get_db)):
    """
    Evaluates the 10 most recent posts across all platforms and returns the one with the highest 'Risk / Emerging Trend' score.
    """
    from sqlalchemy import desc
    from app.models.social import SocialPost, EngagementMetrics
    
    # Get last 15 posts across all platforms to have a good mix
    recent_posts = (
        db.query(SocialPost)
        .order_by(desc(SocialPost.collected_at))
        .limit(15)
        .all()
    )
    
    if not recent_posts:
        raise HTTPException(status_code=404, detail="No posts found")
        
    top_post = None
    max_risk_score = -1
    
    risk_keywords = ["scandal", "leak", "breaking", "urgent", "crisis", "warning", "fake", "viral", "alert", "shocking", "danger", "threat", "protest"]
    
    for post in recent_posts:
        # Base score from engagement
        engagement = post.engagement.engagement_total if post.engagement and post.engagement.engagement_total else (post.engagement.views if post.engagement and post.engagement.views else 0)
        base_score = min(engagement / 10000.0, 50.0) # Lowered the division threshold since Reddit/Bluesky have fewer raw views than YouTube
        
        # Keyword score
        keyword_score = 0
        text_lower = (post.text or "").lower()
        for kw in risk_keywords:
            if kw in text_lower:
                keyword_score += 15 # 15 points per risk keyword
                
        total_score = base_score + keyword_score
        
        if total_score > max_risk_score:
            max_risk_score = total_score
            top_post = post
            
    if not top_post:
        top_post = recent_posts[0]
        max_risk_score = 10
        
    return {
        "id": top_post.id,
        "source_post_id": top_post.source_post_id,
        "platform": top_post.platform,
        "url": top_post.url,
        "text": top_post.text,
        "author": top_post.author.username if top_post.author else "Unknown",
        "risk_score": round(max_risk_score, 1),
        "views": top_post.engagement.views if top_post.engagement and top_post.engagement.views else (top_post.engagement.engagement_total if top_post.engagement else 0),
        "explanation": "High engagement combined with risk-associated keywords detected in the content."
    }
