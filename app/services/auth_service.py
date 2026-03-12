"""
JWT authentication service.
Handles token creation and validation.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from app.core.config import settings

import logging

logger = logging.getLogger(__name__)


def create_access_token(user_data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token for the given user data.
    user_data should contain at least 'id' and 'email'.
    """
    to_encode = {
        "sub": user_data["id"],
        "email": user_data.get("email", ""),
        "name": user_data.get("name", ""),
    }
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    
    to_encode["exp"] = expire
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT access token.
    Returns the payload dict if valid, None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return {
            "id": user_id,
            "email": payload.get("email", ""),
            "name": payload.get("name", ""),
        }
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        return None
