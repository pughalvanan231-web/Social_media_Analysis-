import os
import requests
from datetime import datetime
from app.schemas.social import SocialPostCreate

BLUESKY_API_URL = os.getenv("BLUESKY_API_URL", "https://public.api.bsky.app/xrpc")

def search_bluesky_posts(keyword: str, limit: int = 20) -> list:
    """
    Search public Bluesky posts using the official AT Protocol public API.
    """
    endpoint = f"{BLUESKY_API_URL}/app.bsky.feed.searchPosts"
    
    params = {
        "q": keyword,
        "limit": limit
    }
    
    try:
        response = requests.get(endpoint, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        print(f"Error calling Bluesky API: {e}")
        return []

    posts_data = data.get("posts", [])
    saved_posts = []

    for item in posts_data:
        source_id = item.get("uri")
        if not source_id:
            continue
            
        record = item.get("record", {})
        text = record.get("text", "")
        
        # Parse timestamp safely
        created_at_str = record.get("createdAt")
        try:
            # Handle ISO format with Z
            if created_at_str:
                created_at_str = created_at_str.replace("Z", "+00:00")
                created_at = datetime.fromisoformat(created_at_str)
            else:
                created_at = datetime.utcnow()
        except ValueError:
            created_at = datetime.utcnow()

        # Engagement
        likes = item.get("likeCount", 0)
        comments = item.get("replyCount", 0)
        shares = item.get("repostCount", 0)
        
        author = item.get("author", {})
        author_username = author.get("handle")
        
        # Extract hashtags from facets or just use simple regex? 
        # For simplicity, extract from text if # is present, or leave empty.
        hashtags = [word.strip("#") for word in text.split() if word.startswith("#")]
        
        post_create = SocialPostCreate(
            platform="bluesky",
            source_post_id=source_id,
            text=text,
            created_at=created_at,
            language=record.get("langs", ["en"])[0] if record.get("langs") else None,
            likes=likes,
            comments=comments,
            shares=shares,
            author_username=author_username,
            hashtags=hashtags
        )
        
        saved_posts.append(post_create)

    return saved_posts
