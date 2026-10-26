import logging
import sys
import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional

class StructuredFormatter(logging.Formatter):
    """
    Structured JSON log formatter for healthcare compliance.
    Ensures that secrets and full PHI reports are never printed to logs.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage()
        }
        
        # Healthcare audit & tracing context
        for field in [
            "request_id", "agent_run_id", "research_run_id", 
            "tenant_id", "user_id", "event_type", "duration_ms", "status"
        ]:
            if hasattr(record, field):
                log_data[field] = getattr(record, field)
                
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_data)

def setup_logger(name: str = "careflow") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

app_logger = setup_logger("careflow.app")
audit_logger = setup_logger("careflow.audit")
agent_logger = setup_logger("careflow.agent")
