import os
import requests
from datetime import datetime
from app.schemas.social import SocialPostCreate

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "script:gossip_protocol:v0.1.0")

class RedditApiNotConfiguredError(Exception):
    pass

def get_reddit_access_token() -> str:
    if not REDDIT_CLIENT_ID or not REDDIT_CLIENT_SECRET:
        raise RedditApiNotConfiguredError("Reddit API access is not configured")
        
    auth = requests.auth.HTTPBasicAuth(REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET)
    data = {'grant_type': 'client_credentials'}
    headers = {'User-Agent': REDDIT_USER_AGENT}
    
    res = requests.post('https://www.reddit.com/api/v1/access_token', auth=auth, data=data, headers=headers, timeout=10)
    res.raise_for_status()
    return res.json()['access_token']

def search_reddit_posts(query: str, limit: int = 10, subreddit: str = None) -> list:
    """
    Search Reddit using the official Data API via OAuth.
    """
    try:
        token = get_reddit_access_token()
    except RedditApiNotConfiguredError:
        raise
    except requests.RequestException as e:
        print(f"Error obtaining Reddit access token: {e}")
        return []

    headers = {
        "Authorization": f"bearer {token}",
        "User-Agent": REDDIT_USER_AGENT
    }
    
    if subreddit:
        endpoint = f"https://oauth.reddit.com/r/{subreddit}/search.json"
        params = {"q": query, "restrict_sr": "on", "limit": limit}
    else:
        endpoint = "https://oauth.reddit.com/search.json"
        params = {"q": query, "limit": limit}

    try:
        response = requests.get(endpoint, headers=headers, params=params, timeout=10)
        # Handle specific Reddit rate limit headers if needed (x-ratelimit-remaining)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        print(f"Error calling Reddit API: {e}")
        return []

    children = data.get("data", {}).get("children", [])
    saved_posts = []

    for child in children:
        post_data = child.get("data", {})
        source_id = post_data.get("id")
        
        if not source_id:
            continue
            
        
        text = f"{post_data.get('title', '')}\n\n{post_data.get('selftext', '')}"
        
        # Parse timestamp
        created_utc = post_data.get("created_utc")
        if created_utc:
            created_at = datetime.fromtimestamp(created_utc)
        else:
            created_at = datetime.utcnow()

        likes = int(post_data.get("ups", 0))
        comments = int(post_data.get("num_comments", 0))
        shares = 0
        views = 0 # Reddit doesn't provide public views reliably via search
        
        author_username = post_data.get("author", "unknown")
        url = f"https://www.reddit.com{post_data.get('permalink', '')}"
        sub = post_data.get("subreddit", "")
        
        post_create = SocialPostCreate(
            platform="reddit",
            source_post_id=source_id,
            text=text.strip(),
            created_at=created_at,
            language=None, # Reddit doesn't strictly provide language code in standard search
            url=url,
            likes=likes,
            comments=comments,
            shares=shares,
            views=views,
            author_username=author_username,
            hashtags=[sub] if sub else [] # use subreddit as hashtag
        )
        
        saved_posts.append(post_create)

    return saved_posts
