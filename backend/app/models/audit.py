from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import Optional, Any

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_type: Mapped[str] = mapped_column(String(32), default="SYSTEM")  # SYSTEM, CLINICIAN, AGENT, PATIENT
    actor_id: Mapped[str] = mapped_column(String(64), nullable=False)
    actor_name: Mapped[str] = mapped_column(String(255), default="System Orchestrator")
    event_type: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(64), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(64), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    metadata_info: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    
    # Tamper-evident cryptographic chaining
    prev_event_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    event_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="audit_events")
