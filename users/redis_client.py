import redis
import json
from users.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class RedisService:
    @staticmethod
    def set_token(key: str, value: dict, ttl: int = settings.REDIS_TTL):
        redis_client.setex(key, ttl, json.dumps(value))
    
    @staticmethod
    def get_token(key: str) -> dict:
        value = redis_client.get(key)
        return json.loads(value) if value else None
    
    @staticmethod
    def delete_token(key: str):
        redis_client.delete(key)
    
    @staticmethod
    def is_token_blacklisted(token: str) -> bool:
        return redis_client.exists(f"blacklist:{token}")
    
    @staticmethod
    def blacklist_token(token: str, ttl: int = settings.REDIS_TTL):
        redis_client.setex(f"blacklist:{token}", ttl, "true")