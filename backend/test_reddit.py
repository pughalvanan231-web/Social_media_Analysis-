import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.connectors.reddit_connector import search_reddit_posts, RedditApiNotConfiguredError

def test_reddit():
    db: Session = SessionLocal()
    print("Testing Reddit connector with missing token...")
    try:
        search_reddit_posts(query="test", db=db, limit=2)
        print("FAILED: Expected RedditApiNotConfiguredError but it succeeded.")
    except RedditApiNotConfiguredError as e:
        print(f"SUCCESS: Caught expected error: {e}")
    except Exception as e:
        print(f"FAILED: Caught unexpected error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_reddit()
