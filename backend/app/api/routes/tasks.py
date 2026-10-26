from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.care_task import CareTask
from app.models.patient import Patient
from app.models.user import User
from app.schemas.care_task import CareTaskCreate, CareTaskUpdate, CareTaskResponse
from app.api.dependencies import get_current_user
from app.agents.orchestrator import MultiAgentOrchestrator

router = APIRouter(prefix="/tasks", tags=["Care Tasks"])

@router.get("", response_model=List[CareTaskResponse])
def get_tasks(
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CareTask).filter(CareTask.tenant_id == current_user.tenant_id)
    if patient_id:
        query = query.filter(CareTask.patient_id == patient_id)
    return query.order_by(CareTask.created_at.desc()).all()

@router.post("", response_model=CareTaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: CareTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == task_in.patient_id).first()
    if not patient or patient.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found in this tenant.")

    task = CareTask(
        id=f"task-{uuid.uuid4().hex[:8]}",
        tenant_id=current_user.tenant_id,
        patient_id=task_in.patient_id,
        title=task_in.title,
        description=task_in.description,
        category=task_in.category,
        due_date=task_in.due_date,
        status="PENDING",
        priority=task_in.priority,
        assigned_to=task_in.assigned_to or current_user.full_name,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.patch("/{task_id}", response_model=CareTaskResponse)
def update_task(
    task_id: str,
    update_in: CareTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(CareTask).filter(CareTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    if task.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if update_in.status:
        task.status = update_in.status
    if update_in.priority:
        task.priority = update_in.priority
    if update_in.assigned_to:
        task.assigned_to = update_in.assigned_to
    if update_in.escalation_status:
        task.escalation_status = update_in.escalation_status

    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return task

@router.post("/escalate")
def trigger_escalation_engine(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers the Agent 5 background escalation engine to evaluate overdue tasks.
    """
    escalations = MultiAgentOrchestrator.evaluate_overdue_tasks(db, tenant_id=current_user.tenant_id)
    return {
        "status": "success",
        "evaluatedTenant": current_user.tenant_id,
        "escalatedCount": len(escalations),
        "escalations": escalations
    }
