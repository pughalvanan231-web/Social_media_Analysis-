import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime

from app.models.base import Base
from app.models.social import SocialPost, EmergingIssue, IssueEvidence, Topic, post_topic
from app.ai.cross_platform import correlate_issue

# Setup in-memory SQLite DB for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Setup Mock Data
    
    # 1. Topic
    topic = Topic(name="Water Crisis", keywords=["water", "supply", "disruption"])
    db.add(topic)
    db.commit()
    
    # 2. Emerging Issue
    issue = EmergingIssue(title="Urban Water Supply Disruption", status="EMERGING")
    db.add(issue)
    db.commit()
    
    # 3. Posts from different platforms
    now = datetime.datetime.now()
    
    posts = [
        SocialPost(platform="X", source_post_id="x1", text="no water supply since morning", created_at=now, topics=[topic]),
        SocialPost(platform="Reddit", source_post_id="r1", text="water problem in our area", created_at=now, topics=[topic]),
        SocialPost(platform="YouTube", source_post_id="y1", text="residents complain about water shortage", created_at=now, topics=[topic]),
        SocialPost(platform="X", source_post_id="x2", text="still no water", created_at=now, topics=[topic])
    ]
    
    for p in posts:
        db.add(p)
    db.commit()
    
    # 4. Link evidence
    for p in posts:
        evidence = IssueEvidence(issue_id=issue.id, post_id=p.id, relevance_score=80.0, reason="Test")
        db.add(evidence)
    db.commit()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_correlate_issue(db):
    # Fetch the issue we created (ID 1)
    result = correlate_issue(1, db)
    
    assert "error" not in result
    assert result["issue_id"] == 1
    
    # Platforms detected: X, Reddit, YouTube
    assert len(result["platforms_detected"]) == 3
    assert "x" in result["platforms_detected"]
    assert "reddit" in result["platforms_detected"]
    assert "youtube" in result["platforms_detected"]
    
    # Number of posts
    assert result["number_of_posts"] == 4
    
    # Unique sources (since author_id is None, it uses source_post_id fallback in mock data)
    assert result["unique_sources"] == 4
    
    # Keywords
    assert "water" in result["related_keywords"]
    assert "supply" in result["related_keywords"]
    
    # Cross platform signal calculation: (3 - 1) / 3.0 = 2/3 = 0.666
    assert round(result["cross_platform_signal"], 2) == 0.67
