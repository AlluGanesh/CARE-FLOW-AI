from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
from typing import Optional, Any

class NotificationOutbox(Base):
    __tablename__ = "notification_outbox"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id: Mapped[str] = mapped_column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    channel: Mapped[str] = mapped_column(String(32), default="IN_APP")  # EMAIL, SMS, WHATSAPP, IN_APP
    template: Mapped[str] = mapped_column(String(128), nullable=False)
    payload: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="PENDING", index=True)  # PENDING, SENT, FAILED
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
