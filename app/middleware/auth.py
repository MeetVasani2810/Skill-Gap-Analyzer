"""
Auth middleware.
FastAPI dependency for extracting and validating the current user from JWT.
"""
from fastapi import Request, HTTPException, Depends
from typing import Optional
from app.services.auth_service import decode_access_token
from app.models.user import find_user_by_id, serialize_user

import logging

logger = logging.getLogger(__name__)


async def get_current_user(request: Request) -> dict:
    """
    FastAPI dependency that extracts the JWT from cookies or Authorization header,
    validates it, and returns the user dict.
    Raises 401 if not authenticated.
    """
    token = None
    
    # Try cookie first
    token = request.cookies.get("access_token")
    
    # Fall back to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Decode the token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Fetch full user from DB
    user = find_user_by_id(payload["id"])
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return serialize_user(user)


async def get_optional_user(request: Request) -> Optional[dict]:
    """
    Same as get_current_user but returns None instead of raising 401.
    Useful for routes that work both authenticated and unauthenticated.
    """
    try:
        return await get_current_user(request)
    except HTTPException:
        return None
