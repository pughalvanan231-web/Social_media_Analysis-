from sqlalchemy.orm import Session
from app.models.social import EmergingIssue, Alert, IntelligenceSignal, IssueEvidence, SocialPost
import os

def generate_alerts(db: Session):
    """
    Scans for emerging issues and creates detailed explainable Alerts based on actual signals.
    """
    # Fetch issues that are HIGH SIGNAL or EMERGING and don't have an alert yet
    # For Phase 4, let's say we alert on anything >= 40 confidence (EMERGING or higher)
    issues = (
        db.query(EmergingIssue)
        .filter(EmergingIssue.confidence >= 40)
        .all()
    )
    
    new_alerts = 0
    for issue in issues:
        existing_alert = db.query(Alert).filter(Alert.issue_id == issue.id).first()
        if existing_alert:
            continue
            
        severity = "HIGH" if issue.confidence >= 70 else "MEDIUM"
        
        # Gather signals
        signals = db.query(IntelligenceSignal).filter(IntelligenceSignal.issue_id == issue.id).all()
        
        # Build explanation text
        # Format:
        # EMERGING ISSUE DETECTED
        # [Title]
        # Evidence:
        # ✓ [Explanation]
        
        title_text = issue.title if issue.title else "Unknown Issue"
        explanation = f"EMERGING ISSUE DETECTED\n\n{title_text}\n\nEvidence:\n"
        
        for sig in signals:
            explanation += f"✓ {sig.explanation}\n"
            
        # Add basic evidence counts
        evidence_count = db.query(IssueEvidence).filter(IssueEvidence.issue_id == issue.id).count()
        if evidence_count > 0:
            explanation += f"✓ {evidence_count} representative posts linked\n"
            
        alert = Alert(
            issue_id=issue.id,
            title=title_text,
            explanation=explanation,
            score=issue.confidence,
            severity=severity,
            status="NEW",
            reason="Confidence threshold crossed"
        )
        db.add(alert)
        new_alerts += 1
        
    db.commit()
    return {"new_alerts_generated": new_alerts}
