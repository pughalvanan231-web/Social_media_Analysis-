from sqlalchemy.orm import Session
from app.models.social import Topic, TrendSnapshot, Anomaly
import math
from datetime import datetime

def detect_anomalies(db: Session):
    """
    Analyzes TrendSnapshots to find statistically significant deviations (Z-score > 2.0).
    """
    topics = db.query(Topic).all()
    
    for topic in topics:
        snapshots = db.query(TrendSnapshot).filter(TrendSnapshot.topic_id == topic.id).order_by(TrendSnapshot.timestamp.asc()).all()
        
        if len(snapshots) < 3:
            continue # Need at least 3 data points for a meaningful std dev
            
        # We evaluate the latest snapshot against the history of previous snapshots
        history = snapshots[:-1]
        latest = snapshots[-1]
        
        # --- Volume Anomaly Detection ---
        history_volumes = [s.volume for s in history]
        mean_vol = sum(history_volumes) / len(history_volumes)
        
        variance_vol = sum((x - mean_vol) ** 2 for x in history_volumes) / len(history_volumes)
        std_vol = math.sqrt(variance_vol)
        
        if std_vol > 0:
            z_score_vol = (latest.volume - mean_vol) / std_vol
            if z_score_vol > 2.0: # 2 standard deviations is a typical statistical threshold for an anomaly
                _record_anomaly(db, topic.id, "volume_spike", mean_vol, latest.volume, z_score_vol, latest.timestamp)
                
        # --- Sentiment Shift Detection ---
        history_sent = [s.avg_sentiment for s in history]
        mean_sent = sum(history_sent) / len(history_sent)
        
        variance_sent = sum((x - mean_sent) ** 2 for x in history_sent) / len(history_sent)
        std_sent = math.sqrt(variance_sent)
        
        if std_sent > 0:
            z_score_sent = abs((latest.avg_sentiment - mean_sent) / std_sent)
            if z_score_sent > 2.0:
                _record_anomaly(db, topic.id, "sentiment_shift", mean_sent, latest.avg_sentiment, z_score_sent, latest.timestamp)

    db.commit()

def _record_anomaly(db, topic_id, anomaly_type, expected, actual, z_score, timestamp):
    # Avoid duplicate anomaly recordings for the exact same minute
    existing = db.query(Anomaly).filter(
        Anomaly.topic_id == topic_id,
        Anomaly.anomaly_type == anomaly_type,
        Anomaly.timestamp == timestamp
    ).first()
    
    if not existing:
        anomaly = Anomaly(
            topic_id=topic_id,
            anomaly_type=anomaly_type,
            expected_value=round(expected, 2),
            actual_value=round(actual, 2),
            z_score=round(z_score, 2),
            timestamp=timestamp
        )
        db.add(anomaly)
