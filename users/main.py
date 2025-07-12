from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta

from users.config import settings
from users.database import get_db, engine
from users.models import Base, User
from users.schemas import *
from users.services import UserService
from users.auth import create_access_token, create_refresh_token, verify_token
from users.redis_client import RedisService

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

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    
    # Verificar si el token está en blacklist
    if RedisService.is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )
    
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = UserService.get_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return UserService.create_user(db, user)

@app.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = UserService.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # Guardar tokens en Redis
    RedisService.set_token(f"access:{access_token}", {
        "user_id": user.id,
        "email": user.email,
        "type": "access"
    })
    RedisService.set_token(f"refresh:{refresh_token}", {
        "user_id": user.id,
        "email": user.email,
        "type": "refresh"
    }, ttl=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/validate-token", response_model=ValidateTokenResponse)
def validate_token(request: ValidateTokenRequest, db: Session = Depends(get_db)):
    """
    Endpoint para que otros servicios validen tokens JWT
    """
    token = request.token
    
    # Verificar si el token está en blacklist
    if RedisService.is_token_blacklisted(token):
        return ValidateTokenResponse(
            valid=False,
            message="Token has been revoked"
        )
    
    payload = verify_token(token)
    if payload is None:
        return ValidateTokenResponse(
            valid=False,
            message="Invalid or expired token"
        )
    
    if payload.get("type") != "access":
        return ValidateTokenResponse(
            valid=False,
            message="Invalid token type"
        )
    
    email = payload.get("sub")
    if email is None:
        return ValidateTokenResponse(
            valid=False,
            message="Invalid token payload"
        )
    
    user = UserService.get_user_by_email(db, email)
    if user is None:
        return ValidateTokenResponse(
            valid=False,
            message="User not found"
        )
    
    return ValidateTokenResponse(
        valid=True,
        user_id=user.id,
        email=user.email,
        username=user.username
    )

@app.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return UserService.update_user(db, current_user.id, user_update)

@app.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    # Agregar token a blacklist
    payload = verify_token(token)
    if payload:
        exp = payload.get("exp")
        if exp:
            import time
            ttl = exp - int(time.time())
            if ttl > 0:
                RedisService.blacklist_token(token, ttl)
    
    return {"message": "Successfully logged out"}

@app.post("/refresh", response_model=Token)
def refresh_token(request: ValidateTokenRequest, db: Session = Depends(get_db)):
    token = request.token
    
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    email = payload.get("sub")
    user = UserService.get_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Crear nuevos tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # Blacklist el token anterior
    RedisService.blacklist_token(token)
    
    # Guardar nuevos tokens en Redis
    RedisService.set_token(f"access:{access_token}", {
        "user_id": user.id,
        "email": user.email,
        "type": "access"
    })
    RedisService.set_token(f"refresh:{refresh_token}", {
        "user_id": user.id,
        "email": user.email,
        "type": "refresh"
    }, ttl=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)