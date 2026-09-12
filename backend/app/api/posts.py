from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.connection import get_db
from app.models.social import SocialPost, EngagementMetrics, Hashtag
from app.schemas.social import SocialPostCreate, SocialPostResponse

router = APIRouter(prefix="/api/posts", tags=["Posts"])

@router.post("", response_model=SocialPostResponse)
def create_post(post_data: SocialPostCreate, db: Session = Depends(get_db)):
    # Check if exists
    existing = db.query(SocialPost).filter(SocialPost.source_post_id == post_data.source_post_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Post already exists")
    
    # Process hashtags
    db_hashtags = []
    for tag_name in post_data.hashtags:
        tag = db.query(Hashtag).filter(Hashtag.tag == tag_name).first()
        if not tag:
            tag = Hashtag(tag=tag_name)
            db.add(tag)
        db_hashtags.append(tag)
        
    db_post = SocialPost(
        platform=post_data.platform,
        source_post_id=post_data.source_post_id,
        text=post_data.text,
        created_at=post_data.created_at,
        language=post_data.language,
        url=str(post_data.url) if post_data.url else None,
        hashtags=db_hashtags
    )
    db.add(db_post)
    db.flush() # get id
    
    # Add engagement
    eng = EngagementMetrics(
        post_id=db_post.id,
        likes=post_data.likes,
        comments=post_data.comments,
        shares=post_data.shares,
        views=post_data.views,
        engagement_total=post_data.likes + post_data.comments + post_data.shares
    )
    db.add(eng)
    db.commit()
    db.refresh(db_post)
    
    # Map back to response model format
    return {
        "id": db_post.id,
        "platform": db_post.platform,
        "source_post_id": db_post.source_post_id,
        "text": db_post.text,
        "created_at": db_post.created_at,
        "language": db_post.language,
        "likes": db_post.engagement.likes if db_post.engagement else 0,
        "comments": db_post.engagement.comments if db_post.engagement else 0,
        "shares": db_post.engagement.shares if db_post.engagement else 0,
        "views": db_post.engagement.views if db_post.engagement else None,
        "hashtags": [h.tag for h in db_post.hashtags]
    }

@router.get("", response_model=List[SocialPostResponse])
def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    platform: Optional[str] = None,
    keyword: Optional[str] = None,
    language: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SocialPost)
    
    if platform:
        query = query.filter(SocialPost.platform == platform)
    if language:
        query = query.filter(SocialPost.language == language)
    if keyword:
        query = query.filter(SocialPost.text.ilike(f"%{keyword}%"))
    if start_date:
        query = query.filter(SocialPost.created_at >= start_date)
    if end_date:
        query = query.filter(SocialPost.created_at <= end_date)
        
    posts = query.order_by(SocialPost.created_at.desc()).offset(skip).limit(limit).all()
    
    results = []
    for p in posts:
        results.append({
            "id": p.id,
            "platform": p.platform,
            "source_post_id": p.source_post_id,
            "text": p.text,
            "created_at": p.created_at,
            "language": p.language,
            "likes": p.engagement.likes if p.engagement else 0,
            "comments": p.engagement.comments if p.engagement else 0,
            "shares": p.engagement.shares if p.engagement else 0,
            "views": p.engagement.views if p.engagement else None,
            "hashtags": [h.tag for h in p.hashtags]
        })
    return results

@router.get("/{post_id}", response_model=SocialPostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    p = db.query(SocialPost).filter(SocialPost.id == post_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
        
    return {
        "id": p.id,
        "platform": p.platform,
        "source_post_id": p.source_post_id,
        "text": p.text,
        "created_at": p.created_at,
        "language": p.language,
        "likes": p.engagement.likes if p.engagement else 0,
        "comments": p.engagement.comments if p.engagement else 0,
        "shares": p.engagement.shares if p.engagement else 0,
        "views": p.engagement.views if p.engagement else None,
        "hashtags": [h.tag for h in p.hashtags]
    }

from app.models.social import PostAnalysis

@router.get("/{post_id}/analysis")
def get_post_analysis(post_id: int, db: Session = Depends(get_db)):
    analysis = db.query(PostAnalysis).filter(PostAnalysis.post_id == post_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return {
        "sentiment": analysis.sentiment,
        "sentiment_score": analysis.sentiment_score,
        "confidence": analysis.confidence
    }
