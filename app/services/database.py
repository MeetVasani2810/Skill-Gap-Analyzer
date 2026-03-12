"""
MongoDB connection manager.
Provides a singleton database connection and collection accessors.
"""
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from app.core.config import settings

logger = logging.getLogger(__name__)

_client: MongoClient | None = None
_db = None


def connect_db():
    """Connect to MongoDB. Called on application startup."""
    global _client, _db
    try:
        _client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Force a connection test
        _client.admin.command("ping")
        _db = _client[settings.MONGODB_DB_NAME]
        logger.info(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
        
        # Create indexes
        _db.users.create_index("googleId", unique=True)
        _db.users.create_index("email", unique=True)
        logger.info("MongoDB indexes ensured on users collection")
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.warning("Auth features will not work without MongoDB!")
        _client = None
        _db = None


def get_db():
    """Get the database instance."""
    return _db


def get_users_collection():
    """Get the users collection."""
    if _db is None:
        return None
    return _db.users


def close_db():
    """Close the MongoDB connection. Called on application shutdown."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB connection closed")
