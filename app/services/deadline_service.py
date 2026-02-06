import json
from pathlib import Path
from typing import Dict, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class DeadlineService:
    def __init__(self, data_path: str = "data/deadlines.json"):
        self.data_path = Path(data_path)
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Create the data file if it doesn't exist."""
        if not self.data_path.exists():
            self.data_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.data_path, 'w') as f:
                json.dump({}, f)

    def _load_data(self) -> Dict:
        """Load the entire deadline database."""
        try:
            with open(self.data_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load deadlines: {e}")
            return {}

    def _save_data(self, data: Dict):
        """Save the deadline database."""
        try:
            with open(self.data_path, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save deadlines: {e}")

    def set_deadline(self, roadmap_id: str, deadline_date: str) -> Dict:
        """
        Set or update a deadline for a roadmap.
        
        Args:
            roadmap_id: Unique identifier for the roadmap
            deadline_date: ISO format date string (YYYY-MM-DD)
            
        Returns:
            The created/updated deadline object
        """
        data = self._load_data()
        
        # Calculate days remaining
        try:
            deadline_dt = datetime.strptime(deadline_date, "%Y-%m-%d")
            today = datetime.now()
            days_remaining = (deadline_dt - today).days + 1 # +1 to include the deadline day
        except ValueError:
            # Just store it even if calculation fails, validation should handle format
            days_remaining = 0

        record = {
            "roadmap_id": roadmap_id,
            "deadline": deadline_date,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        data[roadmap_id] = record
        self._save_data(data)
        
        # Add dynamic field for response
        record["days_remaining"] = days_remaining
        return record

    def get_deadline(self, roadmap_id: str) -> Optional[Dict]:
        """Get deadline for a roadmap."""
        data = self._load_data()
        record = data.get(roadmap_id)
        
        if record:
            # Recalculate days remaining on read
            try:
                deadline_dt = datetime.strptime(record["deadline"], "%Y-%m-%d")
                today = datetime.now()
                # Use .date() to compare just the dates, ignoring time
                days_remaining = (deadline_dt.date() - today.date()).days
                record["days_remaining"] = days_remaining
            except Exception as e:
                logger.error(f"Error calculating days remaining: {e}")
                record["days_remaining"] = None
                
        return record

    def delete_deadline(self, roadmap_id: str) -> bool:
        """Delete a deadline."""
        data = self._load_data()
        if roadmap_id in data:
            del data[roadmap_id]
            self._save_data(data)
            return True
        return False
