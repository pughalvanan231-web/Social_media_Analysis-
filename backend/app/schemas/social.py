from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

class SocialPostCreate(BaseModel):
    platform: str
    source_post_id: str
    text: str
    created_at: datetime
    language: Optional[str] = None
    url: Optional[HttpUrl] = None
    
    # Engagement
    likes: int = 0
    comments: int = 0
    shares: int = 0
    views: Optional[int] = None
    
    # Location
    location: Optional[str] = None
    
    # Hashtags
    hashtags: List[str] = []

    # Author
    author_username: Optional[str] = None

class SocialPostResponse(BaseModel):
    id: int
    platform: str
    source_post_id: str
    text: str
    created_at: datetime
    language: Optional[str] = None
    likes: int
    comments: int
    shares: int
    views: Optional[int] = None
    hashtags: List[str] = []
    
    class Config:
        from_attributes = True
