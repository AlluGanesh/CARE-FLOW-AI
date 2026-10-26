from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from app.models.care_task import CareTask
from app.models.audit import AuditEvent
from app.models.agent_run import AgentRun
from app.core.security import compute_audit_hash

class MultiAgentOrchestrator:
    """
    Central Orchestrator coordinating specialized healthcare agents:
    - Agent 1: Clinical Intake & Document Agent
    - Agent 2: Care Plan Generation Agent
    - Agent 3: Scheduling & Logistics Agent
    - Agent 4: Patient Monitoring & Adherence Agent
    - Agent 5: Emergency & Overdue Escalation Engine
    - Agent 6: Compliance & Tamper-Evident Audit Agent
    - Agent 7: Medical Research Agent (HITL-gated)
    """

    @classmethod
    def evaluate_overdue_tasks(cls, db: Session, tenant_id: str) -> List[Dict[str, Any]]:
        """
        Agent 5 Escalation Engine: Deterministically evaluates overdue care tasks,
        escalates unaddressed items, and registers audit events.
        """
        tasks = (
            db.query(CareTask)
            .filter(CareTask.tenant_id == tenant_id, CareTask.status == "OVERDUE")
            .all()
        )
        escalations = []

        for task in tasks:
            if task.escalation_status != "ESCALATED":
                task.escalation_level = min(task.escalation_level + 1, 2)
                task.escalation_status = "ESCALATED"
                
                # Create audit event
                last_event = (
                    db.query(AuditEvent)
                    .filter(AuditEvent.tenant_id == tenant_id)
                    .order_by(AuditEvent.timestamp.desc())
                    .first()
                )
                prev_hash = last_event.event_hash if last_event else None
                event_data = {
                    "tenant_id": tenant_id,
                    "event_type": "TASK_ESCALATED",
                    "resource_id": task.id,
                    "actor_id": "agent-05",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                event_hash = compute_audit_hash(prev_hash, event_data)

                audit_log = AuditEvent(
                    id=f"aud-{uuid.uuid4().hex[:12]}",
                    tenant_id=tenant_id,
                    actor_type="AGENT",
                    actor_id="agent-05",
                    actor_name="Agent 5 - Escalation Agent",
                    event_type="TASK_ESCALATED",
                    resource_type="CARE_TASK",
                    resource_id=task.id,
                    timestamp=datetime.now(timezone.utc),
                    metadata_info={"priority": task.priority, "taskTitle": task.title, "escalationLevel": task.escalation_level},
                    prev_event_hash=prev_hash,
                    event_hash=event_hash
                )
                db.add(audit_log)

                # Record agent trace
                trace = AgentRun(
                    id=f"tr-{uuid.uuid4().hex[:12]}",
                    agent_number=5,
                    agent_name="Escalation Agent",
                    state="EXECUTE",
                    status="FLAGGED",
                    latency_ms=180,
                    log_message=f"Task '{task.title}' reached overdue threshold. Raised escalation level to {task.escalation_level}.",
                    tool_calls=["evaluate_overdue_tasks()", "trigger_escalation()"],
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(trace)

                escalations.append({
                    "taskId": task.id,
                    "title": task.title,
                    "patientId": task.patient_id,
                    "level": task.escalation_level
                })

        db.commit()
        return escalations
