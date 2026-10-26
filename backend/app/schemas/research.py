from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class CreateResearchRunRequest(BaseModel):
    patient_id: str
    report_text: str
    report_title: Optional[str] = "Diagnostic Clinical Report"
    mode: Optional[str] = "FULL_AGENTIC"  # DETERMINISTIC, ASSISTED, FULL_AGENTIC

class ResearchRunStatusResponse(BaseModel):
    id: str
    status: str
    progress: int
    tasksCompleted: int
    tasksTotal: int
    safetyStatus: str
    evidenceStatus: str
    revisionCount: int
    startedAt: datetime
    completedAt: Optional[datetime] = None
    errorMessage: Optional[str] = None

class ClinicianReviewAction(BaseModel):
    reason: Optional[str] = "Clinician review performed and verified."

class ClinicianRevisionRequest(BaseModel):
    feedback: str = Field(..., min_length=3, description="Specific feedback or guidelines for the agent to re-research")

class ResearchResultResponse(BaseModel):
    id: str
    patientId: str
    status: str
    progress: int
    safetyStatus: str
    evidenceStatus: str
    researchMode: str
    revisionCount: int
    lastClinicianFeedback: Optional[str] = None
    isClinicianApproved: bool
    result: Optional[Dict[str, Any]] = None
    startedAt: datetime
    completedAt: Optional[datetime] = None
