from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.ai.geographic_spread import analyze_issue_geography

router = APIRouter(prefix="/api/geo", tags=["Geography"])

@router.get("/issues/{issue_id}")
def get_issue_geography(issue_id: int, db: Session = Depends(get_db)):
    """
    Returns the geographic spread analysis for an emerging issue.
    Safe levels only (no PII).
    """
    return analyze_issue_geography(issue_id, db)
