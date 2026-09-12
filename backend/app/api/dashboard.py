from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.social import EmergingIssue, Alert, Topic, SocialPost

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns global Key Performance Indicators for the main intelligence dashboard.
    """
    
    # 1. Total Emerging Issues (Active Signals)
    total_issues = db.query(func.count(EmergingIssue.id)).scalar() or 0
    
    # 2. Critical Alerts (Open alerts with CRITICAL severity)
    critical_alerts = db.query(func.count(Alert.id)).filter(
        Alert.severity == "CRITICAL",
        Alert.status.in_(["NEW", "REVIEWING", "VERIFIED"])
    ).scalar() or 0
    
    # 3. Trending Topics (Topics with positive growth rate)
    trending_topics = db.query(func.count(Topic.id)).filter(
        Topic.growth_rate > 0
    ).scalar() or 0
    
    # 4. Total Posts Analyzed
    posts_analyzed = db.query(func.count(SocialPost.id)).scalar() or 0
    
    # 5. Platforms Monitored
    # Get distinct platforms from SocialPost
    platforms = db.query(func.count(func.distinct(SocialPost.platform))).scalar() or 0

    return {
        "active_signals": total_issues,
        "critical_alerts": critical_alerts,
        "emerging_issues": total_issues,
        "trending_topics": trending_topics,
        "posts_analyzed": posts_analyzed,
        "platforms": platforms
    }
