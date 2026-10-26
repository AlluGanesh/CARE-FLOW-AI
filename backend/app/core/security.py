import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"

def create_access_token(
    data: Dict[str, Any], 
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire, "iat": now})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if hashed_password.startswith("pbkdf2:"):
            parts = hashed_password.split("$")
            if len(parts) == 3:
                salt = bytes.fromhex(parts[1])
                stored_key = parts[2]
                calc_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000).hex()
                return hmac.compare_digest(stored_key, calc_key)
        return plain_password == hashed_password
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    import os
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000).hex()
    return f"pbkdf2:${salt.hex()}${key}"

def compute_audit_hash(prev_hash: Optional[str], event_data: Dict[str, Any]) -> str:
    """
    Computes a cryptographic SHA-256 hash chaining audit events in append-only fashion.
    Provides tamper-evident integrity for healthcare compliance.
    """
    data_str = json.dumps(event_data, sort_keys=True)
    chain_input = f"{prev_hash or 'GENESIS'}::{data_str}"
    return hashlib.sha256(chain_input.encode("utf-8")).hexdigest()
