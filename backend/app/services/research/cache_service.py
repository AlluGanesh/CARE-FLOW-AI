import time
import hashlib
from typing import Dict, Any, Optional
from app.core.config import settings

class ResearchCache:
    """
    In-memory / Redis-ready research cache with TTL freshness tracking.
    Caches objective medical knowledge (sources, mechanism of action, test reference ranges)
    while strictly avoiding caching patient-specific private conclusions.
    """
    _cache: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def _make_key(cls, query: str) -> str:
        normalized = query.strip().lower()
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    @classmethod
    def get(cls, query: str) -> Optional[Dict[str, Any]]:
        key = cls._make_key(query)
        record = cls._cache.get(key)
        if not record:
            return None

        # Check TTL
        now = time.time()
        ttl_seconds = settings.RESEARCH_CACHE_TTL_HOURS * 3600
        if now - record["timestamp"] > ttl_seconds:
            del cls._cache[key]
            return None

        return record["data"]

    @classmethod
    def set(cls, query: str, data: Dict[str, Any]) -> None:
        key = cls._make_key(query)
        cls._cache[key] = {
            "query": query,
            "timestamp": time.time(),
            "data": data
        }

    @classmethod
    def clear(cls) -> None:
        cls._cache.clear()
