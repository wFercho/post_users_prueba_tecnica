from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from posts.models import Post, Comment, PostLike
from posts.schemas import PostCreate, PostUpdate, CommentCreate, AuthUser
from posts.utils import create_slug, truncate_text
from posts.redis_client import RedisService
from typing import List, Optional
import json

class PostService:
    @staticmethod
    def create_post(db: Session, post: PostCreate, author: AuthUser) -> Post:
        # Crear slug inicial
        slug = create_slug(post.title)
        
        # Crear el post
        db_post = Post(
            title=post.title,
            content=post.content,
            summary=post.summary or truncate_text(post.content),
            author_id=author.user_id,
            author_email=author.email,
            author_username=author.username,
            slug=slug,
            is_published=post.is_published,
            is_featured=post.is_featured
        )
        
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        
        # Actualizar slug con ID
        db_post.slug = create_slug(post.title, db_post.id)
        db.commit()
        
        # Limpiar caché
        RedisService.delete_pattern("posts:*")
        
        return db_post
    
    @staticmethod
    def get_posts(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        published_only: bool = True,
        featured_only: bool = False,
        author_id: Optional[int] = None,
        search: Optional[str] = None
    ) -> List[Post]:
        query = db.query(Post)
        
        if published_only:
            query = query.filter(Post.is_published == True)
        
        if featured_only:
            query = query.filter(Post.is_featured == True)
        
        if author_id:
            query = query.filter(Post.author_id == author_id)
        
        if search:
            query = query.filter(
                Post.title.ilike(f"%{search}%") |
                Post.content.ilike(f"%{search}%")
            )
        
        return query.order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_posts_count(
        db: Session,
        published_only: bool = True,
        featured_only: bool = False,
        author_id: Optional[int] = None,
        search: Optional[str] = None
    ) -> int:
        query = db.query(Post)
        
        if published_only:
            query = query.filter(Post.is_published == True)
        
        if featured_only:
            query = query.filter(Post.is_featured == True)
        
        if author_id:
            query = query.filter(Post.author_id == author_id)
        
        if search:
            query = query.filter(
                Post.title.ilike(f"%{search}%") |
                Post.content.ilike(f"%{search}%")
            )
        
        return query.count()
    
    @staticmethod
    def get_post_by_id(db: Session, post_id: int) -> Optional[Post]:
        return db.query(Post).filter(Post.id == post_id).first()
    
    @staticmethod
    def get_post_by_slug(db: Session, slug: str) -> Optional[Post]:
        # Intentar obtener del caché
        cached_post = RedisService.get_cache(f"post:slug:{slug}")
        if cached_post:
            return cached_post
        
        post = db.query(Post).filter(Post.slug == slug).first()
        if post:
            # Incrementar contador de vistas
            post.view_count += 1
            db.commit()
            
            # Cachear el post
            RedisService.set_cache(f"post:slug:{slug}", {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "author_username": post.author_username,
                "view_count": post.view_count
            })
        
        return post
    
    @staticmethod
    def update_post(db: Session, post_id: int, post_update: PostUpdate, author: AuthUser) -> Optional[Post]:
        post = db.query(Post).filter(Post.id == post_id, Post.author_id == author.user_id).first()
        if not post:
            return None
        
        update_data = post_update.dict(exclude_unset=True)
        
        # Actualizar slug si cambió el título
        if "title" in update_data:
            post.slug = create_slug(update_data["title"], post.id)
        
        # Actualizar summary si cambió el contenido
        if "content" in update_data and "summary" not in update_data:
            post.summary = truncate_text(update_data["content"])
        
        for field, value in update_data.items():
            setattr(post, field, value)
        
        db.commit()
        db.refresh(post)
        
        # Limpiar caché
        RedisService.delete_pattern("posts:*")
        RedisService.delete_cache(f"post:slug:{post.slug}")
        
        return post
    
    @staticmethod
    def delete_post(db: Session, post_id: int, author: AuthUser) -> bool:
        post = db.query(Post).filter(Post.id == post_id, Post.author_id == author.user_id).first()
        if not post:
            return False
        
        slug = post.slug
        db.delete(post)
        db.commit()
        
        # Limpiar caché
        RedisService.delete_pattern("posts:*")
        RedisService.delete_cache(f"post:slug:{slug}")
        
        return True
    
    
    @staticmethod
    def get_user_stats(db: Session, author_id: int) -> dict:
        from sqlalchemy import case
        
        stats = db.query(
            func.count(Post.id).label('total_posts'),
            func.sum(case((Post.is_published == True, 1), else_=0)).label('published_posts'),
            func.sum(case((Post.is_published == False, 1), else_=0)).label('draft_posts'),
            func.sum(Post.view_count).label('total_views'),
            func.sum(case((Post.is_featured == True, 1), else_=0)).label('featured_posts')
        ).filter(Post.author_id == author_id).first()
        
        return {
            "total_posts": stats.total_posts or 0,
            "published_posts": stats.published_posts or 0,
            "draft_posts": stats.draft_posts or 0,
            "total_views": stats.total_views or 0,
            "featured_posts": stats.featured_posts or 0
        }

class CommentService:
    @staticmethod
    def create_comment(db: Session, comment: CommentCreate, post_id: int, author: AuthUser) -> Comment:
        db_comment = Comment(
            content=comment.content,
            post_id=post_id,
            author_id=author.user_id,
            author_email=author.email,
            author_username=author.username
        )
        
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        
        return db_comment
    
    @staticmethod
    def get_comments_by_post(db: Session, post_id: int) -> List[Comment]:
        return db.query(Comment).filter(
            Comment.post_id == post_id,
            Comment.is_approved == True
        ).order_by(desc(Comment.created_at)).all()
    
    @staticmethod
    def delete_comment(db: Session, comment_id: int, author: AuthUser) -> bool:
        comment = db.query(Comment).filter(
            Comment.id == comment_id,
            Comment.author_id == author.user_id
        ).first()
        
        if not comment:
            return False
        
        db.delete(comment)
        db.commit()
        return True

class LikeService:
    @staticmethod
    def toggle_like(db: Session, post_id: int, user_id: int) -> bool:
        existing_like = db.query(PostLike).filter(
            PostLike.post_id == post_id,
            PostLike.user_id == user_id
        ).first()
        
        if existing_like:
            db.delete(existing_like)
            db.commit()
            return False  # Unlike
        else:
            new_like = PostLike(post_id=post_id, user_id=user_id)
            db.add(new_like)
            db.commit()
            return True  # Like
    
    @staticmethod
    def get_likes_count(db: Session, post_id: int) -> int:
        return db.query(PostLike).filter(PostLike.post_id == post_id).count()