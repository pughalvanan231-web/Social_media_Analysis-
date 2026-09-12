import os
import requests
from datetime import datetime
from app.schemas.social import SocialPostCreate

X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN", "")

class XApiNotConfiguredError(Exception):
    pass

def search_x_posts(query: str, limit: int = 10) -> list:
    """
    Search X (Twitter) posts using the official API v2.
    """
    if not X_BEARER_TOKEN:
        raise XApiNotConfiguredError("X API access is not configured")

    endpoint = "https://api.twitter.com/2/tweets/search/recent"
    
    headers = {
        "Authorization": f"Bearer {X_BEARER_TOKEN}"
    }
    
    params = {
        "query": query,
        "max_results": limit,
        "tweet.fields": "created_at,public_metrics,entities",
        "expansions": "author_id",
        "user.fields": "username"
    }
    
    try:
        response = requests.get(endpoint, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        print(f"Error calling X API: {e}")
        return []

    tweets = data.get("data", [])
    includes = data.get("includes", {})
    users = {u["id"]: u["username"] for u in includes.get("users", [])}
    
    saved_posts = []

    for tweet in tweets:
        source_id = tweet["id"]
        
        
        text = tweet.get("text", "")
        author_id = tweet.get("author_id")
        author_username = users.get(author_id, "")
        
        # Parse timestamp safely
        created_at_str = tweet.get("created_at")
        try:
            if created_at_str:
                created_at_str = created_at_str.replace("Z", "+00:00")
                created_at = datetime.fromisoformat(created_at_str)
            else:
                created_at = datetime.utcnow()
        except ValueError:
            created_at = datetime.utcnow()

        metrics = tweet.get("public_metrics", {})
        likes = int(metrics.get("like_count", 0))
        comments = int(metrics.get("reply_count", 0))
        shares = int(metrics.get("retweet_count", 0)) + int(metrics.get("quote_count", 0))
        views = int(metrics.get("impression_count", 0))
        
        entities = tweet.get("entities", {})
        hashtags = [h.get("tag") for h in entities.get("hashtags", [])]
        
        url = f"https://x.com/{author_username}/status/{source_id}" if author_username else f"https://x.com/i/web/status/{source_id}"
        
        post_create = SocialPostCreate(
            platform="x",
            source_post_id=source_id,
            text=text,
            created_at=created_at,
            language=tweet.get("lang"),
            url=url,
            likes=likes,
            comments=comments,
            shares=shares,
            views=views,
            author_username=author_username,
            hashtags=hashtags
        )
        
        saved_posts.append(post_create)

    return saved_posts
