from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.social import EmergingIssue, IssueEvidence, SocialPost, post_topic, Topic
from app.intelligence.engine import calculate_cross_platform_signal

def correlate_issue(issue_id: int, db: Session) -> dict:
    """
    Analyzes the posts tied to an EmergingIssue to determine its cross-platform presence.
    """
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue:
        return {"error": "Issue not found"}
        
    # Get all posts linked to this issue via IssueEvidence
    posts = (
        db.query(SocialPost)
        .join(IssueEvidence, IssueEvidence.post_id == SocialPost.id)
        .filter(IssueEvidence.issue_id == issue_id)
        .all()
    )
    
    if not posts:
        return {
            "issue_id": issue_id,
            "platforms_detected": [],
            "number_of_posts": 0,
            "unique_sources": 0,
            "time_window": None,
            "related_keywords": [],
            "cross_platform_signal": 0.0
        }
        
    platforms = set()
    authors = set()
    keywords = set()
    min_time = None
    max_time = None
    
    for post in posts:
        if post.platform:
            platforms.add(post.platform.lower())
        
        # Track unique sources. Use author_id if exists, else fallback to something else,
        # but since author_id might be null, we might use author's username if we eagerly loaded it,
        # or we just count unique author_ids. Let's assume Author relation handles this, or we just
        # count unique (platform, author_id/source_post_id).
        source_identifier = str(post.author_id) if post.author_id else post.source_post_id
        authors.add(f"{post.platform}_{source_identifier}")
        
        if post.created_at:
            if min_time is None or post.created_at < min_time:
                min_time = post.created_at
            if max_time is None or post.created_at > max_time:
                max_time = post.created_at
                
        # Extract keywords via linked topics
        for topic in post.topics:
            if topic.keywords:
                for kw in topic.keywords:
                    keywords.add(kw.lower())
                    
    platforms_list = list(platforms)
    signal_score, _ = calculate_cross_platform_signal(len(platforms_list))
    
    return {
        "issue_id": issue_id,
        "platforms_detected": platforms_list,
        "number_of_posts": len(posts),
        "unique_sources": len(authors),
        "time_window": {
            "start": min_time.isoformat() if min_time else None,
            "end": max_time.isoformat() if max_time else None
        },
        "related_keywords": list(keywords)[:20], # limit to top 20
        "cross_platform_signal": signal_score
    }
