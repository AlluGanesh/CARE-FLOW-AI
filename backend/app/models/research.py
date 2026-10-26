from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import List, Optional, Any

class ResearchRun(Base):
    __tablename__ = "research_runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id: Mapped[str] = mapped_column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(64), default="PLANNING", index=True)
    # PLANNING, RESEARCHING, RETRIEVING_SOURCES, VERIFYING_EVIDENCE, GENERATING_EXPLANATION, SAFETY_CHECK, WAITING_FOR_APPROVAL, APPROVED, REJECTED, COMPLETED, PARTIAL, FAILED
    mode: Mapped[str] = mapped_column(String(64), default="FULL_AGENTIC")  # DETERMINISTIC, ASSISTED, FULL_AGENTIC
    started_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    
    report_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    report_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    result_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    
    progress: Mapped[int] = mapped_column(Integer, default=0)
    safety_status: Mapped[str] = mapped_column(String(32), default="PENDING")  # PENDING, PASSED, FAILED
    evidence_status: Mapped[str] = mapped_column(String(32), default="PENDING")  # PENDING, SUFFICIENT, PARTIAL, INSUFFICIENT, CONFLICTING
    
    revision_count: Mapped[int] = mapped_column(Integer, default=0)
    last_clinician_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="research_runs")
    patient: Mapped["Patient"] = relationship("Patient", back_populates="research_runs")
    tasks: Mapped[List["ResearchTask"]] = relationship("ResearchTask", back_populates="research_run", cascade="all, delete-orphan")
    sources: Mapped[List["ResearchSource"]] = relationship("ResearchSource", back_populates="research_run", cascade="all, delete-orphan")
    evidence: Mapped[List["ResearchEvidence"]] = relationship("ResearchEvidence", back_populates="research_run", cascade="all, delete-orphan")
    claims: Mapped[List["ResearchClaim"]] = relationship("ResearchClaim", back_populates="research_run", cascade="all, delete-orphan")
    citations: Mapped[List["ResearchCitation"]] = relationship("ResearchCitation", back_populates="research_run", cascade="all, delete-orphan")
    approvals: Mapped[List["HumanApproval"]] = relationship("HumanApproval", back_populates="research_run", cascade="all, delete-orphan")
    agent_runs: Mapped[List["AgentRun"]] = relationship("AgentRun", back_populates="research_run", cascade="all, delete-orphan")

class ResearchTask(Base):
    __tablename__ = "research_tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    research_run_id: Mapped[str] = mapped_column(String(64), ForeignKey("research_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_id: Mapped[str] = mapped_column(String(128), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    task_type: Mapped[str] = mapped_column(String(64), nullable=False)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(32), default="MEDIUM")
    status: Mapped[str] = mapped_column(String(32), default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, FAILED, SKIPPED
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    research_run: Mapped["ResearchRun"] = relationship("ResearchRun", back_populates="tasks")

class ResearchSource(Base):
    __tablename__ = "research_sources"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    research_run_id: Mapped[str] = mapped_column(String(64), ForeignKey("research_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    organization: Mapped[str] = mapped_column(String(128), nullable=False)
    tier: Mapped[int] = mapped_column(Integer, default=1)
    retrieved_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    content_snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    research_run: Mapped["ResearchRun"] = relationship("ResearchRun", back_populates="sources")

class ResearchEvidence(Base):
    __tablename__ = "research_evidence"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    research_run_id: Mapped[str] = mapped_column(String(64), ForeignKey("research_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    entity_name: Mapped[str] = mapped_column(String(128), nullable=False)
    claim_text: Mapped[str] = mapped_column(Text, nullable=False)
    snippet: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.9)
    status: Mapped[str] = mapped_column(String(32), default="VERIFIED")  # VERIFIED, UNVERIFIED, CONFLICTING

    research_run: Mapped["ResearchRun"] = relationship("ResearchRun", back_populates="evidence")

class ResearchClaim(Base):
    __tablename__ = "research_claims"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    research_run_id: Mapped[str] = mapped_column(String(64), ForeignKey("research_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    predicate: Mapped[str] = mapped_column(Text, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=True)
    support_level: Mapped[str] = mapped_column(String(32), default="SUPPORTED")  # SUPPORTED, PARTIAL, CONTRADICTED

    research_run: Mapped["ResearchRun"] = relationship("ResearchRun", back_populates="claims")

class ResearchCitation(Base):
    __tablename__ = "research_citations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    research_run_id: Mapped[str] = mapped_column(String(64), ForeignKey("research_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    source_title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str] = mapped_column(String(512), nullable=False)
    organization: Mapped[str] = mapped_column(String(128), nullable=False)
    citation_text: Mapped[str] = mapped_column(Text, nullable=False)

    research_run: Mapped["ResearchRun"] = relationship("ResearchRun", back_populates="citations")
