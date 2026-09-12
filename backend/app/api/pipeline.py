from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.data_pipeline import run_pipeline
from app.models.social import PipelineRun
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline"])

class PipelineRunRequest(BaseModel):
    keyword: str
    sources: List[str]

@router.post("/run")
def trigger_pipeline(request: PipelineRunRequest, db: Session = Depends(get_db)):
    if not request.keyword:
        raise HTTPException(status_code=400, detail="Keyword is required")
    if not request.sources:
        raise HTTPException(status_code=400, detail="At least one source is required")
        
    allowed_sources = {"bluesky", "youtube", "x", "reddit"}
    
    # Expand "all" if requested, or filter requested sources
    if "all" in request.sources:
        sources_to_run = list(allowed_sources)
    else:
        sources_to_run = [s for s in request.sources if s in allowed_sources]
        
    if not sources_to_run:
        raise HTTPException(status_code=400, detail="No valid sources requested")

    try:
        result = run_pipeline(keyword=request.keyword, sources=sources_to_run, db=db)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def get_pipeline_status(db: Session = Depends(get_db), limit: int = 50):
    runs = db.query(PipelineRun).order_by(PipelineRun.run_at.desc()).limit(limit).all()
    
    # Return serializable dicts
    return [
        {
            "id": run.id,
            "source": run.source,
            "records_fetched": run.records_fetched,
            "records_inserted": run.records_inserted,
            "duplicates_removed": run.duplicates_removed,
            "errors": run.errors,
            "status": run.status,
            "run_at": run.run_at
        }
        for run in runs
    ]
