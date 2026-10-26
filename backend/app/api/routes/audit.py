from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.db.session import get_db
from app.models.audit import AuditEvent
from app.models.user import User
from app.schemas.audit import AuditEventResponse
from app.api.dependencies import get_current_user
from app.core.security import compute_audit_hash

router = APIRouter(prefix="/audit", tags=["Audit Log"])

@router.get("", response_model=List[AuditEventResponse])
def get_audit_events(
    resource_id: Optional[str] = None,
    event_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns append-only audit events strictly scoped to the authenticated tenant.
    """
    query = db.query(AuditEvent).filter(AuditEvent.tenant_id == current_user.tenant_id)
    if resource_id:
        query = query.filter(AuditEvent.resource_id == resource_id)
    if event_type:
        query = query.filter(AuditEvent.event_type == event_type)

    return query.order_by(AuditEvent.timestamp.desc()).all()

@router.get("/verify-integrity")
def verify_audit_integrity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifies the cryptographic SHA-256 hash chaining of audit events for this tenant.
    Detects any unauthorized modification, deletion, or tampering in the database layer.
    """
    events = (
        db.query(AuditEvent)
        .filter(AuditEvent.tenant_id == current_user.tenant_id)
        .order_by(AuditEvent.id.asc())
        .all()
    )

    if not events:
        return {"status": "VERIFIED", "totalEvents": 0, "message": "No audit records in chain."}

    prev_hash = None
    for idx, ev in enumerate(events):
        ts_str = ev.timestamp.strftime("%Y-%m-%dT%H:%M:%SZ") if hasattr(ev.timestamp, "strftime") else str(ev.timestamp)
        event_data = {
            "tenant_id": ev.tenant_id,
            "event_type": ev.event_type,
            "resource_id": ev.resource_id,
            "actor_id": ev.actor_id,
            "timestamp": ts_str
        }
        expected_hash = compute_audit_hash(ev.prev_event_hash, event_data)
        
        # Verify hash match and chain integrity
        if ev.event_hash != expected_hash or ev.prev_event_hash != prev_hash:
            return {
                "status": "TAMPER_DETECTED",
                "verified": False,
                "brokenAtEventId": ev.id,
                "eventIndex": idx,
                "message": f"Cryptographic integrity failed at event {ev.id}."
            }

        prev_hash = ev.event_hash

    return {
        "status": "VERIFIED",
        "verified": True,
        "totalEvents": len(events),
        "latestHash": prev_hash,
        "message": "Cryptographic tamper-evident hash chaining is valid across all audit events."
    }
