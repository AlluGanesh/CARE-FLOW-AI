from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.db.session import get_db
from app.models.research import ResearchRun, ResearchTask
from app.models.approval import HumanApproval
from app.models.patient import Patient
from app.models.user import User
from app.schemas.research import (
    CreateResearchRunRequest,
    ResearchRunStatusResponse,
    ClinicianReviewAction,
    ClinicianRevisionRequest,
    ResearchResultResponse
)
from app.api.dependencies import get_current_user, require_roles
from app.agents.research_agent import MedicalResearchAgent

router = APIRouter(prefix="/research", tags=["Research Agent"])

async def run_agent_in_background(db_factory, tenant_id: str, run_id: str, report_text: str, feedback: Optional[str] = None):
    """
    Background executor for Agent 7 autonomous research loop.
    """
    db = db_factory()
    try:
        agent = MedicalResearchAgent(db, tenant_id=tenant_id, run_id=run_id)
        await agent.execute_research_cycle(report_text=report_text, clinician_feedback=feedback)
    finally:
        db.close()

@router.post("/runs", status_code=status.HTTP_201_CREATED)
async def create_research_run(
    req: CreateResearchRunRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiates an autonomous research run for a patient report.
    Enforces tenant boundaries and triggers Agent 7 state machine.
    """
    # Verify patient belongs to user's tenant
    patient = db.query(Patient).filter(Patient.id == req.patient_id).first()
    if not patient or patient.tenant_id != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {req.patient_id} not found in this tenant."
        )

    run_id = f"run-{uuid.uuid4().hex[:12]}"
    run = ResearchRun(
        id=run_id,
        tenant_id=current_user.tenant_id,
        patient_id=req.patient_id,
        status="PLANNING",
        mode=req.mode or "FULL_AGENTIC",
        started_at=datetime.now(timezone.utc),
        created_by=current_user.id,
        report_title=req.report_title,
        report_text=req.report_text,
        progress=10,
        safety_status="PENDING",
        evidence_status="PENDING"
    )
    db.add(run)
    db.commit()

    # Launch autonomous agent research cycle
    agent = MedicalResearchAgent(db, tenant_id=current_user.tenant_id, run_id=run_id)
    await agent.execute_research_cycle(report_text=req.report_text)

    return {
        "id": run.id,
        "researchRunId": run.id,
        "patientId": run.patient_id,
        "status": run.status,
        "progress": run.progress
    }

@router.get("/runs/{run_id}", response_model=ResearchRunStatusResponse)
def get_research_run_status(
    run_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns real-time execution status and progress of a research run.
    """
    run = db.query(ResearchRun).filter(ResearchRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research run not found.")

    if run.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to research run.")

    total_tasks = db.query(ResearchTask).filter(ResearchTask.research_run_id == run_id).count()
    completed_tasks = db.query(ResearchTask).filter(
        ResearchTask.research_run_id == run_id, 
        ResearchTask.status == "COMPLETED"
    ).count()

    return ResearchRunStatusResponse(
        id=run.id,
        status=run.status,
        progress=run.progress,
        tasksCompleted=completed_tasks,
        tasksTotal=total_tasks,
        safetyStatus=run.safety_status,
        evidenceStatus=run.evidence_status,
        revisionCount=run.revision_count,
        startedAt=run.started_at,
        completedAt=run.completed_at,
        errorMessage=run.error_message
    )

@router.get("/runs/{run_id}/result")
def get_research_run_result(
    run_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the grounded clinical research result.
    Enforces Patient Visibility Boundary: Patients cannot view research until approved by a clinician.
    """
    run = db.query(ResearchRun).filter(ResearchRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research run not found.")

    if run.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to research run.")

    is_approved = run.status in ["APPROVED", "COMPLETED"]

    # Patient visibility enforcement
    if current_user.role.upper() == "PATIENT" and not is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Educational research results are currently awaiting clinician review and approval before release."
        )

    res_data = run.result_json or {}

    # If patient, ensure internal reasoning / traces are omitted
    if current_user.role.upper() == "PATIENT":
        res_data = {
            "conditions": res_data.get("conditions", []),
            "tests": res_data.get("tests", []),
            "medicines": res_data.get("medicines", []),
            "medicalTerms": res_data.get("medicalTerms", []),
            "citations": res_data.get("citations", []),
            "explanation": res_data.get("explanation", ""),
            "safetyStatus": "PASSED",
            "isClinicianApproved": True,
            "patientNotice": (
                "This educational summary has been reviewed by your care team. "
                "It does not replace your doctor's medical advice or modify any prescription."
            )
        }

    return {
        "id": run.id,
        "patientId": run.patient_id,
        "status": run.status,
        "progress": run.progress,
        "safetyStatus": run.safety_status,
        "evidenceStatus": run.evidence_status,
        "researchMode": run.mode,
        "revisionCount": run.revision_count,
        "lastClinicianFeedback": run.last_clinician_feedback,
        "isClinicianApproved": is_approved,
        "result": res_data,
        "startedAt": run.started_at,
        "completedAt": run.completed_at
    }

@router.post("/runs/{run_id}/approve")
def approve_research_run(
    run_id: str,
    action: ClinicianReviewAction,
    current_user: User = Depends(require_roles(["CLINICIAN", "DOCTOR"])),
    db: Session = Depends(get_db)
):
    """
    Clinician approval gate. Approves research for patient release and registers audit trail.
    """
    run = db.query(ResearchRun).filter(ResearchRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research run not found.")

    if run.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if run.status not in ["WAITING_FOR_APPROVAL", "SAFETY_CHECK"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve run in state '{run.status}'. Must be in WAITING_FOR_APPROVAL."
        )

    # Persist approval record
    approval = HumanApproval(
        id=f"appr-{uuid.uuid4().hex[:10]}",
        research_run_id=run.id,
        reviewer_id=current_user.id,
        reviewer_name=current_user.full_name,
        decision="APPROVED",
        reason=action.reason,
        created_at=datetime.now(timezone.utc)
    )
    db.add(approval)

    run.status = "APPROVED"
    run.progress = 100
    run.completed_at = datetime.now(timezone.utc)
    if run.result_json:
        result_copy = dict(run.result_json)
        result_copy["isClinicianApproved"] = True
        run.result_json = result_copy

    db.commit()

    agent = MedicalResearchAgent(db, tenant_id=current_user.tenant_id, run_id=run.id)
    agent._record_audit_event(
        event_type="RESEARCH_APPROVED",
        resource_id=run.id,
        resource_type="RESEARCH_RUN",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_type="CLINICIAN",
        metadata={"reason": action.reason}
    )

    return {"status": "APPROVED", "message": "Research run approved by clinician. Visible to patient."}

@router.post("/runs/{run_id}/reject")
def reject_research_run(
    run_id: str,
    action: ClinicianReviewAction,
    current_user: User = Depends(require_roles(["CLINICIAN", "DOCTOR"])),
    db: Session = Depends(get_db)
):
    """
    Clinician rejection. Blocks research from patient release.
    """
    run = db.query(ResearchRun).filter(ResearchRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research run not found.")

    if run.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    approval = HumanApproval(
        id=f"appr-{uuid.uuid4().hex[:10]}",
        research_run_id=run.id,
        reviewer_id=current_user.id,
        reviewer_name=current_user.full_name,
        decision="REJECTED",
        reason=action.reason,
        created_at=datetime.now(timezone.utc)
    )
    db.add(approval)

    run.status = "REJECTED"
    run.completed_at = datetime.now(timezone.utc)
    db.commit()

    agent = MedicalResearchAgent(db, tenant_id=current_user.tenant_id, run_id=run.id)
    agent._record_audit_event(
        event_type="RESEARCH_REJECTED",
        resource_id=run.id,
        resource_type="RESEARCH_RUN",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_type="CLINICIAN",
        metadata={"reason": action.reason}
    )

    return {"status": "REJECTED", "message": "Research run rejected. Output will not be released."}

@router.post("/runs/{run_id}/revision")
async def request_research_revision(
    run_id: str,
    req: ClinicianRevisionRequest,
    current_user: User = Depends(require_roles(["CLINICIAN", "DOCTOR"])),
    db: Session = Depends(get_db)
):
    """
    Clinician revision loop. Triggers a new research iteration addressing clinician feedback.
    Demonstrates genuine Agentic AI iterative refinement.
    """
    run = db.query(ResearchRun).filter(ResearchRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research run not found.")

    if run.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    approval = HumanApproval(
        id=f"appr-{uuid.uuid4().hex[:10]}",
        research_run_id=run.id,
        reviewer_id=current_user.id,
        reviewer_name=current_user.full_name,
        decision="REVISION_REQUESTED",
        reason=req.feedback,
        created_at=datetime.now(timezone.utc)
    )
    db.add(approval)

    run.revision_count += 1
    run.last_clinician_feedback = req.feedback
    run.status = "PLANNING"
    run.progress = 20
    db.commit()

    agent = MedicalResearchAgent(db, tenant_id=current_user.tenant_id, run_id=run.id)
    agent._record_audit_event(
        event_type="RESEARCH_REVISION_REQUESTED",
        resource_id=run.id,
        resource_type="RESEARCH_RUN",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_type="CLINICIAN",
        metadata={"feedback": req.feedback, "revisionNumber": run.revision_count}
    )

    # Re-execute research cycle with clinician feedback
    await agent.execute_research_cycle(report_text=run.report_text or "", clinician_feedback=req.feedback)

    return {
        "status": run.status,
        "revisionCount": run.revision_count,
        "message": "Revision cycle executed with clinician feedback."
    }

@router.get("/runs", response_model=List[ResearchRunStatusResponse])
def list_research_runs(
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ResearchRun).filter(ResearchRun.tenant_id == current_user.tenant_id)
    if patient_id:
        query = query.filter(ResearchRun.patient_id == patient_id)

    runs = query.order_by(ResearchRun.started_at.desc()).all()
    results = []
    for r in runs:
        total_tasks = db.query(ResearchTask).filter(ResearchTask.research_run_id == r.id).count()
        completed_tasks = db.query(ResearchTask).filter(
            ResearchTask.research_run_id == r.id, 
            ResearchTask.status == "COMPLETED"
        ).count()
        results.append(ResearchRunStatusResponse(
            id=r.id,
            status=r.status,
            progress=r.progress,
            tasksCompleted=completed_tasks,
            tasksTotal=total_tasks,
            safetyStatus=r.safety_status,
            evidenceStatus=r.evidence_status,
            revisionCount=r.revision_count,
            startedAt=r.started_at,
            completedAt=r.completed_at,
            errorMessage=r.error_message
        ))
    return results
