import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.connectors.bluesky_connector import search_bluesky_posts

def test_bluesky():
    db: Session = SessionLocal()
    print("Searching Bluesky for 'water'...")
    try:
        posts = search_bluesky_posts(keyword="water", db=db, limit=5)
        print(f"Found and saved {len(posts)} posts:")
        for p in posts:
            print(f"- {p['author_username']}: {p['text'][:50]}...")
            
        # Test duplicates
        print("\nSearching again to test duplicates...")
        posts2 = search_bluesky_posts(keyword="water", db=db, limit=5)
        print(f"Found and saved {len(posts2)} posts. Should be 0 if the same 5 were returned.")
    finally:
        db.close()

if __name__ == "__main__":
    test_bluesky()
