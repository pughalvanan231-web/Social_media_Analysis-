from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db, SessionLocal
from app.models.social import Topic, TrendSnapshot, Anomaly
from app.ai.trends import compute_topic_trends
from app.ai.anomalies import detect_anomalies

router = APIRouter(prefix="/api", tags=["Trends & Anomalies"])

def run_trend_job():
    db = SessionLocal()
    try:
        compute_topic_trends(db)
        detect_anomalies(db)
    finally:
        db.close()

@router.post("/trends/run")
def trigger_trend_computation(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_trend_job)
    return {"status": "accepted", "message": "Trend calculation and anomaly detection started."}

@router.get("/trends")
def get_trends(topic_id: int = None, db: Session = Depends(get_db)):
    """
    Get time-series trend data for charting.
    Optionally filter by topic.
    """
    query = db.query(TrendSnapshot).order_by(TrendSnapshot.timestamp.asc())
    if topic_id:
        query = query.filter(TrendSnapshot.topic_id == topic_id)
        
    snapshots = query.all()
    
    # Format for Recharts: Group by timestamp
    timeline = {}
    for s in snapshots:
        ts = s.timestamp.isoformat()
        if ts not in timeline:
            timeline[ts] = {"timestamp": ts}
            
        topic_name = s.topic.name if s.topic else f"Topic_{s.topic_id}"
        timeline[ts][f"{topic_name}_volume"] = s.volume
        timeline[ts][f"{topic_name}_sentiment"] = s.avg_sentiment
        
    return list(timeline.values())

@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    """
    Returns statistically justified anomalies.
    """
    anomalies = db.query(Anomaly).order_by(Anomaly.timestamp.desc()).limit(50).all()
    
    return [
        {
            "id": a.id,
            "topic": a.topic.name if a.topic else "Unknown",
            "type": a.anomaly_type,
            "expected_value": a.expected_value,
            "actual_value": a.actual_value,
            "z_score": a.z_score,
            "timestamp": a.timestamp.isoformat(),
            "growth_percentage": round(((a.actual_value - a.expected_value) / max(a.expected_value, 1)) * 100, 1)
        } for a in anomalies
    ]
