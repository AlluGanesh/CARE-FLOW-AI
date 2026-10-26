from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CareTaskCreate(BaseModel):
    patient_id: str
    title: str
    description: Optional[str] = None
    category: str = "LAB_TEST"
    due_date: str
    priority: str = "MEDIUM"
    assigned_to: Optional[str] = None

class CareTaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    escalation_status: Optional[str] = None

class CareTaskResponse(BaseModel):
    id: str
    tenant_id: str
    patient_id: str
    title: str
    description: Optional[str] = None
    category: str
    due_date: str
    status: str
    priority: str
    assigned_to: Optional[str] = None
    escalation_level: int
    escalation_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
