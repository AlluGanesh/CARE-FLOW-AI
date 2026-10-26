from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import List

class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    users: Mapped[List["User"]] = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    patients: Mapped[List["Patient"]] = relationship("Patient", back_populates="tenant", cascade="all, delete-orphan")
    research_runs: Mapped[List["ResearchRun"]] = relationship("ResearchRun", back_populates="tenant", cascade="all, delete-orphan")
    care_tasks: Mapped[List["CareTask"]] = relationship("CareTask", back_populates="tenant", cascade="all, delete-orphan")
    audit_events: Mapped[List["AuditEvent"]] = relationship("AuditEvent", back_populates="tenant", cascade="all, delete-orphan")
