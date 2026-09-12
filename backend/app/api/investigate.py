from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.connection import get_db
from app.models.social import EmergingIssue, SocialPost, AnalystNote, AuditLog, post_topic
from pydantic import BaseModel

router = APIRouter(prefix="/api/investigate", tags=["Investigate"])

class NoteCreate(BaseModel):
    text: str

@router.get("/{issue_id}")
def get_investigation_overview(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    return {
        "id": issue.id,
        "topic_id": issue.topic_id,
        "topic_name": issue.topic.name if issue.topic else "Unknown",
        "keywords": issue.topic.keywords if issue.topic else [],
        "signal_score": issue.signal_score,
        "signal_level": issue.signal_level,
        "contributing_factors": issue.contributing_factors,
        "created_at": issue.created_at.isoformat() if issue.created_at else None
    }

@router.get("/{issue_id}/posts")
def get_issue_posts(
    issue_id: int, 
    platform: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: Session = Depends(get_db)
):
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue or not issue.topic_id:
        return []
        
    query = (
        db.query(SocialPost)
        .join(post_topic, SocialPost.id == post_topic.c.post_id)
        .filter(post_topic.c.topic_id == issue.topic_id)
    )
    
    if platform and platform != "all":
        query = query.filter(SocialPost.platform == platform)
        
    if date_from:
        query = query.filter(SocialPost.created_at >= date_from)
        
    if date_to:
        query = query.filter(SocialPost.created_at <= date_to)
        
    posts = query.order_by(desc(SocialPost.created_at)).limit(100).all()
    
    return [
        {
            "id": p.id,
            "platform": p.platform,
            "text": p.text,
            "author": p.author.username if p.author else "Unknown",
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "engagement": p.engagement.engagement_total if p.engagement else 0
        } for p in posts
    ]

@router.post("/{issue_id}/verify")
def verify_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    # In a real app we might update the Alert status too
    audit = AuditLog(
        action="MARKED_VERIFIED",
        target_type="Issue",
        target_id=issue.id,
        actor="Analyst"
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Issue verified", "status": "success"}

@router.post("/{issue_id}/notes")
def add_analyst_note(issue_id: int, payload: NoteCreate, db: Session = Depends(get_db)):
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    note = AnalystNote(
        issue_id=issue.id,
        note_text=payload.text,
        analyst_id="Analyst"
    )
    db.add(note)
    
    audit = AuditLog(
        action="ADDED_NOTE",
        target_type="Issue",
        target_id=issue.id,
        actor="Analyst"
    )
    db.add(audit)
    
    db.commit()
    return {"message": "Note added successfully"}

@router.get("/{issue_id}/history")
def get_investigation_history(issue_id: int, db: Session = Depends(get_db)):
    notes = db.query(AnalystNote).filter(AnalystNote.issue_id == issue_id).all()
    audits = db.query(AuditLog).filter(AuditLog.target_type == "Issue", AuditLog.target_id == issue_id).all()
    
    history = []
    for n in notes:
        history.append({
            "type": "note",
            "actor": n.analyst_id,
            "content": n.note_text,
            "timestamp": n.created_at
        })
        
    for a in audits:
        if a.action != "ADDED_NOTE": # We already show the notes
            history.append({
                "type": "audit",
                "actor": a.actor,
                "action": a.action,
                "timestamp": a.timestamp
            })
            
    history.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Convert timestamps to strings for JSON
    for h in history:
        h["timestamp"] = h["timestamp"].isoformat() if h["timestamp"] else None
        
    return history
