import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.connectors.youtube_connector import search_youtube_videos

def test_youtube():
    db: Session = SessionLocal()
    print("Searching YouTube for 'news'...")
    try:
        posts = search_youtube_videos(keyword="news", db=db, limit=2)
        print(f"Found and saved {len(posts)} videos:")
        for p in posts:
            print(f"- {p['author_username']}: {p['text'].splitlines()[0]}")
            
    except Exception as e:
        print(f"Test failed (likely missing API key or 403): {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_youtube()
