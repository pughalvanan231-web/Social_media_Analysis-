from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.connectors.bluesky_connector import search_bluesky_posts

router = APIRouter(prefix="/api/connectors", tags=["Connectors"])

@router.get("/bluesky/search")
def search_bluesky(q: str = Query(..., description="Keyword to search for"), db: Session = Depends(get_db)):
    if not q:
        raise HTTPException(status_code=400, detail="Keyword is required")
        
    try:
        saved_posts = search_bluesky_posts(keyword=q, limit=20)
        return {
            "platform": "bluesky",
            "count": len(saved_posts),
            "posts": saved_posts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.connectors.youtube_connector import search_youtube_videos

@router.get("/youtube/search")
def search_youtube(q: str = Query(..., description="Keyword to search for"), db: Session = Depends(get_db)):
    if not q:
        raise HTTPException(status_code=400, detail="Keyword is required")
        
    try:
        saved_posts = search_youtube_videos(keyword=q, limit=10)
        return {
            "platform": "youtube",
            "count": len(saved_posts),
            "posts": saved_posts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.connectors.x_connector import search_x_posts, XApiNotConfiguredError
from fastapi.responses import JSONResponse

@router.get("/x/search")
def search_x(q: str = Query(..., description="Query to search for"), db: Session = Depends(get_db)):
    if not q:
        raise HTTPException(status_code=400, detail="Query is required")
        
    try:
        saved_posts = search_x_posts(query=q, limit=10)
        return {
            "platform": "x",
            "count": len(saved_posts),
            "posts": saved_posts
        }
    except XApiNotConfiguredError as e:
        return JSONResponse(
            status_code=200,
            content={
                "available": False,
                "message": str(e)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.connectors.reddit_connector import search_reddit_posts, RedditApiNotConfiguredError

@router.get("/reddit/search")
def search_reddit(q: str = Query(..., description="Keyword to search for"), subreddit: str = Query(None, description="Optional subreddit"), db: Session = Depends(get_db)):
    if not q:
        raise HTTPException(status_code=400, detail="Query is required")
        
    try:
        saved_posts = search_reddit_posts(query=q, limit=10, subreddit=subreddit)
        return {
            "platform": "reddit",
            "count": len(saved_posts),
            "posts": saved_posts
        }
    except RedditApiNotConfiguredError as e:
        return JSONResponse(
            status_code=200,
            content={
                "available": False,
                "message": str(e)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
