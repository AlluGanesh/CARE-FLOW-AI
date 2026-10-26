from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import List, Optional, Any

class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(32), nullable=False)
    primary_condition: Mapped[str] = mapped_column(String(255), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(32), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    phone: Mapped[str] = mapped_column(String(64), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    metadata_info: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="patients")
    research_runs: Mapped[List["ResearchRun"]] = relationship("ResearchRun", back_populates="patient", cascade="all, delete-orphan")
    care_tasks: Mapped[List["CareTask"]] = relationship("CareTask", back_populates="patient", cascade="all, delete-orphan")
