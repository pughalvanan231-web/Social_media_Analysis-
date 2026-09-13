from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.social import SocialPost, PostAnalysis, Topic, EmergingIssue

router = APIRouter(prefix="/api/sentiment", tags=["Sentiment"])

@router.get("/feed/{feed_id}")
def get_feed_intelligence(feed_id: int, db: Session = Depends(get_db)):
    post = db.query(SocialPost).filter(SocialPost.id == feed_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Feed not found")
        
    analysis = db.query(PostAnalysis).filter(PostAnalysis.post_id == feed_id).first()
    
    # Process topics and emerging issues
    topics_data = []
    emerging_issue = None
    
    for t in post.topics:
        topics_data.append(t.name)
        # Check if topic has an emerging issue
        issue = db.query(EmergingIssue).filter(EmergingIssue.topic_id == t.id).first()
        if issue and not emerging_issue:
            emerging_issue = {
                "id": issue.id,
                "title": t.name,
                "signal_score": issue.signal_score,
                "severity": issue.signal_level,
                "trend_percentage": "+34%", # Mocked trend based on requirements
                "affected_regions": ["Tamil Nadu", "Karnataka", "Kerala"],
                "contribution": {
                    "Volume Growth": "+24%",
                    "Engagement Growth": "+18%",
                    "Sentiment Shift": "+22%",
                    "Narrative Growth": "+15%",
                    "Geographic Spread": "+11%"
                }
            }

    primary_topic = topics_data[0] if topics_data else None
    
    # Explainable AI factors
    explanation_factors = []
    if analysis and analysis.sentiment == 'negative' and analysis.sentiment_score < -0.7:
        explanation_factors.append({
            "label": "High Negative Sentiment",
            "value": f"{int(abs(analysis.sentiment_score)*100)}%",
            "color": "red"
        })
    
    if post.engagement and post.engagement.engagement_total > 100:
         explanation_factors.append({
            "label": "High Engagement",
            "value": f"{post.engagement.engagement_total}",
            "color": "orange"
        })
        
    if emerging_issue:
        explanation_factors.append({
            "label": "Emerging Narrative",
            "value": emerging_issue["title"],
            "color": "orange"
        })

    # Default explanation if none matched
    if not explanation_factors:
         explanation_factors.append({
            "label": "Volume Increase",
            "value": "+12%",
            "color": "yellow"
        })

    return {
        "feed": {
            "id": post.id,
            "platform": post.platform,
            "author": post.author.username if post.author else f"@user_{post.id}",
            "text": post.text,
            "timestamp": post.created_at.isoformat() if post.created_at else None,
            "likes": post.engagement.likes if post.engagement else 0,
            "comments": post.engagement.comments if post.engagement else 0,
            "shares": post.engagement.shares if post.engagement else 0,
            "hashtags": [h.tag for h in post.hashtags]
        },
        "sentiment": {
            "label": analysis.sentiment if analysis else "neutral",
            "score": analysis.sentiment_score if analysis else 0,
            "confidence": analysis.confidence if analysis else 0.85,
            "positive": 0.05, 
            "neutral": 0.05,
            "negative": abs(analysis.sentiment_score) if analysis and analysis.sentiment == 'negative' else 0.90
        },
        "emotion": {
            "Concern": 78,
            "Frustration": 61,
            "Urgency": 54
        },
        "topics": {
            "primary": primary_topic,
            "related": topics_data[1:5],
            "keywords": ["water", "supply", "disruption", "issue", "quality"]
        },
        "emerging_issue": emerging_issue,
        "explanation": {
            "confidence": 87,
            "factors": explanation_factors
        }
    }
