from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class AuditEventResponse(BaseModel):
    id: str
    tenant_id: str
    actor_type: str
    actor_id: str
    actor_name: str
    event_type: str
    resource_type: str
    resource_id: str
    timestamp: datetime
    metadata_info: Optional[Dict[str, Any]] = None
    prev_event_hash: Optional[str] = None
    event_hash: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
