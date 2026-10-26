from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    primary_condition: str
    risk_level: str = "MEDIUM"
    phone: Optional[str] = None
    email: Optional[str] = None
    metadata_info: Optional[Dict[str, Any]] = None

class PatientCreate(PatientBase):
    id: Optional[str] = None

class PatientResponse(PatientBase):
    id: str
    tenant_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
