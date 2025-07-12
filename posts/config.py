from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@app-postgres:5432/posts_db"
    
    # Redis
    REDIS_URL: str = "redis://users-redis:6379"
    REDIS_TTL: int = 3600  # 1 hora
    
    # Auth Service
    AUTH_SERVICE_URL: str = "http://users-microservice:8000"
    
    # App
    APP_NAME: str = "Microservicio de Posts"
    DEBUG: bool = False
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 10
    MAX_PAGE_SIZE: int = 100

    model_config = {
        "extra": "allow",
        "env_file": ".env"
    }

settings = Settings()