from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import math

from posts.config import settings
from posts.database import get_db, engine
from posts.models import Base, Post, Comment
from posts.schemas import *
from posts.services import PostService, CommentService, LikeService
from posts.auth_service import AuthService
from posts.redis_client import RedisService

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

origins = [
    "http://localhost:3000",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    return await AuthService.validate_token(token)

@app.post("/posts", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return PostService.create_post(db, post, current_user)

@app.get("/posts", response_model=PaginatedResponse)
def get_posts(
    page: int = Query(1, ge=1),
    size: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    published_only: bool = Query(True),
    featured_only: bool = Query(False),
    author_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    
    posts = PostService.get_posts(
        db, skip=skip, limit=size, published_only=published_only,
        featured_only=featured_only, author_id=author_id, search=search
    )
    
    total = PostService.get_posts_count(
        db, published_only=published_only, featured_only=featured_only,
        author_id=author_id, search=search
    )
    
    # Agregar contador de comentarios
    posts_with_comments = []
    for post in posts:
        comments_count = db.query(Comment).filter(
            Comment.post_id == post.id,
            Comment.is_approved == True
        ).count()
        
        post_dict = PostListResponse.from_orm(post).dict()
        post_dict["comments_count"] = comments_count
        posts_with_comments.append(PostListResponse(**post_dict))
    
    return PaginatedResponse(
        items=posts_with_comments,
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size)
    )

@app.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = PostService.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Incrementar contador de vistas
    post.view_count += 1
    db.commit()
    
    return post

@app.get("/posts/slug/{slug}", response_model=PostResponse)
def get_post_by_slug(slug: str, db: Session = Depends(get_db)):
    post = PostService.get_post_by_slug(db, slug)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return post

@app.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = PostService.update_post(db, post_id, post_update, current_user)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    return post

@app.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = PostService.delete_post(db, post_id, current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    return {"message": "Post deleted successfully"}

@app.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_post_comments(post_id: int, db: Session = Depends(get_db)):
    return CommentService.get_comments_by_post(db, post_id)

@app.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: int,
    comment: CommentCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el post existe
    post = PostService.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return CommentService.create_comment(db, comment, post_id, current_user)

@app.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = CommentService.delete_comment(db, comment_id, current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found or not authorized"
        )
    return {"message": "Comment deleted successfully"}

@app.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el post existe
    post = PostService.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    liked = LikeService.toggle_like(db, post_id, current_user.user_id)
    likes_count = LikeService.get_likes_count(db, post_id)
    
    return {
        "liked": liked,
        "likes_count": likes_count,
        "message": "Liked" if liked else "Unliked"
    }

@app.get("/posts/{post_id}/likes")
def get_post_likes(post_id: int, db: Session = Depends(get_db)):
    likes_count = LikeService.get_likes_count(db, post_id)
    return {"likes_count": likes_count}

@app.get("/my-posts", response_model=PaginatedResponse)
async def get_my_posts(
    page: int = Query(1, ge=1),
    size: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    published_only: bool = Query(False),
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    
    posts = PostService.get_posts(
        db, skip=skip, limit=size, published_only=published_only,
        author_id=current_user.user_id
    )
    
    total = PostService.get_posts_count(
        db, published_only=published_only, author_id=current_user.user_id
    )
    
    # Agregar contador de comentarios
    posts_with_comments = []
    for post in posts:
        comments_count = db.query(Comment).filter(
            Comment.post_id == post.id,
            Comment.is_approved == True
        ).count()
        
        post_dict = PostListResponse.from_orm(post).dict()
        post_dict["comments_count"] = comments_count
        posts_with_comments.append(PostListResponse(**post_dict))
    
    return PaginatedResponse(
        items=posts_with_comments,
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size)
    )

@app.get("/my-stats", response_model=PostStats)
async def get_my_stats(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = PostService.get_user_stats(db, current_user.user_id)
    return PostStats(**stats)

@app.get("/comments/{comment_id}", response_model=CommentResponse)
def get_comment_by_id(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment or comment.author_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Comment not found or not authorized")
    return comment

@app.get("/my-comments", response_model=List[CommentResponse])
def get_my_comments(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    return db.query(Comment).filter(
        Comment.author_id == current_user.user_id
    ).order_by(desc(Comment.created_at)).all()


@app.get("/posts/{post_id}/liked")
def check_user_liked_post(
    post_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    liked = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.user_id
    ).first() is not None
    return {"liked": liked}

@app.get("/my-likes-count")
def get_total_likes_from_my_posts(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    posts_ids = db.query(Post.id).filter(Post.author_id == current_user.user_id).subquery()
    likes_count = db.query(func.count()).select_from(PostLike).filter(PostLike.post_id.in_(posts_ids)).scalar()
    return {"total_likes": likes_count}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)