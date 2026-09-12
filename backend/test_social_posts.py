import sys
import os
from datetime import datetime

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.connection import engine, SessionLocal
from app.models.base import Base
import app.models.social
from app.schemas.social import SocialPostCreate
from app.api.posts import create_post, get_posts

def test_insertion_and_retrieval():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Create a mock social post data based on the prompt
        post_data = SocialPostCreate(
            platform="bluesky",
            source_post_id="123",
            text="Water shortage in our area",
            created_at=datetime.utcnow(),
            language="en",
            likes=42,
            comments=8,
            shares=12,
            views=None,
            location=None,
            hashtags=["water", "shortage"]
        )

        print("Testing insertion...")
        # Check if it already exists to avoid unique constraint failure on repeated runs
        existing = db.query(app.models.social.SocialPost).filter_by(source_post_id="123").first()
        if existing:
            print("Post already exists in DB. Deleting for fresh test.")
            if existing.engagement:
                db.delete(existing.engagement)
            # Remove from association table implicitly or explicitly if needed
            db.delete(existing)
            db.commit()

        # Insert via the API logic (which uses the schema)
        created_post = create_post(post_data, db=db)
        print("Inserted post successfully:", created_post)
        
        print("\nTesting retrieval with filtering...")
        # Retrieve using get_posts logic
        retrieved_posts = get_posts(
            skip=0, 
            limit=10, 
            platform="bluesky", 
            keyword="water",
            language="en",
            start_date=None,
            end_date=None,
            db=db
        )
        
        assert len(retrieved_posts) > 0, "No posts retrieved"
        retrieved_post = retrieved_posts[0]
        
        print("Retrieved post:", retrieved_post)
        
        assert retrieved_post["source_post_id"] == "123"
        assert retrieved_post["text"] == "Water shortage in our area"
        assert "water" in retrieved_post["hashtags"]
        assert retrieved_post["likes"] == 42
        
        print("\nTest passed successfully!")
        
    except Exception as e:
        print(f"Test failed: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    test_insertion_and_retrieval()
