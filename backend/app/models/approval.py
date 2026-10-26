from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import Optional

class HumanApproval(Base):
    __tablename__ = "human_approvals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    research_run_id: Mapped[str] = mapped_column(String(64), ForeignKey("research_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id: Mapped[str] = mapped_column(String(64), nullable=False)
    reviewer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    decision: Mapped[str] = mapped_column(String(32), nullable=False)  # APPROVED, REJECTED, REVISION_REQUESTED
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    research_run: Mapped["ResearchRun"] = relationship("ResearchRun", back_populates="approvals")
