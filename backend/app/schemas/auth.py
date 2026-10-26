from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: str
    tenant_id: str

class UserProfile(BaseModel):
    id: str
    tenant_id: str
    email: str
    full_name: str
    role: str
