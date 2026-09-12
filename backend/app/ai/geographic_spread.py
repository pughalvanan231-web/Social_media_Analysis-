from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.social import SocialPost, Location, EmergingIssue, post_topic
from datetime import datetime

def analyze_issue_geography(issue_id: int, db: Session):
    """
    Safely analyzes the geographic spread of an emerging issue based only
    on locations explicitly provided in the data source.
    Returns aggregated region data without PII or exact user locations.
    """
    
    # Get the issue to find the associated topic
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue:
        return {"available": False, "message": "Issue not found."}
        
    topic_id = issue.topic_id
    
    # Query posts associated with this topic that have valid location data
    # We join SocialPost -> Location, and filter by topic
    query = (
        db.query(SocialPost, Location)
        .join(Location, SocialPost.location_id == Location.id)
        .join(post_topic, SocialPost.id == post_topic.c.post_id)
        .filter(post_topic.c.topic_id == topic_id)
        .filter(Location.latitude.isnot(None))
        .filter(Location.longitude.isnot(None))
    )
    
    records = query.all()
    
    if not records:
        return {"available": False, "message": "Geographic data unavailable for this source."}
        
    # Process results safely
    region_stats = {}
    timeline = {}
    first_observed = None
    first_region = None
    
    for post, loc in records:
        # Define region at a safe level (e.g. City/Country)
        region_name = loc.name or "Unknown Region"
        
        # Track intensity/volume per region
        if region_name not in region_stats:
            region_stats[region_name] = {
                "name": region_name,
                "country": loc.country,
                "lat": loc.latitude,
                "lng": loc.longitude,
                "count": 0
            }
        region_stats[region_name]["count"] += 1
        
        # Track first observed
        if not first_observed or post.created_at < first_observed:
            first_observed = post.created_at
            first_region = region_name
            
        # Spread timeline (group by date)
        if post.created_at:
            date_str = post.created_at.strftime('%Y-%m-%d')
            if date_str not in timeline:
                timeline[date_str] = {}
            if region_name not in timeline[date_str]:
                timeline[date_str][region_name] = 0
            timeline[date_str][region_name] += 1
            
    # Format timeline for frontend
    formatted_timeline = []
    for d, regions in sorted(timeline.items()):
        formatted_timeline.append({
            "date": d,
            "regions": regions,
            "total": sum(regions.values())
        })
        
    # Format regions for map
    regions_list = list(region_stats.values())
    
    return {
        "available": True,
        "summary": {
            "total_regions": len(regions_list),
            "first_observed_region": first_region,
            "first_observed_date": first_observed.isoformat() if first_observed else None
        },
        "regions": regions_list,
        "timeline": formatted_timeline
    }
