from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.ai.network import build_social_network, analyze_communities

router = APIRouter(prefix="/api", tags=["Network"])

@router.get("/network")
def get_network(topic_id: int = Query(None, description="Optional topic ID to filter the network"), db: Session = Depends(get_db)):
    """
    Returns the social network graph representation (nodes and links)
    optionally filtered by a specific topic.
    """
    return build_social_network(db, topic_id=topic_id)

@router.get("/communities")
def get_communities(db: Session = Depends(get_db)):
    """
    Returns aggregated stats about communities detected in the network.
    """
    return analyze_communities(db)
