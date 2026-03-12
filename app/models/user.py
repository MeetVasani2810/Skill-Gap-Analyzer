"""
MongoDB User model.
Handles user CRUD operations for Google OAuth users.
"""
from datetime import datetime, timezone
from typing import Optional
from app.services.database import get_users_collection


def find_user_by_google_id(google_id: str) -> Optional[dict]:
    """Find a user by their Google ID."""
    collection = get_users_collection()
    if collection is None:
        return None
    return collection.find_one({"googleId": google_id})


def find_user_by_email(email: str) -> Optional[dict]:
    """Find a user by their email."""
    collection = get_users_collection()
    if collection is None:
        return None
    return collection.find_one({"email": email})


def find_user_by_id(user_id: str) -> Optional[dict]:
    """Find a user by their MongoDB _id (string)."""
    from bson import ObjectId
    collection = get_users_collection()
    if collection is None:
        return None
    try:
        return collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def find_or_create_user(google_id: str, email: str, name: str, avatar: str = "") -> dict:
    """
    Find an existing user by Google ID, or create a new one.
    Returns the user document.
    """
    collection = get_users_collection()
    if collection is None:
        raise RuntimeError("MongoDB is not connected. Cannot create user.")
    
    # Try to find existing user
    user = collection.find_one({"googleId": google_id})
    
    if user:
        # Update profile info in case it changed on Google's side
        collection.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "name": name,
                "email": email,
                "avatar": avatar,
            }}
        )
        user["name"] = name
        user["email"] = email
        user["avatar"] = avatar
        return user
    
    # Create new user
    new_user = {
        "googleId": google_id,
        "email": email,
        "name": name,
        "avatar": avatar,
        "createdAt": datetime.now(timezone.utc),
    }
    result = collection.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    return new_user


def serialize_user(user: dict) -> dict:
    """Convert a MongoDB user document to a JSON-safe dict."""
    return {
        "id": str(user["_id"]),
        "googleId": user.get("googleId", ""),
        "email": user.get("email", ""),
        "name": user.get("name", ""),
        "avatar": user.get("avatar", ""),
        "createdAt": user.get("createdAt", "").isoformat() if hasattr(user.get("createdAt", ""), "isoformat") else str(user.get("createdAt", "")),
    }
