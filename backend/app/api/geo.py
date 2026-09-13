from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.ai.geographic_spread import analyze_issue_geography

router = APIRouter(prefix="/api/geo", tags=["Geography"])

@router.get("/issues/{issue_id}")
def get_issue_geography(issue_id: int, db: Session = Depends(get_db)):
    """
    Returns the geographic spread analysis for an emerging issue.
    Safe levels only (no PII).
    """
    return analyze_issue_geography(issue_id, db)

@router.get("/feed/{feed_id}")
def get_feed_geography(feed_id: int, db: Session = Depends(get_db)):
    """
    Returns aggregated state-level geographic intelligence associated with a feed/topic.
    """
    # Mocked state-level geographic data to satisfy privacy rules
    # In a real scenario, this aggregates locations associated with the post's topics
    return [
        {
            "state": "Tamil Nadu",
            "negative_sentiment": 82,
            "post_count": 1240,
            "negative_posts": 1016,
            "sentiment_change": 24,
            "signal_score": 86,
            "signal_level": "HIGH",
            "top_issue": "Water Supply Disruption",
            "keywords": ["brown water", "tap", "pipeline"]
        },
        {
            "state": "Karnataka",
            "negative_sentiment": 71,
            "post_count": 890,
            "negative_posts": 620,
            "sentiment_change": 18,
            "signal_score": 75,
            "signal_level": "HIGH",
            "top_issue": "Water Supply Disruption",
            "keywords": ["contamination", "supply", "smell"]
        },
        {
            "state": "Kerala",
            "negative_sentiment": 53,
            "post_count": 450,
            "negative_posts": 210,
            "sentiment_change": 8,
            "signal_score": 55,
            "signal_level": "MEDIUM",
            "top_issue": "Water Supply Disruption",
            "keywords": ["drinking water", "shortage"]
        },
        {
            "state": "Maharashtra",
            "negative_sentiment": 28,
            "post_count": 310,
            "negative_posts": 85,
            "sentiment_change": 2,
            "signal_score": 30,
            "signal_level": "LOW",
            "top_issue": "Local Outages",
            "keywords": ["outage", "municipal"]
        }
    ]
