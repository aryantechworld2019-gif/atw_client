"""
Rate limiting configuration
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from functools import wraps
from fastapi import Request, HTTPException
import time
from typing import Dict
import asyncio

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

# In-memory store for rate limiting (use Redis in production)
_rate_limit_store: Dict[str, Dict] = {}


def check_rate_limit(key: str, limit: int, window: int) -> bool:
    """
    Check if rate limit is exceeded

    Args:
        key: Identifier for the rate limit (e.g., IP address)
        limit: Maximum number of requests
        window: Time window in seconds

    Returns:
        True if within limit, False if exceeded
    """
    now = time.time()

    if key not in _rate_limit_store:
        _rate_limit_store[key] = {"count": 1, "reset_time": now + window}
        return True

    store = _rate_limit_store[key]

    # Reset if window has passed
    if now > store["reset_time"]:
        store["count"] = 1
        store["reset_time"] = now + window
        return True

    # Increment counter
    if store["count"] < limit:
        store["count"] += 1
        return True

    return False


def rate_limit(limit: int = 60, window: int = 60):
    """
    Rate limit decorator for endpoints

    Args:
        limit: Maximum number of requests
        window: Time window in seconds
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get request from kwargs
            request = kwargs.get("request") or next((arg for arg in args if isinstance(arg, Request)), None)

            if request:
                client_ip = get_remote_address(request)
                key = f"{func.__name__}:{client_ip}"

                if not check_rate_limit(key, limit, window):
                    raise HTTPException(
                        status_code=429,
                        detail="Too many requests. Please try again later.",
                        headers={"Retry-After": str(window)}
                    )

            return await func(*args, **kwargs)
        return wrapper
    return decorator


# Cleanup old entries periodically
async def cleanup_rate_limit_store():
    """Remove expired entries from rate limit store"""
    while True:
        await asyncio.sleep(300)  # Run every 5 minutes
        now = time.time()
        expired_keys = [
            key for key, value in _rate_limit_store.items()
            if now > value["reset_time"]
        ]
        for key in expired_keys:
            del _rate_limit_store[key]
