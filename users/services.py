from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from users.models import User
from users.schemas import UserCreate, UserUpdate
from users.auth import get_password_hash, verify_password
from fastapi import HTTPException, status

class UserService:
    @staticmethod
    def create_user(db: Session, user: UserCreate):
        try:
            hashed_password = get_password_hash(user.password)
            db_user = User(
                email=user.email,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name,
                phone=user.phone,
                address=user.address,
                hashed_password=hashed_password
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return db_user
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered"
            )
    
    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = UserService.get_user_by_email(db, email)
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False
        return user
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_update: UserUpdate):
        db_user = UserService.get_user_by_id(db, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user