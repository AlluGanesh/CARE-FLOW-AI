from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "CARE-FLOW AI Backend"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "careflow_super_secret_jwt_key_phase3_production_safe"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    DATABASE_URL: str = "sqlite:///./careflow.db"
    
    LLM_PROVIDER: str = "mock"  # "mock", "openai", "anthropic", "gemini"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    
    MAX_RESEARCH_TASKS: int = 20
    MAX_SOURCES_PER_TASK: int = 5
    MAX_RETRIES: int = 2
    RESEARCH_CACHE_TTL_HOURS: int = 24
    
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
