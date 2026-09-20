from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db, SessionLocal
from app.models.social import EmergingIssue

router = APIRouter(prefix="/api/issues", tags=["Issues"])

def run_issues_job():
    db = SessionLocal()
    try:
        from app.intelligence.emerging_issues import detect_issues
        detect_issues(db)
        from app.ai.alerts import generate_alerts
        generate_alerts(db)
    finally:
        db.close()

@router.post("/run")
def trigger_issues_engine(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_issues_job)
    return {"status": "accepted", "message": "Emerging issues detection started."}

@router.get("")
def get_issues(db: Session = Depends(get_db)):
    """
    Returns ranked emerging issues.
    """
    issues = db.query(EmergingIssue).order_by(EmergingIssue.confidence.desc()).all()
    
    return [
        {
            "id": i.id,
            "title": i.title,
            "description": i.description,
            "confidence": i.confidence,
            "anomaly_score": i.anomaly_score,
            "status": i.status,
            "timestamp": i.created_at.isoformat() if i.created_at else None
        } for i in issues
    ]

@router.get("/{issue_id}")
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    return {
        "id": issue.id,
        "title": issue.title,
        "description": issue.description,
        "confidence": issue.confidence,
        "anomaly_score": issue.anomaly_score,
        "sentiment_score": issue.sentiment_score,
        "status": issue.status,
        "activity_change_percent": issue.activity_change_percent,
        "timestamp": issue.created_at.isoformat() if issue.created_at else None
    }

@router.get("/{issue_id}/explanation")
def get_issue_explanation(issue_id: int, db: Session = Depends(get_db)):
    from app.ai.explainability import generate_issue_explanation
    explanation = generate_issue_explanation(issue_id, db)
    if "error" in explanation:
        raise HTTPException(status_code=404, detail=explanation["error"])
    return explanation

@router.get("/{issue_id}/correlation")
def get_issue_correlation(issue_id: int, db: Session = Depends(get_db)):
    from app.ai.cross_platform import correlate_issue
    correlation = correlate_issue(issue_id, db)
    if "error" in correlation:
        raise HTTPException(status_code=404, detail=correlation["error"])
    return correlation

@router.get("/{issue_id}/evidence")
def get_issue_evidence(issue_id: int, db: Session = Depends(get_db)):
    """
    Returns the top posts acting as evidence for this issue.
    """
    from app.models.social import IssueEvidence, SocialPost
    
    evidence_records = (
        db.query(IssueEvidence, SocialPost)
        .join(SocialPost, IssueEvidence.post_id == SocialPost.id)
        .filter(IssueEvidence.issue_id == issue_id)
        .order_by(IssueEvidence.relevance_score.desc())
        .limit(10)
        .all()
    )
    
    if not evidence_records:
        return []
        
    results = []
    for ev, post in evidence_records:
        results.append({
            "evidence_id": ev.id,
            "relevance_score": ev.relevance_score,
            "reason": ev.reason,
            "post_id": post.id,
            "platform": post.platform,
            "text": post.text,
            "sentiment": post.sentiment,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "url": post.url
        })
        
    return results

@router.get("/{issue_id}/signals")
def get_issue_signals(issue_id: int, db: Session = Depends(get_db)):
    """
    Returns the individual intelligence signals for an issue.
    """
    from app.models.social import IntelligenceSignal
    signals = db.query(IntelligenceSignal).filter(IntelligenceSignal.issue_id == issue_id).all()
    return [
        {
            "id": s.id,
            "signal_type": s.signal_type,
            "value": s.value,
            "explanation": s.explanation,
            "timestamp": s.timestamp.isoformat() if s.timestamp else None
        } for s in signals
    ]

@router.get("/{issue_id}/timeline")
def get_issue_timeline(issue_id: int, db: Session = Depends(get_db)):
    """
    Returns the timeline (TrendSnapshot data) for the issue's underlying topic.
    For simplicity, if we don't have topic_id directly on issue, we can just query snapshots.
    We'll return mockable data if none exists, or fetch actual snapshots if we link it.
    """
    # Since we removed topic_id in Phase 1, we might need to find topics via evidence posts.
    from app.models.social import IssueEvidence, SocialPost, post_topic, TrendSnapshot
    
    # 1. Find a topic linked to this issue via evidence
    topic_id_row = (
        db.query(post_topic.c.topic_id)
        .join(SocialPost, SocialPost.id == post_topic.c.post_id)
        .join(IssueEvidence, IssueEvidence.post_id == SocialPost.id)
        .filter(IssueEvidence.issue_id == issue_id)
        .first()
    )
    
    if not topic_id_row:
        return []
        
    topic_id = topic_id_row[0]
    
    snapshots = (
        db.query(TrendSnapshot)
        .filter(TrendSnapshot.topic_id == topic_id)
        .order_by(TrendSnapshot.timestamp.asc())
        .all()
    )
    
    return [
        {
            "timestamp": s.timestamp.isoformat() if s.timestamp else None,
            "volume": s.volume,
            "sentiment": s.avg_sentiment,
            "engagement": s.total_engagement
        } for s in snapshots
    ]
