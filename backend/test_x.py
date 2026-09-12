import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.connectors.x_connector import search_x_posts, XApiNotConfiguredError

def test_x():
    db: Session = SessionLocal()
    print("Testing X connector with missing token...")
    try:
        search_x_posts(query="test", db=db, limit=2)
        print("FAILED: Expected XApiNotConfiguredError but it succeeded.")
    except XApiNotConfiguredError as e:
        print(f"SUCCESS: Caught expected error: {e}")
    except Exception as e:
        print(f"FAILED: Caught unexpected error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_x()
