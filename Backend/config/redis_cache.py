import redis
import json
import asyncio
from redis import asyncio as aioredis
from typing import Any, Optional
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)


class RedisCache:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://192.168.1.45:6379/0")
        self.redis_host = os.getenv("REDIS_HOST", "192.168.1.45")
        self.redis_port = int(os.getenv("REDIS_PORT", 6379))
        self.redis_db = int(os.getenv("REDIS_DB", 0))
        self.redis_password = os.getenv("REDIS_PASSWORD", None)

        # Sync Redis client
        self._sync_client: Optional[redis.Redis] = None
        # Async Redis client
        self._async_client: Optional[aioredis.Redis] = None

        # Default TTL (Time To Live) - 1 hour
        self.default_ttl = int(os.getenv("REDIS_DEFAULT_TTL", 3600))

    # ================== SYNC CLIENT ==================
    def get_sync_client(self) -> redis.Redis:
        if self._sync_client is None:
            try:
                self._sync_client = redis.Redis(
                    host=self.redis_host,
                    port=self.redis_port,
                    db=self.redis_db,
                    password=self.redis_password,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30,
                )
                # Test connection
                self._sync_client.ping()
                logger.info("Redis sync connection established successfully")
            except Exception as e:
                logger.error(f"Failed to connect to Redis sync: {e}")
                self._sync_client = None
        return self._sync_client

    # ================== ASYNC CLIENT ==================
    async def get_async_client(self) -> aioredis.Redis:
        if self._async_client is None:
            try:
                self._async_client = aioredis.from_url(
                    self.redis_url,
                    password=self.redis_password,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30,
                )
                # Test connection
                await self._async_client.ping()
                logger.info("Redis async connection established successfully")
            except Exception as e:
                logger.error(f"Failed to connect to Redis async: {e}")
                self._async_client = None
        return self._async_client

    # ================== SYNC OPERATIONS ==================
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        try:
            client = self.get_sync_client()
            if client is None:
                return False

            ttl = ttl or self.default_ttl

            if not isinstance(value, str):
                value = json.dumps(value, ensure_ascii=False)

            return client.setex(key, ttl, value)
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False

    def get(self, key: str) -> Optional[Any]:
        try:
            client = self.get_sync_client()
            if client is None:
                return None

            value = client.get(key)
            if value is None:
                return None

            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return None

    def delete(self, key: str) -> bool:
        try:
            client = self.get_sync_client()
            if client is None:
                return False
            return bool(client.delete(key))
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False

    def exists(self, key: str) -> bool:
        try:
            client = self.get_sync_client()
            if client is None:
                return False
            return bool(client.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False

    def expire(self, key: str, ttl: int) -> bool:
        try:
            client = self.get_sync_client()
            if client is None:
                return False
            return bool(client.expire(key, ttl))
        except Exception as e:
            logger.error(f"Error setting expire for key {key}: {e}")
            return False

    # ================== ASYNC OPERATIONS ==================
    async def async_set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        try:
            client = await self.get_async_client()
            if client is None:
                return False

            ttl = ttl or self.default_ttl

            if not isinstance(value, str):
                value = json.dumps(value, ensure_ascii=False)

            return await client.setex(key, ttl, value)
        except Exception as e:
            logger.error(f"Error async setting cache key {key}: {e}")
            return False

    async def async_get(self, key: str) -> Optional[Any]:
        try:
            client = await self.get_async_client()
            if client is None:
                return None

            value = await client.get(key)
            if value is None:
                return None

            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        except Exception as e:
            logger.error(f"Error async getting cache key {key}: {e}")
            return None

    async def async_delete(self, key: str) -> bool:
        try:
            client = await self.get_async_client()
            if client is None:
                return False
            return bool(await client.delete(key))
        except Exception as e:
            logger.error(f"Error async deleting cache key {key}: {e}")
            return False

    async def async_exists(self, key: str) -> bool:
        try:
            client = await self.get_async_client()
            if client is None:
                return False
            return bool(await client.exists(key))
        except Exception as e:
            logger.error(f"Error async checking cache key {key}: {e}")
            return False

    # ================== UTILITY ==================
    def flush_all(self) -> bool:
        try:
            client = self.get_sync_client()
            if client is None:
                return False
            client.flushdb()
            return True
        except Exception as e:
            logger.error(f"Error flushing cache: {e}")
            return False

    def get_info(self) -> Optional[dict]:
        try:
            client = self.get_sync_client()
            if client is None:
                return None
            return client.info()
        except Exception as e:
            logger.error(f"Error getting Redis info: {e}")
            return None

    def close_connections(self):
        try:
            if self._sync_client:
                self._sync_client.close()
                self._sync_client = None
            if self._async_client:
                asyncio.create_task(self._async_client.close())
                self._async_client = None
        except Exception as e:
            logger.error(f"Error closing Redis connections: {e}")


# ================== SINGLETON + HELPERS ==================
redis_cache = RedisCache()


def cache_set(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    return redis_cache.set(key, value, ttl)


def cache_get(key: str) -> Optional[Any]:
    return redis_cache.get(key)


def cache_delete(key: str) -> bool:
    return redis_cache.delete(key)


def cache_exists(key: str) -> bool:
    return redis_cache.exists(key)


async def async_cache_set(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    return await redis_cache.async_set(key, value, ttl)


async def async_cache_get(key: str) -> Optional[Any]:
    return await redis_cache.async_get(key)


async def async_cache_delete(key: str) -> bool:
    return await redis_cache.async_delete(key)


async def async_cache_exists(key: str) -> bool:
    return await redis_cache.async_exists(key)


# ================== DECORATORS ==================
def cache_result(key_prefix: str, ttl: Optional[int] = None):
    def decorator(func):
        def wrapper(*args, **kwargs):
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"

            cached_result = cache_get(cache_key)
            if cached_result is not None:
                return cached_result

            result = func(*args, **kwargs)
            if result is not None:
                cache_set(cache_key, result, ttl)

            return result

        return wrapper

    return decorator


def async_cache_result(key_prefix: str, ttl: Optional[int] = None):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"

            cached_result = await async_cache_get(cache_key)
            if cached_result is not None:
                return cached_result

            result = await func(*args, **kwargs)
            if result is not None:
                await async_cache_set(cache_key, result, ttl)

            return result

        return wrapper

    return decorator
