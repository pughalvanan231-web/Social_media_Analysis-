from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Table, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

# Association table for Many-to-Many relationship between posts and hashtags
post_hashtag = Table(
    'post_hashtag',
    Base.metadata,
    Column('post_id', Integer, ForeignKey('social_posts.id'), primary_key=True),
    Column('hashtag_id', Integer, ForeignKey('hashtags.id'), primary_key=True)
)

class DataSource(Base):
    __tablename__ = "data_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g., bluesky, youtube, x, reddit
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PipelineRun(Base):
    __tablename__ = "pipeline_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True) # e.g. bluesky, youtube, x, reddit, all
    records_fetched = Column(Integer, default=0)
    records_inserted = Column(Integer, default=0)
    duplicates_removed = Column(Integer, default=0)
    errors = Column(Integer, default=0)
    status = Column(String, default="completed") # completed, failed
    run_at = Column(DateTime(timezone=True), server_default=func.now())

class PostAnalysis(Base):
    __tablename__ = "post_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("social_posts.id"), unique=True, index=True)
    sentiment = Column(String) # positive, neutral, negative
    sentiment_score = Column(Float)
    confidence = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    post = relationship("SocialPost", backref="analysis")

post_topic = Table(
    'post_topic', Base.metadata,
    Column('post_id', Integer, ForeignKey('social_posts.id'), primary_key=True),
    Column('topic_id', Integer, ForeignKey('topics.id'), primary_key=True)
)

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    keywords = Column(JSON) # List of keywords
    volume = Column(Integer, default=0)
    growth_rate = Column(Float, default=0.0) # Percentage e.g. 3.2 for +320%
    classification = Column(String) # major, emerging, rapid_narrative
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    posts = relationship("SocialPost", secondary=post_topic, backref="topics")

class TrendSnapshot(Base):
    __tablename__ = "trend_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), index=True)
    timestamp = Column(DateTime(timezone=True), index=True) # Bucket timestamp (e.g. truncated to minute/hour)
    volume = Column(Integer, default=0)
    avg_sentiment = Column(Float, default=0.5)
    total_engagement = Column(Integer, default=0)
    
    topic = relationship("Topic", backref="trends")

class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), index=True)
    anomaly_type = Column(String) # volume_spike, sentiment_shift, engagement_spike
    expected_value = Column(Float)
    actual_value = Column(Float)
    z_score = Column(Float)
    timestamp = Column(DateTime(timezone=True), default=func.now())
    
    topic = relationship("Topic", backref="anomalies")

class EmergingIssue(Base):
    __tablename__ = "emerging_issues"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), index=True)
    signal_score = Column(Float) # 0 to 100
    signal_level = Column(String) # LOW, MEDIUM, HIGH, CRITICAL
    contributing_factors = Column(JSON)
    status = Column(String, default="NEW") # NEW, VERIFIED, REJECTED
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    topic = relationship("Topic", backref="issues")

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    country = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

class Author(Base):
    __tablename__ = "authors"
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, index=True)
    platform_user_id = Column(String, index=True)
    username = Column(String, index=True)
    display_name = Column(String, nullable=True)
    profile_url = Column(String, nullable=True)
    
    posts = relationship("SocialPost", back_populates="author")

class Hashtag(Base):
    __tablename__ = "hashtags"
    id = Column(Integer, primary_key=True, index=True)
    tag = Column(String, unique=True, index=True)

class SocialPost(Base):
    __tablename__ = "social_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, index=True)
    source_post_id = Column(String, unique=True, index=True)
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=True)
    text = Column(Text)
    created_at = Column(DateTime(timezone=True))
    language = Column(String(10), index=True, nullable=True)
    url = Column(String, nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    collected_at = Column(DateTime(timezone=True), server_default=func.now())
    
    author = relationship("Author", back_populates="posts")
    location = relationship("Location")
    engagement = relationship("EngagementMetrics", back_populates="post", uselist=False)
    hashtags = relationship("Hashtag", secondary=post_hashtag, lazy="joined")

class EngagementMetrics(Base):
    __tablename__ = "engagement_metrics"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("social_posts.id"), unique=True)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0) # Also reposts
    views = Column(Integer, nullable=True)
    engagement_total = Column(Integer, default=0)
    
    post = relationship("SocialPost", back_populates="engagement")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("emerging_issues.id"), index=True)
    score = Column(Float)
    severity = Column(String) # CRITICAL, HIGH, MEDIUM, LOW
    detected_at = Column(DateTime(timezone=True), default=func.now())
    reason = Column(Text)
    supporting_metrics = Column(JSON)
    status = Column(String, default="NEW") # NEW, REVIEWING, VERIFIED, DISMISSED, RESOLVED
    
    issue = relationship("EmergingIssue", backref="alerts")

class AnalystNote(Base):
    __tablename__ = "analyst_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("emerging_issues.id"), index=True)
    analyst_id = Column(String, default="Analyst")
    note_text = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    issue = relationship("EmergingIssue", backref="notes")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String) # e.g. MARKED_VERIFIED, ADDED_NOTE
    target_type = Column(String) # e.g. Issue
    target_id = Column(Integer, index=True)
    actor = Column(String, default="Analyst")
    timestamp = Column(DateTime(timezone=True), default=func.now())

class AnalystFeedback(Base):
    __tablename__ = "analyst_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("emerging_issues.id"), index=True)
    analyst_action = Column(String) # CONFIRM, REJECT, FALSE_POSITIVE, CHANGE_SEVERITY
    previous_score = Column(Float)
    new_status = Column(String)
    reason = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    issue = relationship("EmergingIssue", backref="feedback")
