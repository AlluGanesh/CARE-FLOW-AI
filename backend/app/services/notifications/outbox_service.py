from datetime import datetime, timezone
from typing import Dict, Any, Optional
import uuid
from sqlalchemy.orm import Session
from app.models.notification import NotificationOutbox
from app.core.logging import app_logger

class NotificationOutboxService:
    """
    Asynchronous notification dispatcher for patient follow-up and clinical alerts.
    Dispatches to multi-channel queues (IN_APP, SMS, WHATSAPP, EMAIL).
    """

    @classmethod
    def enqueue_notification(
        cls,
        db: Session,
        tenant_id: str,
        patient_id: str,
        channel: str,
        template: str,
        payload: Dict[str, Any]
    ) -> NotificationOutbox:
        notification = NotificationOutbox(
            id=f"notif-{uuid.uuid4().hex[:12]}",
            tenant_id=tenant_id,
            patient_id=patient_id,
            channel=channel,
            template=template,
            payload=payload,
            status="PENDING",
            attempt_count=0,
            created_at=datetime.now(timezone.utc)
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        # Mock dispatch delivery
        cls.dispatch_pending(db, notification.id)
        return notification

    @classmethod
    def dispatch_pending(cls, db: Session, notification_id: str) -> bool:
        record = db.query(NotificationOutbox).filter(NotificationOutbox.id == notification_id).first()
        if not record:
            return False

        try:
            record.attempt_count += 1
            # Mock provider delivery simulation
            record.status = "SENT"
            record.sent_at = datetime.now(timezone.utc)
            db.commit()
            app_logger.info(f"Notification {record.id} successfully dispatched via {record.channel}")
            return True
        except Exception as e:
            record.status = "FAILED"
            db.commit()
            app_logger.error(f"Failed to dispatch notification {record.id}: {str(e)}")
            return False
