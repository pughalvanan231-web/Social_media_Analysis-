import os
import requests
from datetime import datetime
from app.schemas.social import SocialPostCreate

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

def search_youtube_videos(keyword: str, limit: int = 10) -> list:
    """
    Search YouTube videos using the official YouTube Data API v3.
    """
    if not YOUTUBE_API_KEY:
        raise ValueError("YOUTUBE_API_KEY is missing from environment variables.")

    # 1. Search for videos by keyword
    search_endpoint = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
        "part": "snippet",
        "q": keyword,
        "type": "video",
        "maxResults": limit,
        "key": YOUTUBE_API_KEY
    }
    
    try:
        search_response = requests.get(search_endpoint, params=search_params, timeout=10)
        search_response.raise_for_status()
        search_data = search_response.json()
    except requests.RequestException as e:
        print(f"Error calling YouTube Search API: {e}")
        return []

    items = search_data.get("items", [])
    if not items:
        return []

    video_ids = [item["id"]["videoId"] for item in items if "videoId" in item["id"]]
    if not video_ids:
        return []

    # 2. Get video statistics (views, likes, comments)
    videos_endpoint = "https://www.googleapis.com/youtube/v3/videos"
    videos_params = {
        "part": "snippet,statistics",
        "id": ",".join(video_ids),
        "key": YOUTUBE_API_KEY
    }

    try:
        videos_response = requests.get(videos_endpoint, params=videos_params, timeout=10)
        videos_response.raise_for_status()
        videos_data = videos_response.json()
    except requests.RequestException as e:
        print(f"Error calling YouTube Videos API: {e}")
        return []

    saved_posts = []
    
    for item in videos_data.get("items", []):
        video_id = item["id"]
        
        
        snippet = item.get("snippet", {})
        statistics = item.get("statistics", {})
        
        title = snippet.get("title", "")
        description = snippet.get("description", "")
        text = f"{title}\n\n{description}"
        
        # Parse timestamp safely
        published_at_str = snippet.get("publishedAt")
        try:
            if published_at_str:
                published_at_str = published_at_str.replace("Z", "+00:00")
                created_at = datetime.fromisoformat(published_at_str)
            else:
                created_at = datetime.utcnow()
        except ValueError:
            created_at = datetime.utcnow()

        # Engagement
        views = int(statistics.get("viewCount", 0))
        likes = int(statistics.get("likeCount", 0))
        comments = int(statistics.get("commentCount", 0))
        shares = 0  # YouTube API doesn't provide share count publicly in this endpoint
        
        channel_name = snippet.get("channelTitle", "")
        url = f"https://www.youtube.com/watch?v={video_id}"
        
        post_create = SocialPostCreate(
            platform="youtube",
            source_post_id=video_id,
            text=text,
            created_at=created_at,
            language=snippet.get("defaultLanguage", "en"),
            url=url,
            likes=likes,
            comments=comments,
            shares=shares,
            views=views,
            author_username=channel_name,
            hashtags=[]
        )
        
        saved_posts.append(post_create)

    return saved_posts
