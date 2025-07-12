from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@app-postgres:5432/auth_db"
    
    # Redis
    REDIS_URL: str = "redis://users-redis:6379"
    REDIS_TTL: int = 3600  # 1 hora
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # App
    APP_NAME: str = "Microservicio de Usuarios y Auth"
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        

settings = Settings()