from qdrant_client import QdrantClient
from qdrant_client.http import models
import logging
import os
from app.core.config import settings
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class VectorDBService:
    def __init__(self, collection_name: str = "skills_jobs", persist_path: str = "./qdrant_data"):
        # Initialize Qdrant Client (Remote vs Local)
        if settings.QDRANT_URL:
            logger.info(f"Connecting to remote Qdrant at {settings.QDRANT_URL}")
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
            )
        else:
            # Local file-based storage fallback
            # Handle stale lock files that might prevent Qdrant from starting
            lock_file = os.path.join(persist_path, ".lock")
            if os.path.exists(lock_file):
                try:
                    logger.info(f"Removing stale Qdrant lock file at {lock_file}")
                    os.remove(lock_file)
                except Exception as e:
                    logger.warning(f"Failed to remove lock file {lock_file}: {e}")

            self.client = QdrantClient(path=persist_path) 
            logger.info(f"Initialized Qdrant client with local persistent storage at {persist_path}")

        self.collection_name = collection_name
        self.vector_size = 384  # Default for all-MiniLM-L6-v2

    def init_collection(self, vector_size: int = 384):
        """Create collection if it doesn't exist."""
        self.vector_size = vector_size
        collections = self.client.get_collections()
        exists = any(c.name == self.collection_name for c in collections.collections)

        if not exists:
            logger.info(f"Creating collection: {self.collection_name}")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=vector_size,
                    distance=models.Distance.COSINE
                )
            )

    def upsert(self, id: str | int, vector: List[float], metadata: Dict[str, Any]):
        """Insert or update a vector."""
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=id,
                    vector=vector,
                    payload=metadata
                )
            ]
        )

    def search(self, vector: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar vectors."""
        # Use query_points as search is deprecated/missing in this version/env
        response = self.client.query_points(
            collection_name=self.collection_name,
            query=vector,
            limit=limit
        )
        return [
            {
                "id": hit.id,
                "score": hit.score,
                "payload": hit.payload
            } 
            for hit in response.points
        ]
