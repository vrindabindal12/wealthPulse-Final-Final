import asyncio
import redis.asyncio as aioredis
from core.config import settings

redis_client: aioredis.Redis = None

class SafeRedisWrapper:
    def __init__(self, client):
        self._client = client

    def __getattr__(self, name):
        if self._client is None:
            # If client was never initialized, return a dummy handler
            def dummy_fallback(*args, **kwargs):
                if name == "keys":
                    return []
                return None
            return dummy_fallback

        attr = getattr(self._client, name)
        if callable(attr):
            if asyncio.iscoroutinefunction(attr):
                async def async_wrapper(*args, **kwargs):
                    try:
                        return await attr(*args, **kwargs)
                    except Exception as e:
                        print(f"[SafeRedis] Redis async error during {name}: {e}")
                        if name == "keys":
                            return []
                        return None
                return async_wrapper
            else:
                def sync_wrapper(*args, **kwargs):
                    try:
                        return attr(*args, **kwargs)
                    except Exception as e:
                        print(f"[SafeRedis] Redis sync error during {name}: {e}")
                        if name == "keys":
                            return []
                        return None
                return sync_wrapper
        return attr

async def init_redis():
    global redis_client
    redis_client = aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True
    )
    try:
        await redis_client.ping()
        print("[Redis] Redis connected")
    except Exception as e:
        print(f"[Redis Warning] Redis connection failed: {e}")
        # don't crash — workers will fail gracefully later

async def get_redis():
    return SafeRedisWrapper(redis_client)
