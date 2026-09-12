import os
from sqlalchemy.orm import Session
from app.models.social import EmergingIssue, Alert

def generate_alerts(db: Session):
    """
    Scans for emerging issues that cross the alert thresholds
    and creates new Alerts if one doesn't exist yet for the issue.
    """
    high_threshold = float(os.getenv("ALERT_THRESHOLD_HIGH", "80"))
    critical_threshold = float(os.getenv("ALERT_THRESHOLD_CRITICAL", "90"))
    
    # We only want issues that exceed the HIGH threshold minimum
    issues = db.query(EmergingIssue).filter(EmergingIssue.signal_score >= high_threshold).all()
    
    new_alerts = 0
    for issue in issues:
        # Check if an alert already exists for this exact issue record
        existing_alert = db.query(Alert).filter(Alert.issue_id == issue.id).first()
        if existing_alert:
            # We already alerted on this issue. (If scores were dynamic, we might update, but issues are snapshots here)
            continue
            
        severity = "HIGH"
        if issue.signal_score >= critical_threshold:
            severity = "CRITICAL"
            
        reason = f"Signal score reached {issue.signal_score}. Key factors: {', '.join(issue.contributing_factors[:2]) if issue.contributing_factors else 'N/A'}"
        
        # We can pull supporting metrics directly from the explanation layer or just store basic context
        from app.ai.explainability import generate_issue_explanation
        explanation = generate_issue_explanation(issue.id, db)
        
        supporting_metrics = {
            "volume_change": explanation.get("volume_change", "N/A"),
            "engagement_change": explanation.get("engagement_change", "N/A"),
            "sentiment_change": explanation.get("sentiment_change", "N/A"),
            "geographic_spread": explanation.get("geographic_spread", "N/A"),
            "topic_name": issue.topic.name if issue.topic else "Unknown"
        }
        
        alert = Alert(
            issue_id=issue.id,
            score=issue.signal_score,
            severity=severity,
            reason=reason,
            supporting_metrics=supporting_metrics,
            status="NEW"
        )
        db.add(alert)
        new_alerts += 1
        
    db.commit()
    return {"new_alerts_generated": new_alerts}
