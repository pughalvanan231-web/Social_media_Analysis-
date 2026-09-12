from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.social import EmergingIssue, AnalystFeedback, AuditLog

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

class FeedbackRequest(BaseModel):
    issue_id: int
    action: str # CONFIRM, REJECT, FALSE_POSITIVE, CHANGE_SEVERITY
    reason: str
    new_severity: str = None # Required if action is CHANGE_SEVERITY

@router.post("")
def submit_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == request.issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    previous_score = issue.signal_score
    new_status = issue.status
    
    if request.action == 'CONFIRM':
        new_status = 'VERIFIED'
        issue.signal_score = min(100, issue.signal_score * 1.1)
    elif request.action == 'REJECT':
        new_status = 'REJECTED'
    elif request.action == 'FALSE_POSITIVE':
        new_status = 'REJECTED'
        issue.signal_score = max(0, issue.signal_score * 0.5)
    elif request.action == 'CHANGE_SEVERITY':
        if request.new_severity:
            issue.signal_level = request.new_severity
            
    issue.status = new_status
    
    feedback = AnalystFeedback(
        issue_id=issue.id,
        analyst_action=request.action,
        previous_score=previous_score,
        new_status=new_status,
        reason=request.reason
    )
    db.add(feedback)
    
    audit = AuditLog(
        action=f"FEEDBACK_{request.action}",
        target_type="Issue",
        target_id=issue.id,
        actor="Analyst"
    )
    db.add(audit)
    
    db.commit()
    return {"status": "success", "message": "Feedback recorded."}

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total_issues = db.query(EmergingIssue).count()
    verified_issues = db.query(EmergingIssue).filter(EmergingIssue.status == 'VERIFIED').count()
    false_positives = db.query(AnalystFeedback).filter(AnalystFeedback.analyst_action == 'FALSE_POSITIVE').count()
    
    total_feedbacks = db.query(AnalystFeedback).count()
    
    verification_rate = (verified_issues / total_issues * 100) if total_issues > 0 else 0
    
    # Alert Precision: (Verified / (Verified + False Positives))
    precision = 0
    if (verified_issues + false_positives) > 0:
        precision = (verified_issues / (verified_issues + false_positives)) * 100
        
    recent_feedback = db.query(AnalystFeedback).order_by(AnalystFeedback.created_at.desc()).limit(10).all()
    
    return {
        "total_signals": total_issues,
        "verified_signals": verified_issues,
        "false_positives": false_positives,
        "verification_rate": verification_rate,
        "alert_precision": precision,
        "total_feedbacks": total_feedbacks,
        "recent_feedback": [
            {
                "id": f.id,
                "issue_id": f.issue_id,
                "action": f.analyst_action,
                "reason": f.reason,
                "timestamp": f.created_at.isoformat() if f.created_at else None
            } for f in recent_feedback
        ]
    }
