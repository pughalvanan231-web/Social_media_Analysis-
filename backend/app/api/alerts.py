from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.connection import get_db
from app.models.social import Alert

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("")
def get_alerts(db: Session = Depends(get_db)):
    """
    Returns all alerts, ordered by severity and time.
    """
    # Simple sort: CRITICAL first, then HIGH, then newer first.
    # In SQLite/Postgres we can sort by severity string, but since CRITICAL < HIGH alphabetically,
    # it naturally sorts CRITICAL before HIGH. (C < H).
    alerts = db.query(Alert).order_by(Alert.severity.asc(), desc(Alert.detected_at)).all()
    
    return [
        {
            "id": a.id,
            "issue_id": a.issue_id,
            "score": a.score,
            "severity": a.severity,
            "detected_at": a.detected_at.isoformat() if a.detected_at else None,
            "reason": a.reason,
            "supporting_metrics": a.supporting_metrics,
            "status": a.status
        } for a in alerts
    ]

@router.patch("/{alert_id}")
def update_alert_status(alert_id: int, status: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Updates the status of an alert (e.g. NEW -> REVIEWING -> VERIFIED/DISMISSED/RESOLVED).
    """
    valid_statuses = {"NEW", "REVIEWING", "VERIFIED", "DISMISSED", "RESOLVED"}
    
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = status
    db.commit()
    
    return {"message": "Status updated successfully", "status": alert.status}
