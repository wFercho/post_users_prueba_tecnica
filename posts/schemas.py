from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    post_id: int
    author_id: int
    author_email: str
    author_username: str
    is_approved: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    summary: Optional[str] = Field(None, max_length=500)
    is_published: bool = False
    is_featured: bool = False

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = Field(None, max_length=500)
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None

class PostResponse(PostBase):
    id: int
    author_id: int
    author_email: str
    author_username: str
    slug: str
    content: str
    view_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    comments: List[CommentResponse] = []
    
    class Config:
        from_attributes = True

class PostListResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    author_id: int
    author_username: str
    content:str
    slug: str
    is_published: bool
    is_featured: bool
    view_count: int
    created_at: datetime
    comments_count: int = 0
    
    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel):
    items: List[PostListResponse]
    total: int
    page: int
    size: int
    pages: int

class AuthUser(BaseModel):
    user_id: int
    email: str
    username: str

class PostStats(BaseModel):
    total_posts: int
    published_posts: int
    draft_posts: int
    total_views: int
    featured_posts: int