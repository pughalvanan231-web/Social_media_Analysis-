from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.report_generator import generate_issue_report
from datetime import datetime

router = APIRouter(prefix="/api/reports", tags=["Reports"])

class ReportRequest(BaseModel):
    issue_id: int
    format: str = "pdf"

@router.post("")
def generate_report(request: ReportRequest, db: Session = Depends(get_db)):
    """
    Generates an intelligence report for a specific emerging issue.
    Supports PDF format.
    """
    if request.format.lower() != "pdf":
        raise HTTPException(status_code=400, detail="Only PDF format is currently supported.")
        
    pdf_bytes = generate_issue_report(request.issue_id, db)
    
    if not pdf_bytes:
        raise HTTPException(status_code=404, detail=f"Issue with ID {request.issue_id} not found or data missing.")
        
    filename = f"Intelligence_Report_Issue_{request.issue_id}_{datetime.utcnow().strftime('%Y%m%d%H%M')}.pdf"
    
    return Response(
        content=bytes(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
