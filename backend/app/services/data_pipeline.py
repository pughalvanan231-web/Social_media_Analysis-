from sqlalchemy.orm import Session
from app.models.social import SocialPost, PipelineRun
from app.api.posts import create_post
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException
import traceback

from app.connectors.bluesky_connector import search_bluesky_posts
from app.connectors.youtube_connector import search_youtube_videos
from app.connectors.x_connector import search_x_posts, XApiNotConfiguredError
from app.connectors.reddit_connector import search_reddit_posts, RedditApiNotConfiguredError

def detect_language_safe(text: str) -> str:
    if not text:
        return "unknown"
    try:
        return detect(text)
    except LangDetectException:
        return "unknown"

def process_posts(platform: str, posts_create_list: list, db: Session) -> tuple:
    """
    Takes raw schemas, dedupes, detects language, and saves to DB.
    Returns (inserted_count, duplicate_count, error_count)
    """
    inserted = 0
    duplicates = 0
    errors = 0
    
    for post_create in posts_create_list:
        # 1. Deduplication
        existing = db.query(SocialPost).filter(SocialPost.source_post_id == post_create.source_post_id).first()
        if existing:
            duplicates += 1
            continue
            
        # 2. Language Detection (if platform didn't provide one, or we want to overwrite)
        if not post_create.language or post_create.language == "unknown":
            post_create.language = detect_language_safe(post_create.text)
            
        # 3. Store in DB
        try:
            create_post(post_create, db)
            inserted += 1
        except Exception as e:
            print(f"Error inserting {platform} post {post_create.source_post_id}: {e}")
            db.rollback()
            errors += 1
            
    return inserted, duplicates, errors

def run_pipeline(keyword: str, sources: list, db: Session) -> dict:
    """
    Executes the data pipeline across requested sources.
    """
    results = []
    
    for source in sources:
        print(f"Running pipeline for source: {source}")
        fetched = 0
        inserted = 0
        duplicates = 0
        errors = 0
        status = "completed"
        
        try:
            posts_create_list = []
            
            if source == "bluesky":
                posts_create_list = search_bluesky_posts(keyword=keyword, limit=20)
            elif source == "youtube":
                posts_create_list = search_youtube_videos(keyword=keyword, limit=10)
            elif source == "x":
                try:
                    posts_create_list = search_x_posts(query=keyword, limit=10)
                except XApiNotConfiguredError:
                    print("X API not configured. Skipping.")
            elif source == "reddit":
                try:
                    posts_create_list = search_reddit_posts(query=keyword, limit=10)
                except RedditApiNotConfiguredError:
                    print("Reddit API not configured. Skipping.")
            else:
                print(f"Unknown source: {source}")
                continue
                
            fetched = len(posts_create_list)
            if fetched > 0:
                inserted, duplicates, errors = process_posts(source, posts_create_list, db)
                
        except Exception as e:
            print(f"Pipeline error for {source}: {e}")
            traceback.print_exc()
            status = "failed"
            errors += 1
            
        # Log to DB PipelineRun table
        run_record = PipelineRun(
            source=source,
            records_fetched=fetched,
            records_inserted=inserted,
            duplicates_removed=duplicates,
            errors=errors,
            status=status
        )
        db.add(run_record)
        db.commit()
        db.refresh(run_record)
        
        results.append({
            "source": source,
            "status": status,
            "fetched": fetched,
            "inserted": inserted,
            "duplicates": duplicates,
            "errors": errors
        })
        
    return {"runs": results}
