from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.db.session import get_db
from app.models.approval import HumanApproval
from app.models.research import ResearchRun
from app.models.user import User
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/approvals", tags=["Human Approvals"])

class HumanApprovalResponse(BaseModel):
    id: str
    research_run_id: str
    reviewer_id: str
    reviewer_name: str
    decision: str
    reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

@router.get("", response_model=List[HumanApprovalResponse])
def get_approval_ledger(
    research_run_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        db.query(HumanApproval)
        .join(ResearchRun, HumanApproval.research_run_id == ResearchRun.id)
        .filter(ResearchRun.tenant_id == current_user.tenant_id)
    )
    if research_run_id:
        query = query.filter(HumanApproval.research_run_id == research_run_id)

    return query.order_by(HumanApproval.created_at.desc()).all()
