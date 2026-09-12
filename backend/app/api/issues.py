from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db, SessionLocal
from app.models.social import EmergingIssue
from app.intelligence.emerging_issues import detect_issues

router = APIRouter(prefix="/api/issues", tags=["Issues"])

def run_issues_job():
    db = SessionLocal()
    try:
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
    issues = db.query(EmergingIssue).order_by(EmergingIssue.signal_score.desc()).all()
    
    return [
        {
            "id": i.id,
            "topic_id": i.topic_id,
            "topic_name": i.topic.name if i.topic else "Unknown",
            "keywords": i.topic.keywords if i.topic else [],
            "signal_score": i.signal_score,
            "signal_level": i.signal_level,
            "contributing_factors": i.contributing_factors,
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
        "topic_id": issue.topic_id,
        "topic_name": issue.topic.name if issue.topic else "Unknown",
        "signal_score": issue.signal_score,
        "signal_level": issue.signal_level,
        "contributing_factors": issue.contributing_factors
    }

@router.get("/{issue_id}/explanation")
def get_issue_explanation(issue_id: int, db: Session = Depends(get_db)):
    from app.ai.explainability import generate_issue_explanation
    explanation = generate_issue_explanation(issue_id, db)
    if "error" in explanation:
        raise HTTPException(status_code=404, detail=explanation["error"])
    return explanation
