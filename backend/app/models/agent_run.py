from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import Optional, Any

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    research_run_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("research_runs.id", ondelete="CASCADE"), nullable=True, index=True)
    agent_number: Mapped[int] = mapped_column(Integer, default=7)
    agent_name: Mapped[str] = mapped_column(String(128), default="Medical Research Agent")
    state: Mapped[str] = mapped_column(String(64), default="OBSERVE")  # OBSERVE, PLAN, ACT, VERIFY, SAFETY_CHECK, WAITING_FOR_APPROVAL, EXECUTE, AUDIT, COMPLETED, FAILED
    status: Mapped[str] = mapped_column(String(32), default="SUCCESS")  # SUCCESS, FLAGGED, RUNNING, FAILED
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    log_message: Mapped[str] = mapped_column(Text, nullable=False)
    tool_calls: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    research_run: Mapped[Optional["ResearchRun"]] = relationship("ResearchRun", back_populates="agent_runs")
