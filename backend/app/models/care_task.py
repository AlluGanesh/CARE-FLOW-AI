from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import Optional

class CareTask(Base):
    __tablename__ = "care_tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id: Mapped[str] = mapped_column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(64), default="LAB_TEST")  # MEDICATION, LAB_TEST, APPOINTMENT, LIFESTYLE, VITAL_CHECK
    due_date: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="PENDING", index=True)  # DRAFT, APPROVED, PENDING, COMPLETED, OVERDUE, ESCALATED, CANCELLED
    priority: Mapped[str] = mapped_column(String(32), default="MEDIUM")
    assigned_to: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    escalation_level: Mapped[int] = mapped_column(Integer, default=0)
    escalation_status: Mapped[str] = mapped_column(String(32), default="NONE")  # NONE, FLAGGED, ESCALATED, RESOLVED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="care_tasks")
    patient: Mapped["Patient"] = relationship("Patient", back_populates="care_tasks")
