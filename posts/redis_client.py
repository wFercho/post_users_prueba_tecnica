import redis
import json
from posts.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class RedisService:
    @staticmethod
    def set_cache(key: str, value: dict, ttl: int = settings.REDIS_TTL):
        redis_client.setex(key, ttl, json.dumps(value))
    
    @staticmethod
    def get_cache(key: str) -> dict:
        value = redis_client.get(key)
        return json.loads(value) if value else None
    
    @staticmethod
    def delete_cache(key: str):
        redis_client.delete(key)
    
    @staticmethod
    def delete_pattern(pattern: str):
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)